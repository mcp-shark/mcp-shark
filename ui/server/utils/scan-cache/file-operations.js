import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import logger from '#ui/server/utils/logger.js';
import { getScanResultFilePath, getScanResultsDirectory } from './directory.js';

/**
 * Get cached scan result by hash
 * @param {string} hash - SHA-256 hash of MCP server data
 * @returns {Object|null} Cached scan result or null if not found
 */
export function getCachedScanResult(hash) {
  try {
    const filePath = getScanResultFilePath(hash);

    if (!existsSync(filePath)) {
      return null;
    }

    const fileContent = readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    return {
      ...data.scanData,
      cached: true,
      cachedAt: data.createdAt,
      updatedAt: data.updatedAt,
      serverName: data.serverName,
    };
  } catch (error) {
    logger.error({ hash, error: error.message }, 'Error getting cached scan result');
    return null;
  }
}

/**
 * Store scan result in cache
 * @param {string} serverName - Name of the MCP server
 * @param {string} hash - SHA-256 hash of MCP server data
 * @param {Object} scanData - Scan result data to store
 * @returns {boolean} Success status
 */
export function storeScanResult(serverName, hash, scanData) {
  try {
    const filePath = getScanResultFilePath(hash);
    const now = Date.now();

    // Check if file exists to preserve original creation time
    const getCreatedAt = (filePath, defaultTime) => {
      if (!existsSync(filePath)) {
        return defaultTime;
      }
      try {
        const existingContent = readFileSync(filePath, 'utf8');
        const existingData = JSON.parse(existingContent);
        return existingData.createdAt || defaultTime;
      } catch (_e) {
        return defaultTime;
      }
    };
    const createdAt = getCreatedAt(filePath, now);

    const dataToStore = {
      serverName,
      hash,
      scanData,
      createdAt,
      updatedAt: now,
    };

    writeFileSync(filePath, JSON.stringify(dataToStore, null, 2), 'utf8');
    return true;
  } catch (error) {
    logger.error({ serverName, hash, error: error.message }, 'Error storing scan result');
    return false;
  }
}

/**
 * Clear all cached scan results
 * @returns {number} Number of files deleted
 */
export function clearAllScanResults() {
  try {
    const scanResultsDir = getScanResultsDirectory();
    if (!existsSync(scanResultsDir)) {
      return 0;
    }

    const files = readdirSync(scanResultsDir).filter((f) => f.endsWith('.json'));

    const deletedCount = files.reduce((count, file) => {
      try {
        const filePath = join(scanResultsDir, file);
        unlinkSync(filePath);
        return count + 1;
      } catch (error) {
        logger.warn({ file, error: error.message }, 'Error deleting scan result file');
        return count;
      }
    }, 0);

    return deletedCount;
  } catch (error) {
    logger.error({ error: error.message }, 'Error clearing all scan results');
    return 0;
  }
}
