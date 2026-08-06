import {getLogger} from '@sessioflow/shared-logging/logger';

/**
 * SessioFlow Backend Main Entry Point
 */
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

