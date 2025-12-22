/**
 * Restore original config from backup
 * @param {object} container - Dependency container
 * @returns {boolean} True if config was restored
 */
export function restoreConfig(container) {
  const configService = container.getService('config');
  const logService = container.getService('log');
  const restored = configService.restoreOriginalConfig();
  if (restored) {
    const timestamp = new Date().toISOString();
    const restoreLog = {
      timestamp,
      type: 'stdout',
      line: '[RESTORE] Restored original config',
    };
    logService.addLog(restoreLog);
  }
  return restored;
}
