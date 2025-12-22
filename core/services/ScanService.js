/**
 * Service for Smart Scan API operations
 * Handles communication with external Smart Scan API
 */
export class ScanService {
  constructor(scanCacheService, logger) {
    this.scanCacheService = scanCacheService;
    this.logger = logger;
    this.apiBaseUrl = 'https://smart.mcpshark.sh';
  }

  /**
   * Create scan for a single server
   */
  async createScan(scanData, apiToken) {
    const response = await fetch(`${this.apiBaseUrl}/api/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(scanData),
    });

    const data = await response.json();
    return {
      success: response.ok,
      status: response.status,
      data: response.ok ? data : null,
      error: response.ok ? null : data.error || data.message || 'Unknown error',
    };
  }

  /**
   * Create scans for multiple servers
   */
  async createBatchScans(servers, apiToken) {
    const scanPromises = servers.map(async (serverData) => {
      const hash = this.scanCacheService.computeMcpHash(serverData);
      const cachedResult = this.scanCacheService.getCachedScanResult(hash);

      if (cachedResult) {
        this.logger?.info({ serverName: serverData.name }, 'Using cached scan result');
        return {
          serverName: serverData.name,
          success: true,
          status: 200,
          data: cachedResult,
          error: null,
          cached: true,
        };
      }

      const scanData = {
        server: {
          name: serverData.name || 'unknown',
          description: serverData.description || null,
        },
        tools: (serverData.tools || []).map((tool) => {
          const toolData = {
            name: tool.name,
            description: tool.description || null,
          };
          if (tool.inputSchema && typeof tool.inputSchema === 'object') {
            toolData.input_schema = tool.inputSchema;
          }
          if (tool.outputSchema && typeof tool.outputSchema === 'object') {
            toolData.output_schema = tool.outputSchema;
          }
          return toolData;
        }),
        resources: (serverData.resources || []).map((resource) => ({
          uri: resource.uri,
          name: resource.name || null,
          description: resource.description || null,
          mimeType: resource.mimeType || null,
        })),
        prompts: (serverData.prompts || []).map((prompt) => ({
          name: prompt.name,
          description: prompt.description || null,
          arguments: prompt.arguments || [],
        })),
      };

      try {
        const result = await this.createScan(scanData, apiToken);

        const batchResult = {
          serverName: serverData.name,
          success: result.success,
          status: result.status,
          data: result.data,
          error: result.error,
          cached: false,
        };

        if (result.success && result.data) {
          this.scanCacheService.storeScanResult(serverData.name, hash, result.data);
          this.logger?.info({ serverName: serverData.name }, 'Stored scan result in cache');
        }

        return batchResult;
      } catch (error) {
        return {
          serverName: serverData.name,
          success: false,
          status: 500,
          data: null,
          error: error.message,
          cached: false,
        };
      }
    });

    return Promise.all(scanPromises);
  }

  /**
   * Get scan by ID
   */
  async getScan(scanId, apiToken) {
    const response = await fetch(`${this.apiBaseUrl}/api/scans/${scanId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
    });

    const data = await response.json();
    return {
      success: response.ok,
      status: response.status,
      data: response.ok ? data : null,
      error: response.ok ? null : data.error || data.message || 'Unknown error',
    };
  }

  /**
   * Get cached results for servers
   */
  getCachedResults(servers) {
    return servers.map((serverData) => {
      const hash = this.scanCacheService.computeMcpHash(serverData);
      const cachedResult = this.scanCacheService.getCachedScanResult(hash);

      if (cachedResult) {
        return {
          serverName: serverData.name,
          success: true,
          data: cachedResult,
          cached: true,
          hash,
        };
      }

      return {
        serverName: serverData.name,
        success: false,
        data: null,
        cached: false,
        hash,
      };
    });
  }
}
