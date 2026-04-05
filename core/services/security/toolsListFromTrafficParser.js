/**
 * Extract MCP tools/list (or equivalent) tool arrays from proxied JSON-RPC traffic.
 */

function normalizeTools(tools) {
  if (!Array.isArray(tools)) {
    return null;
  }
  const out = [];
  for (const t of tools) {
    if (!t || typeof t !== 'object') {
      continue;
    }
    const name = t.name;
    if (typeof name !== 'string' || !name) {
      continue;
    }
    out.push({
      name,
      description: typeof t.description === 'string' ? t.description : null,
    });
  }
  return out.length > 0 ? out : null;
}

function parseJson(value) {
  if (value == null) {
    return null;
  }
  if (typeof value === 'object') {
    return value;
  }
  if (typeof value !== 'string' || value === '') {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * Parse stored jsonrpc_result column (stringified `result` object).
 * @param {string|null} jsonrpcResultStr
 * @returns {Array<{name: string, description: string|null}>|null}
 */
export function toolsFromJsonrpcResultString(jsonrpcResultStr) {
  const obj = parseJson(jsonrpcResultStr);
  if (!obj || !Array.isArray(obj.tools)) {
    return null;
  }
  return normalizeTools(obj.tools);
}

/**
 * Parse live or raw response body for tools/list success.
 * @param {string|object|null|undefined} body
 * @returns {Array<{name: string, description: string|null}>|null}
 */
export function toolsFromTrafficResponseBody(body) {
  const parsed = parseJson(body);
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }
  if (parsed.result && Array.isArray(parsed.result.tools)) {
    return normalizeTools(parsed.result.tools);
  }
  return null;
}
