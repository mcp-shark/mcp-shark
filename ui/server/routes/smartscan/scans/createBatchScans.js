const API_BASE_URL = 'https://smart.mcpshark.sh';
import { computeMcpHash, getCachedScanResult, storeScanResult } from '../../../utils/scan-cache.js';

/**
 * Create scan for multiple servers (one request per server)
 * POST /api/smartscan/scans/batch
 */
export async function createBatchScans(req, res) {
  try {
    const { apiToken, servers } = req.body;

    if (!apiToken) {
      return res.status(400).json({
        error: 'API token is required',
      });
    }

    if (!servers || !Array.isArray(servers) || servers.length === 0) {
      return res.status(400).json({
        error: 'Servers array is required',
      });
    }

    const scanPromises = servers.map(async (serverData) => {
      const hash = computeMcpHash(serverData);
      const cachedResult = getCachedScanResult(hash);
      if (cachedResult) {
        console.log(`Using cached scan result for server: ${serverData.name}`);
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
        const response = await fetch(`${API_BASE_URL}/api/scans`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${apiToken}`,
          },
          body: JSON.stringify(scanData),
        });

        const data = await response.json();

        const result = {
          serverName: serverData.name,
          success: response.ok,
          status: response.status,
          data: response.ok ? data : null,
          error: response.ok ? null : data.error || data.message || 'Unknown error',
          cached: false,
        };

        if (response.ok && data) {
          storeScanResult(serverData.name, hash, data);
          console.log(`Stored scan result in cache for server: ${serverData.name}`);
        }

        return result;
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

    const results = await Promise.all(scanPromises);

    return res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Smart Scan batch API error:', error);
    return res.status(500).json({
      error: 'Failed to create batch scans',
      message: error.message,
    });
  }
}
