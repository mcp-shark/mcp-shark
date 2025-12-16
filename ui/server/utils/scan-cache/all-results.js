import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
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
    console.log(`[getAllCachedScanResults] Reading file: ${file}`);

    const fileContent = readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    // Validate that this is a scan result file
    if (!data || typeof data !== 'object') {
      console.warn(`[getAllCachedScanResults] Invalid data in file ${file}: not an object`);
      return null;
    }

    // Debug: Log the structure to understand what we're working with
    console.log(`[getAllCachedScanResults] File ${file} structure:`, {
      hasServerName: !!data.serverName,
      serverName: data.serverName,
      hasScanData: !!data.scanData,
      scanDataKeys: data.scanData ? Object.keys(data.scanData) : [],
      topLevelKeys: Object.keys(data),
    });

    // Create a scan-like object with id, server name, and scan data
    const scanData = data.scanData || data;
    const scanId = scanData.id || scanData.scan_id || data.hash || file.replace('.json', '');
    const serverName = extractServerName(data, scanData);

    // Log if we couldn't find server name
    if (serverName === 'Unknown Server') {
      console.warn(`[getAllCachedScanResults] Could not find server name in ${file}`);
      console.warn(`[getAllCachedScanResults] data.serverName: ${data.serverName}`);
      console.warn(`[getAllCachedScanResults] data keys: ${Object.keys(data || {}).join(', ')}`);
      console.warn(
        `[getAllCachedScanResults] scanData keys: ${Object.keys(scanData || {}).join(', ')}`
      );
      if (scanData?.data) {
        console.warn(
          `[getAllCachedScanResults] scanData.data keys: ${Object.keys(scanData.data || {}).join(', ')}`
        );
      }
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

    console.log(`[getAllCachedScanResults] Successfully loaded scan: ${serverName} (${scanId})`);
    return scanResult;
  } catch (error) {
    console.warn(
      `[getAllCachedScanResults] Error reading scan result file ${file}:`,
      error.message
    );
    console.warn(`[getAllCachedScanResults] File path: ${join(scanResultsDir, file)}`);
    if (error.stack) {
      console.warn(`[getAllCachedScanResults] Stack: ${error.stack}`);
    }
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
    console.log('[getAllCachedScanResults] Reading cached scans from directory:', scanResultsDir);

    // Check if directory exists (don't create it, just check)
    if (!existsSync(scanResultsDir)) {
      console.log(
        '[getAllCachedScanResults] Scan results directory does not exist:',
        scanResultsDir
      );
      return [];
    }

    // Read all files in the directory
    const allFiles = readdirSync(scanResultsDir);
    console.log(`[getAllCachedScanResults] Total files in directory: ${allFiles.length}`);

    // Filter for JSON files only
    const jsonFiles = allFiles.filter((f) => f.endsWith('.json'));
    console.log(
      `[getAllCachedScanResults] Found ${jsonFiles.length} JSON files in ${scanResultsDir}`
    );

    if (jsonFiles.length === 0) {
      console.log('[getAllCachedScanResults] No cached scan JSON files found');
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

    console.log(
      `[getAllCachedScanResults] Summary: ${successCount} successful, ${errorCount} errors, ${results.length} total scans loaded`
    );
    return results;
  } catch (error) {
    console.error('[getAllCachedScanResults] Fatal error getting all cached scan results:', error);
    console.error('[getAllCachedScanResults] Error stack:', error.stack);
    return [];
  }
}
