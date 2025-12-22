import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import logger from '#ui/server/utils/logger.js';
import { getScanResultsDirectory } from './directory.js';

/**
 * Extract server name from cached scan data
 * @param {Object} data - Cached file data
 * @param {Object} scanData - Scan data from API
 * @returns {string} Server name
 */
function extractServerName(data, scanData) {
  const cachedServerName = data.serverName; // From cache file metadata (most reliable)

  // If not found at top level, try to extract from scan data (API response)
  if (!cachedServerName || cachedServerName === 'Unknown Server') {
    const actualScanData = scanData.data || scanData;

    const serverName =
      actualScanData.serverName ||
      actualScanData.server_name ||
      actualScanData.server?.name ||
      actualScanData.mcp_server_data?.server?.name ||
      scanData.serverName ||
      scanData.server_name ||
      scanData.server?.name ||
      scanData.mcp_server_data?.server?.name ||
      'Unknown Server';

    return serverName;
  }

  return cachedServerName;
}

/**
 * Process a single cached scan file
 * @param {string} file - File name
 * @param {string} scanResultsDir - Directory path
 * @returns {Object|null} Processed scan result or null if error
 */
function processScanFile(file, scanResultsDir) {
  try {
    const filePath = join(scanResultsDir, file);
    logger.debug({ file }, 'Reading cached scan result file');

    const fileContent = readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    // Validate that this is a scan result file
    if (!data || typeof data !== 'object') {
      logger.warn({ file }, 'Invalid data in file: not an object');
      return null;
    }

    // Debug: Log the structure to understand what we're working with
    logger.debug(
      {
        file,
        hasServerName: !!data.serverName,
        serverName: data.serverName,
        hasScanData: !!data.scanData,
        scanDataKeys: data.scanData ? Object.keys(data.scanData) : [],
        topLevelKeys: Object.keys(data),
      },
      'File structure'
    );

    // Create a scan-like object with id, server name, and scan data
    const scanData = data.scanData || data;
    const scanId = scanData.id || scanData.scan_id || data.hash || file.replace('.json', '');
    const serverName = extractServerName(data, scanData);

    // Log if we couldn't find server name
    if (serverName === 'Unknown Server') {
      logger.warn(
        {
          file,
          dataServerName: data.serverName,
          dataKeys: Object.keys(data || {}).join(', '),
          scanDataKeys: Object.keys(scanData || {}).join(', '),
          scanDataDataKeys: scanData?.data ? Object.keys(scanData.data || {}).join(', ') : null,
        },
        'Could not find server name in file'
      );
    }

    const scanResult = {
      id: scanId,
      scan_id: scanId,
      server: {
        name: serverName,
      },
      server_name: serverName,
      serverName: serverName,
      status: 'completed',
      risk_level: scanData.overall_risk_level || scanData.risk_level || 'unknown',
      overall_risk_level: scanData.overall_risk_level || scanData.risk_level || 'unknown',
      created_at: data.createdAt || data.created_at || scanData.created_at,
      updated_at: data.updatedAt || data.updated_at || scanData.updated_at,
      cached: true,
      hash: data.hash || file.replace('.json', ''),
      data: scanData,
      result: scanData,
    };

    logger.debug({ serverName, scanId }, 'Successfully loaded scan');
    return scanResult;
  } catch (error) {
    logger.warn(
      {
        file,
        filePath: join(scanResultsDir, file),
        error: error.message,
        stack: error.stack,
      },
      'Error reading scan result file'
    );
    return null;
  }
}

/**
 * Get all cached scan results (across all servers)
 * @returns {Array} Array of cached scan results
 */
export function getAllCachedScanResults() {
  try {
    const scanResultsDir = getScanResultsDirectory();
    logger.debug({ scanResultsDir }, 'Reading cached scans from directory');

    // Check if directory exists (don't create it, just check)
    if (!existsSync(scanResultsDir)) {
      logger.debug({ scanResultsDir }, 'Scan results directory does not exist');
      return [];
    }

    // Read all files in the directory
    const allFiles = readdirSync(scanResultsDir);
    logger.debug({ count: allFiles.length }, 'Total files in directory');

    // Filter for JSON files only
    const jsonFiles = allFiles.filter((f) => f.endsWith('.json'));
    logger.debug({ count: jsonFiles.length, scanResultsDir }, 'Found JSON files');

    if (jsonFiles.length === 0) {
      logger.debug('No cached scan JSON files found');
      return [];
    }

    // Read each file
    const { results, successCount, errorCount } = jsonFiles.reduce(
      (acc, file) => {
        const result = processScanFile(file, scanResultsDir);
        if (result) {
          return {
            results: [...acc.results, result],
            successCount: acc.successCount + 1,
            errorCount: acc.errorCount,
          };
        }
        return {
          results: acc.results,
          successCount: acc.successCount,
          errorCount: acc.errorCount + 1,
        };
      },
      { results: [], successCount: 0, errorCount: 0 }
    );

    // Sort by updatedAt descending (most recent first)
    results.sort((a, b) => {
      const aTime = a.updated_at || a.created_at || 0;
      const bTime = b.updated_at || b.created_at || 0;
      return bTime - aTime;
    });

    logger.info(
      {
        successCount,
        errorCount,
        total: results.length,
      },
      'Summary: cached scans loaded'
    );
    return results;
  } catch (error) {
    logger.error(
      {
        error: error.message,
        stack: error.stack,
      },
      'Fatal error getting all cached scan results'
    );
    return [];
  }
}
