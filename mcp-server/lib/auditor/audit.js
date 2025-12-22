import { Readable } from 'node:stream';
import { parse as parseJsonRpc } from 'jsonrpc-lite';
import { getSessionFromRequest } from '../server/internal/handlers/common.js';

/* ---------- helpers ---------- */

/**
 * Safely parse JSON string, returning null if parsing fails
 */
function parseJsonSafely(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

function toBuffer(body) {
  if (body === undefined || body === null) {
    return Buffer.alloc(0);
  }

  if (Buffer.isBuffer(body)) {
    return body;
  }

  if (typeof body === 'object' && body.type === 'Buffer' && Array.isArray(body.data)) {
    return Buffer.from(body.data);
  }

  if (typeof body === 'string') {
    return Buffer.from(body, 'utf8');
  }

  if (typeof body === 'object') {
    return Buffer.from(JSON.stringify(body));
  }

  return Buffer.alloc(0);
}

async function readBody(req) {
  if (req.body) {
    return toBuffer(req.body);
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

function captureResponse(res) {
  const chunks = [];

  const wrapped = new Proxy(res, {
    get(target, prop, receiver) {
      if (prop === 'write') {
        return (chunk, ...args) => {
          if (chunk) {
            const buf = toBuffer(chunk);
            chunks.push(buf);
          }
          return target.write(chunk, ...args);
        };
      }

      if (prop === 'end') {
        return (chunk, ...args) => {
          if (chunk) {
            const buf = toBuffer(chunk);
            chunks.push(buf);
          }
          return target.end(chunk, ...args);
        };
      }

      return Reflect.get(target, prop, receiver);
    },
  });

  return {
    res: wrapped,
    getBody: () => {
      return Buffer.concat(chunks);
    },
  };
}

function tryParseJsonRpc(buf) {
  if (!buf || buf.length === 0) {
    return null;
  }

  const text = buf.toString('utf8');

  try {
    const parsed = parseJsonRpc(text);
    return parsed;
  } catch {
    return null;
  }
}

function rebuildReq(req, buf) {
  const r = new Readable({
    read() {
      this.push(buf);
      this.push(null);
    },
  });

  r.headers = req.headers;
  r.method = req.method;
  r.url = req.url;

  return r;
}

function waitForResponseFinish(res) {
  return new Promise((resolve) => {
    const state = { done: false };

    function finishOnce() {
      if (!state.done) {
        state.done = true;
        resolve();
      }
    }

    res.on('finish', finishOnce);
    res.on('close', finishOnce);
  });
}

/* ---------- main handler ---------- */

export async function withAuditRequestResponseHandler(
  transport,
  req,
  res,
  auditLogger,
  requestedMcpServer,
  initialSessionId
) {
  const reqBuf = await readBody(req);
  const reqJsonRpc = tryParseJsonRpc(reqBuf);

  // Extract session ID from request
  // If no session ID exists, it's an initiation request
  const sessionIdFromRequest = getSessionFromRequest(req);
  const sessionId =
    sessionIdFromRequest === null ||
    sessionIdFromRequest === undefined ||
    sessionIdFromRequest === ''
      ? initialSessionId
      : sessionIdFromRequest;

  // Extract request body as string
  const reqBodyStr = reqBuf.toString('utf8');
  const reqBodyJson = parseJsonSafely(reqBodyStr);

  // Log request packet to database
  const requestResult = auditLogger.logRequestPacket({
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: reqBodyJson || reqBodyStr,
    userAgent: req.headers['user-agent'] || req.headers['User-Agent'] || null,
    remoteAddress: requestedMcpServer,
    sessionId: sessionId || null,
  });

  const { res: wrappedRes, getBody } = captureResponse(res);

  const replayReq = req.body ? req : rebuildReq(req, reqBuf);

  const parsedForTransport = reqJsonRpc ? parseJsonSafely(reqBuf.toString('utf8')) : undefined;

  // hand over to transport
  if (!transport || typeof transport.handleRequest !== 'function') {
    res.status(500).json({ error: 'Transport not available' });
    return;
  }
  await transport.handleRequest(replayReq, wrappedRes, parsedForTransport);

  // wait until response fully finished (important for SSE / streaming)
  await waitForResponseFinish(wrappedRes);

  const resBuf = getBody();

  const resHeaders =
    wrappedRes.getHeaders && typeof wrappedRes.getHeaders === 'function'
      ? wrappedRes.getHeaders()
      : {};

  // Extract response body as string
  const resBodyStr = resBuf.toString('utf8');
  const resBodyJson = parseJsonSafely(resBodyStr);

  // Extract JSON-RPC ID from request for correlation
  const jsonrpcId = reqJsonRpc?.payload?.id !== undefined ? String(reqJsonRpc.payload.id) : null;

  // Log response packet to database
  // Use the same session ID from the request
  await auditLogger.logResponsePacket({
    statusCode: wrappedRes.statusCode || 200,
    headers: resHeaders,
    body: resBodyJson || resBodyStr,
    requestFrameNumber: requestResult?.frameNumber || null,
    requestTimestampNs: requestResult?.timestampNs || null,
    jsonrpcId,
    sessionId: sessionId || null,
    userAgent: req.headers['user-agent'] || req.headers['User-Agent'] || null,
    remoteAddress: requestedMcpServer || null,
    serverKey: requestedMcpServer || null,
  });
}
