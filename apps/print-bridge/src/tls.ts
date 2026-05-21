import fs from 'fs';
import path from 'path';
import { generate } from 'selfsigned';

interface CertBundle {
  key: string;
  cert: string;
}

const CERT_DIR = path.resolve(process.cwd(), 'certs');
const KEY_PATH = path.join(CERT_DIR, 'bridge.key');
const CERT_PATH = path.join(CERT_DIR, 'bridge.crt');

/**
 * Loads the bridge's TLS certificate, generating one on first run. Browsers
 * loaded from https://...vercel.app need the bridge to also speak HTTPS,
 * otherwise mixed-content blocks the request. We use a long-lived
 * self-signed cert because the user only needs to accept it once per machine.
 */
export async function ensureCertificate(): Promise<CertBundle> {
  if (fs.existsSync(KEY_PATH) && fs.existsSync(CERT_PATH)) {
    return {
      key: fs.readFileSync(KEY_PATH, 'utf8'),
      cert: fs.readFileSync(CERT_PATH, 'utf8'),
    };
  }

  const attrs = [{ name: 'commonName', value: 'entrepeques-print-bridge.local' }];
  const notBefore = new Date();
  const notAfter = new Date();
  notAfter.setFullYear(notAfter.getFullYear() + 10);

  const pems = await generate(attrs, {
    keySize: 2048,
    algorithm: 'sha256',
    notBeforeDate: notBefore,
    notAfterDate: notAfter,
    extensions: [
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 2, value: 'entrepeques-print-bridge.local' },
          { type: 7, ip: '127.0.0.1' },
          { type: 7, ip: '::1' },
        ],
      },
      { name: 'basicConstraints', cA: false },
      {
        name: 'keyUsage',
        digitalSignature: true,
        keyEncipherment: true,
      },
      { name: 'extKeyUsage', serverAuth: true },
    ],
  });

  fs.mkdirSync(CERT_DIR, { recursive: true });
  fs.writeFileSync(KEY_PATH, pems.private, { mode: 0o600 });
  fs.writeFileSync(CERT_PATH, pems.cert, { mode: 0o644 });

  return { key: pems.private, cert: pems.cert };
}
