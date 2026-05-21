/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const Service = require('node-windows').Service;

const projectRoot = path.resolve(__dirname, '..');
const entryScript = path.join(projectRoot, 'dist', 'index.js');

const svc = new Service({
  name: 'EntrepequesPrintBridge',
  script: entryScript,
});

svc.on('uninstall', () => {
  console.log('[uninstall] Servicio desinstalado.');
});

svc.uninstall();
