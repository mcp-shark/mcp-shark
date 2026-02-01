/**
 * Detect when MCP Shark UI is loaded inside the VS Code / Cursor extension (MCP Shark Viewer).
 * The extension adds ?embed=vscode-viewer to the iframe URL hash.
 */

const EMBED_PARAM = 'embed=vscode-viewer';

/**
 * Get the path part of the hash (e.g. "#/traffic?embed=vscode-viewer" -> "/traffic")
 * @param {string} [hash] - window.location.hash (defaults to current)
 * @returns {string}
 */
export function getHashPath(hash = window.location.hash) {
  const raw = hash.slice(1); // Remove '#'
  const pathPart = raw.indexOf('?') >= 0 ? raw.slice(0, raw.indexOf('?')) : raw;
  return pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
}

/**
 * Get the query string from the hash if present (e.g. "#/traffic?embed=vscode-viewer" -> "embed=vscode-viewer")
 * @param {string} [hash] - window.location.hash (defaults to current)
 * @returns {string}
 */
export function getHashQuery(hash = window.location.hash) {
  const raw = hash.slice(1);
  const q = raw.indexOf('?');
  return q >= 0 ? raw.slice(q + 1) : '';
}

/**
 * Whether the app is embedded in the VS Code / Cursor extension (MCP Shark Viewer).
 * Only true when the iframe URL contains ?embed=vscode-viewer in the hash.
 * @param {string} [hash] - window.location.hash (defaults to current)
 * @returns {boolean}
 */
export function isEmbeddedInExtension(hash = window.location.hash) {
  const query = getHashQuery(hash);
  const params = new URLSearchParams(query);
  return params.get('embed') === 'vscode-viewer';
}

/**
 * Query string to append to hash when updating URL to preserve "embedded in extension" state.
 * @param {string} [hash] - window.location.hash (defaults to current)
 * @returns {string} e.g. "embed=vscode-viewer" or ""
 */
export function getEmbedQueryForHash(hash = window.location.hash) {
  return isEmbeddedInExtension(hash) ? EMBED_PARAM : '';
}
