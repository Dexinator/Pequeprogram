import { spawn } from 'child_process';

/**
 * Sends raw bytes to a Windows printer by spooler name, using PowerShell to
 * call the Win32 winspool.drv API (OpenPrinter / WritePrinter / ClosePrinter).
 *
 * No native node modules required: we shell out to powershell.exe, which is
 * present on every supported Windows version. Bytes are passed via stdin
 * (base64-encoded to survive PowerShell's pipeline encoding) so we don't
 * touch the filesystem and so payloads don't show up in command-line logs.
 */
export async function printRawBytesWindows(
  printerName: string,
  bytes: Buffer
): Promise<void> {
  if (!printerName) {
    throw new Error('No se configuró el nombre de la impresora de Windows.');
  }

  const base64 = bytes.toString('base64');
  const escapedName = printerName.replace(/'/g, "''");

  const script = `
$ErrorActionPreference = 'Stop'

Add-Type -Namespace EpqRawPrint -Name Spooler -MemberDefinition @'
[StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
public struct DOCINFO {
    [MarshalAs(UnmanagedType.LPWStr)] public string pDocName;
    [MarshalAs(UnmanagedType.LPWStr)] public string pOutputFile;
    [MarshalAs(UnmanagedType.LPWStr)] public string pDataType;
}
[DllImport("winspool.drv", CharSet = CharSet.Unicode, ExactSpelling = false, CallingConvention = CallingConvention.StdCall, SetLastError = true)]
public static extern bool OpenPrinter(string szPrinter, out IntPtr hPrinter, IntPtr pd);
[DllImport("winspool.drv", CharSet = CharSet.Unicode, ExactSpelling = false, CallingConvention = CallingConvention.StdCall, SetLastError = true)]
public static extern bool ClosePrinter(IntPtr hPrinter);
[DllImport("winspool.drv", CharSet = CharSet.Unicode, ExactSpelling = false, CallingConvention = CallingConvention.StdCall, SetLastError = true)]
public static extern bool StartDocPrinter(IntPtr hPrinter, Int32 level, ref DOCINFO pDocInfo);
[DllImport("winspool.drv", CharSet = CharSet.Unicode, ExactSpelling = false, CallingConvention = CallingConvention.StdCall, SetLastError = true)]
public static extern bool EndDocPrinter(IntPtr hPrinter);
[DllImport("winspool.drv", CharSet = CharSet.Unicode, ExactSpelling = false, CallingConvention = CallingConvention.StdCall, SetLastError = true)]
public static extern bool StartPagePrinter(IntPtr hPrinter);
[DllImport("winspool.drv", CharSet = CharSet.Unicode, ExactSpelling = false, CallingConvention = CallingConvention.StdCall, SetLastError = true)]
public static extern bool EndPagePrinter(IntPtr hPrinter);
[DllImport("winspool.drv", CharSet = CharSet.Unicode, ExactSpelling = false, CallingConvention = CallingConvention.StdCall, SetLastError = true)]
public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, Int32 dwCount, out Int32 dwWritten);
'@

$base64 = [Console]::In.ReadToEnd()
$bytes = [Convert]::FromBase64String($base64.Trim())

$printer = '${escapedName}'
$handle = [IntPtr]::Zero
if (-not [EpqRawPrint.Spooler]::OpenPrinter($printer, [ref]$handle, [IntPtr]::Zero)) {
    throw "OpenPrinter falló para '$printer' (¿el nombre es exacto?). Win32 error: $([Runtime.InteropServices.Marshal]::GetLastWin32Error())"
}
try {
    $doc = New-Object EpqRawPrint.Spooler+DOCINFO
    $doc.pDocName    = 'Entrepeques POS Raw Print'
    $doc.pOutputFile = $null
    $doc.pDataType   = 'RAW'

    if (-not [EpqRawPrint.Spooler]::StartDocPrinter($handle, 1, [ref]$doc)) {
        throw "StartDocPrinter falló. Win32 error: $([Runtime.InteropServices.Marshal]::GetLastWin32Error())"
    }
    try {
        if (-not [EpqRawPrint.Spooler]::StartPagePrinter($handle)) {
            throw "StartPagePrinter falló. Win32 error: $([Runtime.InteropServices.Marshal]::GetLastWin32Error())"
        }
        try {
            $ptr = [Runtime.InteropServices.Marshal]::AllocHGlobal($bytes.Length)
            try {
                [Runtime.InteropServices.Marshal]::Copy($bytes, 0, $ptr, $bytes.Length)
                $written = 0
                if (-not [EpqRawPrint.Spooler]::WritePrinter($handle, $ptr, $bytes.Length, [ref]$written)) {
                    throw "WritePrinter falló. Win32 error: $([Runtime.InteropServices.Marshal]::GetLastWin32Error())"
                }
                if ($written -ne $bytes.Length) {
                    throw "WritePrinter solo escribió $written de $($bytes.Length) bytes."
                }
            }
            finally {
                [Runtime.InteropServices.Marshal]::FreeHGlobal($ptr)
            }
        }
        finally {
            [void][EpqRawPrint.Spooler]::EndPagePrinter($handle)
        }
    }
    finally {
        [void][EpqRawPrint.Spooler]::EndDocPrinter($handle)
    }
}
finally {
    [void][EpqRawPrint.Spooler]::ClosePrinter($handle)
}
`;

  await runPowerShell(script, base64);
}

function runPowerShell(script: string, stdin: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { windowsHide: true }
    );

    let stderr = '';
    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`PowerShell salió con código ${code}: ${stderr.trim() || 'sin salida'}`));
      }
    });

    child.stdin.write(stdin, 'utf8');
    child.stdin.end();
  });
}
