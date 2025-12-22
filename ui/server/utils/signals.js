/**
 * Handle shutdown signal (SIGTERM, SIGINT)
 * @param {Function} cleanup - Cleanup function to execute
 * @param {object} logger - Logger instance
 */
export async function shutdown(cleanup, logger) {
  try {
    // Set a timeout to force exit if cleanup takes too long
    const timeout = setTimeout(() => {
      logger?.warn('Shutdown timeout reached, forcing exit');
      process.exit(0);
    }, 5000); // 5 second timeout

    await cleanup();
    clearTimeout(timeout);
  } catch (err) {
    logger?.warn({ error: err.message }, 'Error during shutdown, exiting anyway');
  } finally {
    // Always exit, even if cleanup failed
    process.exit(0);
  }
}

/**
 * Handle process exit event
 * @param {Function} cleanup - Cleanup function to execute
 */
export async function handleExit(cleanup) {
  try {
    await cleanup();
  } catch (_err) {
    // Ignore errors during exit
  }
}
