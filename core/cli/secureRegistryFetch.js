/**
 * Hardened HTTP fetch for rule registry and pack downloads.
 * - HTTPS only by default (HTTP only with MCP_SHARK_INSECURE_HTTP_REGISTRY=1)
 * - No userinfo in URLs (prevents credential injection)
 * - Manual redirect handling with re-validation each hop (mitigates redirect-to-internal SSRF)
 * - Response size cap (mitigates memory exhaustion)
 */
import { createHash } from 'node:crypto';

const MAX_REDIRECTS = 5;
const DEFAULT_MAX_BYTES = 25 * 1024 * 1024;

/**
 * @param {string} urlString
 * @returns {string} normalized href
 */
export function assertAllowedRegistryUrl(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error('Invalid URL');
  }

  const allowHttp = process.env.MCP_SHARK_INSECURE_HTTP_REGISTRY === '1';

  if (parsed.protocol === 'https:') {
    // ok
  } else if (parsed.protocol === 'http:' && allowHttp) {
    // lab / air-gapped mirrors only — explicit env required
  } else {
    throw new Error(
      'Registry URLs must use HTTPS. For trusted internal HTTP mirrors only, set MCP_SHARK_INSECURE_HTTP_REGISTRY=1.'
    );
  }

  if (!parsed.hostname) {
    throw new Error('Registry URL must have a hostname');
  }

  if (parsed.username !== '' || parsed.password !== '') {
    throw new Error('Registry URL must not embed credentials');
  }

  return parsed.href;
}

/**
 * Fetch JSON with size limit and safe redirects.
 * @param {string} initialUrl
 * @param {number} [maxBytes]
 * @returns {Promise<object>}
 */
export async function fetchUtf8Secure(initialUrl, maxBytes = DEFAULT_MAX_BYTES) {
  let url = assertAllowedRegistryUrl(initialUrl);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetch(url, {
      redirect: 'manual',
      headers: {
        Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
        'User-Agent': 'mcp-shark-rule-update',
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location || hop === MAX_REDIRECTS) {
        throw new Error('Too many HTTP redirects or missing Location header');
      }
      url = assertAllowedRegistryUrl(new URL(location, url).href);
      continue;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return readBodyWithLimit(response, maxBytes);
  }

  throw new Error('Redirect loop');
}

/**
 * @param {string} initialUrl
 * @param {number} [maxBytes]
 * @returns {Promise<object>}
 */
export async function fetchJsonSecure(initialUrl, maxBytes = DEFAULT_MAX_BYTES) {
  const text = await fetchUtf8Secure(initialUrl, maxBytes);
  return JSON.parse(text);
}

/**
 * @param {Response} response
 * @param {number} maxBytes
 * @returns {Promise<string>}
 */
async function readBodyWithLimit(response, maxBytes) {
  if (!response.body) {
    const text = await response.text();
    if (Buffer.byteLength(text, 'utf8') > maxBytes) {
      throw new Error('Response body exceeds size limit');
    }
    return text;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    total += value.length;
    if (total > maxBytes) {
      throw new Error('Response body exceeds size limit');
    }
    chunks.push(value);
  }

  return Buffer.concat(chunks).toString('utf8');
}

const SAFE_PACK_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/;

/**
 * @param {string} id
 */
export function assertSafePackId(id) {
  if (typeof id !== 'string' || !SAFE_PACK_ID.test(id)) {
    throw new Error(
      'Pack id must be 1–128 chars: letters, digits, dot, underscore, hyphen; no path segments.'
    );
  }
}

/**
 * @param {string} expectedHex
 * @param {string} utf8Body
 */
export function assertSha256(expectedHex, utf8Body) {
  if (!expectedHex || typeof expectedHex !== 'string') {
    return;
  }
  const normalized = expectedHex.trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(normalized)) {
    throw new Error('Invalid sha256 format in manifest');
  }
  const actual = createHash('sha256').update(utf8Body, 'utf8').digest('hex');
  if (actual !== normalized) {
    throw new Error('Downloaded pack failed SHA-256 verification');
  }
}
