import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getWorkingDirectory } from 'mcp-shark-common/configs/index.js';

const SCAN_RESULTS_DIR_NAME = 'scan-results';

/**
 * Get the scan results directory path
 * @returns {string} Path to scan results directory
 */
export function getScanResultsDirectory() {
  return join(getWorkingDirectory(), SCAN_RESULTS_DIR_NAME);
}

/**
 * Ensure the scan results directory exists
 * @returns {string} Path to scan results directory
 */
export function ensureScanResultsDirectory() {
  const scanResultsDir = getScanResultsDirectory();
  if (!existsSync(scanResultsDir)) {
    mkdirSync(scanResultsDir, { recursive: true });
  }
  return scanResultsDir;
}

/**
 * Get file path for a scan result based on hash
 * @param {string} hash - SHA-256 hash of MCP server data
 * @returns {string} File path
 */
export function getScanResultFilePath(hash) {
  ensureScanResultsDirectory();
  return join(getScanResultsDirectory(), `${hash}.json`);
}
