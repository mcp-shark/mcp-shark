import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Defaults } from '#core/constants/Defaults.js';
import {
  ensureScanResultsDirectory,
  getScanResultFilePath,
  getScanResultsDirectory,
} from '#core/utils/scan-cache/directory.js';

/**
 * Service for Smart Scan cache operations
 * Handles caching, retrieval, and management of scan results
 */
export class ScanCacheService {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Compute SHA-256 hash of MCP server data
   */
  computeMcpHash(serverData) {
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

    const jsonString = JSON.stringify(normalized);
    return createHash('sha256').update(jsonString).digest('hex');
  }

  /**
   * Get cached scan result by hash
   */
  getCachedScanResult(hash) {
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
      this.logger?.error({ hash, error: error.message }, 'Error getting cached scan result');
      return null;
    }
  }

  /**
   * Get created timestamp from existing file or use default
   */
  _getCreatedAt(filePath, defaultTime) {
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
  }

  /**
   * Store scan result in cache
   */
  storeScanResult(serverName, hash, scanData) {
    try {
      const filePath = getScanResultFilePath(hash);
      const now = Date.now();
      const createdAt = this._getCreatedAt(filePath, now);

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
      this.logger?.error({ serverName, hash, error: error.message }, 'Error storing scan result');
      return false;
    }
  }

  /**
   * Get all cached scan results
   */
  getAllCachedScanResults() {
    try {
      const scanResultsDir = getScanResultsDirectory();
      if (!existsSync(scanResultsDir)) {
        return [];
      }

      const files = readdirSync(scanResultsDir).filter((f) => f.endsWith('.json'));
      const results = [];

      for (const file of files) {
        try {
          const filePath = join(scanResultsDir, file);
          const fileContent = readFileSync(filePath, 'utf8');
          const data = JSON.parse(fileContent);

          const scanData = data.scanData || data;
          const scanId = scanData.id || scanData.scan_id || data.hash || file.replace('.json', '');
          const serverName = data.serverName || 'Unknown Server';

          results.push({
            id: scanId,
            scan_id: scanId,
            server: { name: serverName },
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
          });
        } catch (error) {
          this.logger?.warn({ file, error: error.message }, 'Error reading scan result file');
        }
      }

      results.sort((a, b) => {
        const aTime = a.updated_at || a.created_at || 0;
        const bTime = b.updated_at || b.created_at || 0;
        return bTime - aTime;
      });

      return results;
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error getting all cached scan results');
      return [];
    }
  }

  /**
   * Clear all cached scan results
   */
  clearAllScanResults() {
    try {
      const scanResultsDir = ensureScanResultsDirectory();
      const files = readdirSync(scanResultsDir).filter((f) => f.endsWith('.json'));

      const deletedCount = files.reduce((count, file) => {
        try {
          const filePath = join(scanResultsDir, file);
          unlinkSync(filePath);
          return count + 1;
        } catch (error) {
          this.logger?.warn({ file, error: error.message }, 'Error deleting scan result file');
          return count;
        }
      }, 0);

      return deletedCount;
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error clearing all scan results');
      return 0;
    }
  }

  /**
   * Clear old scan results
   */
  clearOldScanResults(maxAgeMs = Defaults.SCAN_RESULTS_MAX_AGE_MS) {
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
          this.logger?.warn({ file, error: error.message }, 'Error processing scan result file');
          return count;
        }
      }, 0);

      return deletedCount;
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error clearing old scan results');
      return 0;
    }
  }
}
