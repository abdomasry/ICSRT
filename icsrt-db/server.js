const { spawn } = require('child_process');
const path = require('path');

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(npx, ['--no-install', 'tsx', path.join(__dirname, 'src', 'server.ts')], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
