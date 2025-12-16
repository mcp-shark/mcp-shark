import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getWorkingDirectory, prepareAppDataSpaces } from 'mcp-shark-common/configs/index.js';
import logger from './logger.js';

const SMART_SCAN_TOKEN_NAME = 'smart-scan-token.json';

function getSmartScanTokenPath() {
  return join(getWorkingDirectory(), SMART_SCAN_TOKEN_NAME);
}

export function readSmartScanToken() {
  try {
    const tokenPath = getSmartScanTokenPath();
    if (existsSync(tokenPath)) {
      const content = readFileSync(tokenPath, 'utf8');
      const data = JSON.parse(content);
      return data.token || null;
    }
    return null;
  } catch (error) {
    logger.error({ error: error.message }, 'Error reading Smart Scan token');
    return null;
  }
}

export function writeSmartScanToken(token) {
  try {
    const tokenPath = getSmartScanTokenPath();
    prepareAppDataSpaces(); // Ensure directory exists

    const data = {
      token: token || null,
      updatedAt: new Date().toISOString(),
    };

    writeFileSync(tokenPath, JSON.stringify(data, null, 2), { mode: 0o600 }); // Read/write for owner only
    return true;
  } catch (error) {
    logger.error({ error: error.message }, 'Error writing Smart Scan token');
    return false;
  }
}
