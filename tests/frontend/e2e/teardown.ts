import {execSync} from 'node:child_process';

export default async function teardown() {
  console.log('[E2E Teardown] Stopping Docker Compose...');
  try {
    execSync('docker compose down', {stdio: 'inherit'});
    console.log('[E2E Teardown] Docker Compose stopped');
  } catch (error) {
    console.error('[E2E Teardown] Failed to stop Docker Compose:', error);
  }
}
