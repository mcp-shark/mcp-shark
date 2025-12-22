import { readFileSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { Defaults } from '#core/constants/Defaults';
import logger from '#ui/server/utils/logger.js';
import { ensureScanResultsDirectory } from './directory.js';

/**
 * Get all cached scan results for a server
 * @param {string} serverName - Name of the MCP server
 * @returns {Array} Array of cached scan results
 */
export function getCachedScanResultsForServer(serverName) {
  try {
    const scanResultsDir = ensureScanResultsDirectory();
    const files = readdirSync(scanResultsDir).filter((f) => f.endsWith('.json'));
    const results = [];

    for (const file of files) {
      try {
        const filePath = join(scanResultsDir, file);
        const fileContent = readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        if (data.serverName === serverName) {
          results.push({
            ...data.scanData,
            cached: true,
            cachedAt: data.createdAt,
            updatedAt: data.updatedAt,
            hash: data.hash,
          });
        }
      } catch (error) {
        // Skip files that can't be parsed
        logger.warn({ file, error: error.message }, 'Error reading scan result file');
      }
    }

    // Sort by updatedAt descending
    results.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    return results;
  } catch (error) {
    logger.error({ error: error.message }, 'Error getting cached scan results for server');
    return [];
  }
}

/**
 * Clear old scan results (optional cleanup function)
 * @param {number} maxAgeMs - Maximum age in milliseconds (default: 30 days)
 * @returns {number} Number of files deleted
 */
export function clearOldScanResults(maxAgeMs = Defaults.SCAN_RESULTS_MAX_AGE_MS) {
  try {
    const scanResultsDir = ensureScanResultsDirectory();
    const files = readdirSync(scanResultsDir).filter((f) => f.endsWith('.json'));
    const cutoffTime = Date.now() - maxAgeMs;

    const deletedCount = files.reduce((count, file) => {
      try {
        const filePath = join(scanResultsDir, file);
        const fileContent = readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        if (data.updatedAt && data.updatedAt < cutoffTime) {
          unlinkSync(filePath);
          return count + 1;
        }
        return count;
      } catch (error) {
        // Skip files that can't be parsed
        logger.warn(
          { file, error: error.message },
          'Error processing scan result file for cleanup'
        );
        return count;
      }
    }, 0);

    return deletedCount;
  } catch (error) {
    logger.error({ error: error.message }, 'Error clearing old scan results');
    return 0;
  }
}
