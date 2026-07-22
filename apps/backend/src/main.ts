import {getLogger} from '@sessioflow/shared-logging/logger';

/**
 * SessioFlow Backend Main Entry Point
 */
async function main() {
  const logger = getLogger();
  logger.info('[Backend] SessioFlow Backend Service initialized');

  // Handle termination signals gracefully
  process.on('SIGINT', () => {
    logger.info('[Backend] Shutting down backend service...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('[Backend] Shutting down backend service...');
    process.exit(0);
  });
}

main().catch((error: unknown) => {
  console.error('[Backend] Fatal startup error:', error);
  process.exit(1);
});
