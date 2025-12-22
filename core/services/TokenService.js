import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getWorkingDirectory, prepareAppDataSpaces } from '#common/configs';

/**
 * Service for Smart Scan token management
 * Handles reading and writing Smart Scan API tokens
 */
export class TokenService {
  constructor(logger) {
    this.logger = logger;
    this.tokenFileName = 'smart-scan-token.json';
  }

  /**
   * Get token file path
   */
  getTokenPath() {
    return join(getWorkingDirectory(), this.tokenFileName);
  }

  /**
   * Read Smart Scan token
   */
  readToken() {
    try {
      const tokenPath = this.getTokenPath();
      if (existsSync(tokenPath)) {
        const content = readFileSync(tokenPath, 'utf8');
        const data = JSON.parse(content);
        return data.token || null;
      }
      return null;
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error reading Smart Scan token');
      return null;
    }
  }

  /**
   * Write Smart Scan token
   */
  writeToken(token) {
    try {
      const tokenPath = this.getTokenPath();
      prepareAppDataSpaces();

      const data = {
        token: token || null,
        updatedAt: new Date().toISOString(),
      };

      writeFileSync(tokenPath, JSON.stringify(data, null, 2), { mode: 0o600 });
      return true;
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error writing Smart Scan token');
      return false;
    }
  }

  /**
   * Get token metadata
   */
  getTokenMetadata() {
    try {
      const tokenPath = this.getTokenPath();
      if (existsSync(tokenPath)) {
        const content = readFileSync(tokenPath, 'utf8');
        const data = JSON.parse(content);
        const stats = statSync(tokenPath);
        return {
          token: data.token || null,
          updatedAt: data.updatedAt || stats.mtime.toISOString(),
          path: tokenPath,
          exists: true,
        };
      }
      return {
        token: null,
        updatedAt: null,
        path: tokenPath,
        exists: false,
      };
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error reading token metadata');
      return {
        token: null,
        updatedAt: null,
        path: this.getTokenPath(),
        exists: false,
      };
    }
  }
}
