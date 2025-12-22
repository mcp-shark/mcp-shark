import { createHash } from 'node:crypto';

/**
 * Normalize a tool manifest for consistent hashing and comparison
 * Removes non-deterministic fields and sorts arrays/objects
 */
export function normalizeToolManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    return null;
  }

  const tools = Array.isArray(manifest.tools) ? manifest.tools : [];
  const normalized = tools
    .map((tool) => {
      if (!tool || typeof tool !== 'object') {
        return null;
      }

      const normalizedTool = {
        name: String(tool.name || '').trim(),
        description: String(tool.description || '')
          .trim()
          .slice(0, 500),
        inputSchema: tool.inputSchema || {},
      };

      if (normalizedTool.name) {
        return normalizedTool;
      }
      return null;
    })
    .filter((t) => t !== null)
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    tools: normalized,
    toolCount: normalized.length,
  };
}

/**
 * Compute a deterministic hash of a normalized tool manifest
 */
export function hashToolManifest(normalized) {
  if (!normalized) {
    return null;
  }

  const json = JSON.stringify(normalized, null, 0);
  const hash = createHash('sha256').update(json, 'utf8').digest('hex');
  return hash;
}

/**
 * Create a compact manifest representation for LLM prompts
 * Includes only essential fields with truncation
 */
export function compactManifestForPrompt(manifest, maxDescLen = 160) {
  if (!manifest || !Array.isArray(manifest.tools)) {
    return { tools: [], toolCount: 0 };
  }

  const compact = manifest.tools.map((tool) => {
    const desc = String(tool.description || '').trim();
    const truncatedDesc = desc.length > maxDescLen ? `${desc.slice(0, maxDescLen)}...` : desc;

    const inputSchemaHash = tool.inputSchema
      ? createHash('sha256')
          .update(JSON.stringify(tool.inputSchema), 'utf8')
          .digest('hex')
          .slice(0, 16)
      : null;

    return {
      name: String(tool.name || '').trim(),
      description: truncatedDesc,
      inputSchemaHash,
    };
  });

  return {
    tools: compact,
    toolCount: compact.length,
  };
}
