import { createHash } from 'node:crypto';
import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  unlinkSync,
  mkdirSync,
} from 'node:fs';
import { join } from 'node:path';
import { getWorkingDirectory } from 'mcp-shark-common/configs/index.js';

const SCAN_RESULTS_DIR_NAME = 'scan-results';

/**
 * Get the scan results directory path
 * @returns {string} Path to scan results directory
 */
function getScanResultsDirectory() {
  return join(getWorkingDirectory(), SCAN_RESULTS_DIR_NAME);
}

/**
 * Ensure the scan results directory exists
 * @returns {string} Path to scan results directory
 */
function ensureScanResultsDirectory() {
  const scanResultsDir = getScanResultsDirectory();
  if (!existsSync(scanResultsDir)) {
    mkdirSync(scanResultsDir, { recursive: true });
  }
  return scanResultsDir;
}

/**
 * Compute SHA-256 hash of MCP server data for change detection
 * @param {Object} serverData - MCP server data (name, tools, resources, prompts)
 * @returns {string} SHA-256 hash in hex format
 */
export function computeMcpHash(serverData) {
  // Normalize the data to ensure consistent hashing
  // Sort arrays to ensure order doesn't matter
  const normalized = {
    name: serverData.name || '',
    tools: (serverData.tools || [])
      .map((tool) => ({
        name: tool.name || '',
        description: tool.description || '',
        inputSchema: tool.inputSchema || tool.input_schema || null,
        outputSchema: tool.outputSchema || tool.output_schema || null,
      }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    resources: (serverData.resources || [])
      .map((resource) => ({
        uri: resource.uri || '',
        name: resource.name || '',
        description: resource.description || '',
        mimeType: resource.mimeType || resource.mime_type || null,
      }))
      .sort((a, b) => (a.uri || '').localeCompare(b.uri || '')),
    prompts: (serverData.prompts || [])
      .map((prompt) => ({
        name: prompt.name || '',
        description: prompt.description || '',
        arguments: (prompt.arguments || []).sort((a, b) => {
          const aName = (a.name || '').toString();
          const bName = (b.name || '').toString();
          return aName.localeCompare(bName);
        }),
      }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
  };

  // Create deterministic JSON string (sorted keys)
  const jsonString = JSON.stringify(normalized);

  // Compute SHA-256 hash
  return createHash('sha256').update(jsonString).digest('hex');
}

/**
 * Get file path for a scan result based on hash
 * @param {string} hash - SHA-256 hash of MCP server data
 * @returns {string} File path
 */
function getScanResultFilePath(hash) {
  ensureScanResultsDirectory();
  return join(getScanResultsDirectory(), `${hash}.json`);
}

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

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Read each file
    for (const file of jsonFiles) {
      try {
        const filePath = join(scanResultsDir, file);
        console.log(`[getAllCachedScanResults] Reading file: ${file}`);

        const fileContent = readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        // Validate that this is a scan result file
        if (!data || typeof data !== 'object') {
          console.warn(`[getAllCachedScanResults] Invalid data in file ${file}: not an object`);
          errorCount++;
          continue;
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
        // The cached file structure is:
        // { serverName, hash, scanData: { ...API response... }, createdAt, updatedAt }
        const scanData = data.scanData || data;
        const scanId = scanData.id || scanData.scan_id || data.hash || file.replace('.json', '');

        // Try multiple paths to find server name
        // Priority: 1) Top-level in cache file (data.serverName), 2) In scanData from API response
        // The cache file structure is: { serverName, hash, scanData: {...}, createdAt, updatedAt }
        // The scanData might be the API response which could have nested structure
        let serverName = data.serverName; // From cache file metadata (most reliable - we store it here)

        // If not found at top level, try to extract from scan data (API response)
        if (!serverName || serverName === 'Unknown Server') {
          // Check if scanData is the API response wrapper { success, data: {...} }
          const actualScanData = scanData.data || scanData;

          serverName =
            actualScanData.serverName ||
            actualScanData.server_name ||
            actualScanData.server?.name ||
            actualScanData.mcp_server_data?.server?.name ||
            scanData.serverName ||
            scanData.server_name ||
            scanData.server?.name ||
            scanData.mcp_server_data?.server?.name ||
            'Unknown Server';
        }

        // Log if we couldn't find server name
        if (serverName === 'Unknown Server') {
          console.warn(`[getAllCachedScanResults] Could not find server name in ${file}`);
          console.warn(`[getAllCachedScanResults] data.serverName: ${data.serverName}`);
          console.warn(
            `[getAllCachedScanResults] data keys: ${Object.keys(data || {}).join(', ')}`
          );
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

        results.push(scanResult);
        successCount++;
        console.log(
          `[getAllCachedScanResults] Successfully loaded scan: ${serverName} (${scanId})`
        );
      } catch (error) {
        // Skip files that can't be parsed
        errorCount++;
        console.warn(
          `[getAllCachedScanResults] Error reading scan result file ${file}:`,
          error.message
        );
        console.warn(`[getAllCachedScanResults] File path: ${join(scanResultsDir, file)}`);
        if (error.stack) {
          console.warn(`[getAllCachedScanResults] Stack: ${error.stack}`);
        }
      }
    }

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
