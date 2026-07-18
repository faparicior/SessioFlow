/* eslint-disable unicorn/no-process-exit */
import {spawn, spawnSync} from 'node:child_process';
import process from 'node:process';

console.log('[Dev] Starting Docker Compose...');
const composeUp = spawnSync('docker', ['compose', 'up', '-d'], {stdio: 'inherit', shell: true});
if (composeUp.status !== 0) {
  console.error('[Dev] Failed to start Docker Compose');
  process.exit(composeUp.status ?? 1);
}

console.log('[Dev] Starting Next.js dev server...');
const nextDev = spawn('npx', ['next', 'dev'], {stdio: 'inherit', shell: true});

let cleanedUp = false;
const cleanup = () => {
  if (cleanedUp) {
    return;
  }

  cleanedUp = true;
  console.log('\n[Dev] Stopping Docker Compose...');
  spawnSync('docker', ['compose', 'down'], {stdio: 'inherit', shell: true});
  console.log('[Dev] Docker Compose stopped.');
};

// Handle process termination signals
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

process.on('exit', () => {
  cleanup();
});

nextDev.on('close', code => {
  cleanup();
  process.exit(code ?? 0);
});
