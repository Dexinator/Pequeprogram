import { promises as fs } from 'fs';

/**
 * Sends raw bytes to a printer on Linux/macOS by writing directly to a USB
 * device path (typically /dev/usb/lpN on Linux). The user running the bridge
 * must have access to that device — usually via membership in the `lp` group
 * or an udev rule.
 */
export async function printRawBytesPosix(devicePath: string, bytes: Buffer): Promise<void> {
  if (!devicePath) {
    throw new Error('No se configuró el path del dispositivo USB.');
  }

  let handle;
  try {
    handle = await fs.open(devicePath, 'w');
    await handle.write(bytes);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw new Error(
        `No existe el dispositivo ${devicePath}. ¿La impresora está conectada y prendida?`
      );
    }
    if (err.code === 'EACCES' || err.code === 'EPERM') {
      throw new Error(
        `Permiso denegado al escribir a ${devicePath}. El usuario del servicio debe pertenecer al grupo "lp" o tener una regla udev que conceda acceso.`
      );
    }
    throw err;
  } finally {
    if (handle) await handle.close();
  }
}
