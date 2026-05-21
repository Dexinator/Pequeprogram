/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Installs the Print Bridge as a Windows service so it starts on boot
 * and recovers automatically if the process dies.
 *
 * Run once on the store PC AS ADMINISTRATOR after `npm run build`:
 *
 *   node scripts/install-windows-service.js
 *
 * To remove later:
 *
 *   node scripts/uninstall-windows-service.js
 */

const path = require('path');
const Service = require('node-windows').Service;

const projectRoot = path.resolve(__dirname, '..');
const entryScript = path.join(projectRoot, 'dist', 'index.js');

const svc = new Service({
  name: 'EntrepequesPrintBridge',
  description: 'Print Bridge that translates Entrepeques POS payloads into ESC/POS and ZPL for the local Epson and Zebra printers.',
  script: entryScript,
  workingDirectory: projectRoot,
  nodeOptions: ['--enable-source-maps'],
  env: [
    // node-windows reads from process.env here by default; explicit listing
    // makes troubleshooting easier and survives restarts.
    { name: 'NODE_ENV', value: 'production' },
  ],
});

svc.on('install', () => {
  console.log('[install] Servicio instalado, iniciando…');
  svc.start();
});

svc.on('alreadyinstalled', () => {
  console.log('[install] El servicio ya estaba instalado.');
});

svc.on('start', () => {
  console.log('[install] Servicio iniciado correctamente.');
  console.log(
    `[install] Health check: http://127.0.0.1:9100/health\n` +
      `[install] Logs: %ProgramData%\\EntrepequesPrintBridge\\daemon\\`
  );
});

svc.on('error', err => {
  console.error('[install] error del servicio:', err);
});

svc.install();
