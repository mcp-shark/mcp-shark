import { readFileSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
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
        console.warn(`Error reading scan result file ${file}:`, error);
      }
    }

    // Sort by updatedAt descending
    results.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    return results;
  } catch (error) {
    console.error('Error getting cached scan results for server:', error);
    return [];
  }
}

/**
 * Clear old scan results (optional cleanup function)
 * @param {number} maxAgeMs - Maximum age in milliseconds (default: 30 days)
 * @returns {number} Number of files deleted
 */
export function clearOldScanResults(maxAgeMs = 30 * 24 * 60 * 60 * 1000) {
  try {
    const scanResultsDir = ensureScanResultsDirectory();
    const files = readdirSync(scanResultsDir).filter((f) => f.endsWith('.json'));
    const cutoffTime = Date.now() - maxAgeMs;
    let deletedCount = 0;

    for (const file of files) {
      try {
        const filePath = join(scanResultsDir, file);
        const fileContent = readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        if (data.updatedAt && data.updatedAt < cutoffTime) {
          unlinkSync(filePath);
          deletedCount++;
        }
      } catch (error) {
        // Skip files that can't be parsed
        console.warn(`Error processing scan result file ${file} for cleanup:`, error);
      }
    }

    return deletedCount;
  } catch (error) {
    console.error('Error clearing old scan results:', error);
    return 0;
  }
}
