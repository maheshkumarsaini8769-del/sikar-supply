const { spawn } = require('child_process');
const path = require('path');

const serverDir = path.join(__dirname, 'server');
const clientDir = __dirname;

console.log('Starting Backend...');
const backend = spawn('node', ['index.js'], { cwd: serverDir, stdio: 'inherit' });

backend.on('error', (err) => console.error('Backend error:', err));

setTimeout(() => {
  console.log('Starting Frontend...');
  const frontend = spawn('npx', ['vite', '--host'], { cwd: clientDir, stdio: 'inherit', shell: true });
  frontend.on('error', (err) => console.error('Frontend error:', err));
  console.log('\n=== SERVERS RUNNING ===');
  console.log('Website:  http://localhost:5173');
  console.log('Admin:    http://localhost:5173/admin');
  console.log('Backend:  http://localhost:5000');
  console.log('========================\n');
}, 4000);

process.on('SIGINT', () => { backend.kill(); process.exit(); });
process.on('SIGTERM', () => { backend.kill(); process.exit(); });
