import { createHash } from 'node:crypto';

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
