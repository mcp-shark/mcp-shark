import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
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
    console.error('Error getting cached scan result:', error);
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
    let createdAt = now;
    if (existsSync(filePath)) {
      try {
        const existingContent = readFileSync(filePath, 'utf8');
        const existingData = JSON.parse(existingContent);
        createdAt = existingData.createdAt || now;
      } catch (e) {
        // If we can't read existing file, use current time
        createdAt = now;
      }
    }

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
    console.error('Error storing scan result:', error);
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
    let deletedCount = 0;

    for (const file of files) {
      try {
        const filePath = join(scanResultsDir, file);
        unlinkSync(filePath);
        deletedCount++;
      } catch (error) {
        console.warn(`Error deleting scan result file ${file}:`, error);
      }
    }

    return deletedCount;
  } catch (error) {
    console.error('Error clearing all scan results:', error);
    return 0;
  }
}
