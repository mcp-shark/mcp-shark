const LLM_SERVER = 'LLM Server';
export function extractServerName(request) {
  if (request.body_json) {
    try {
      const body =
        typeof request.body_json === 'string' ? JSON.parse(request.body_json) : request.body_json;
      if (body.params?.name) {
        const fullName = body.params.name;
        return fullName.includes('.') ? fullName.split('.')[0] : fullName;
      }
    } catch (_e) {
      // Failed to parse JSON, try body_raw
    }
  }

  if (request.body_raw) {
    try {
      const body =
        typeof request.body_raw === 'string' ? JSON.parse(request.body_raw) : request.body_raw;
      if (body.params?.name) {
        const fullName = body.params.name;
        return fullName.includes('.') ? fullName.split('.')[0] : fullName;
      }
    } catch (_e) {
      // Failed to parse
    }
  }

  if (request.host) {
    return request.host;
  }

  return '__UNKNOWN_SERVER__';
}

export function formatRelativeTime(timestampISO, firstTime) {
  if (!firstTime) {
    return '0.000000';
  }
  const diff = new Date(timestampISO) - new Date(firstTime);
  return (diff / 1000).toFixed(6);
}

export function formatDateTime(timestampISO) {
  if (!timestampISO) {
    return '-';
  }
  try {
    const date = new Date(timestampISO);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch (_e) {
    return timestampISO;
  }
}

export function getSourceDest(request) {
  if (request.direction === 'request') {
    return {
      source: LLM_SERVER,
      dest: request.remote_address || 'Unknown MCP Client',
    };
  }
  return {
    source: request.remote_address || 'Unknown MCP Server',
    dest: LLM_SERVER,
  };
}

export function getEndpoint(request) {
  if (request.direction === 'request') {
    if (request.body_json) {
      try {
        const body =
          typeof request.body_json === 'string' ? JSON.parse(request.body_json) : request.body_json;
        if (body && typeof body === 'object' && body.method) {
          return body.method;
        }
      } catch (_e) {
        // Failed to parse JSON, try body_raw
      }
    }
    if (request.body_raw) {
      try {
        const body =
          typeof request.body_raw === 'string' ? JSON.parse(request.body_raw) : request.body_raw;
        if (body && typeof body === 'object' && body.method) {
          return body.method;
        }
      } catch (_e) {
        // Failed to parse
      }
    }
    if (request.jsonrpc_method) {
      return request.jsonrpc_method;
    }
    if (request.url) {
      try {
        const url = new URL(request.url);
        return url.pathname + (url.search || '');
      } catch (_e) {
        const url = request.url;
        const match = url.match(/^https?:\/\/[^\/]+(\/.*)$/);
        return match ? match[1] : url;
      }
    }
  }
  return '-';
}

export function getInfo(request) {
  if (request.direction === 'request') {
    // Use getEndpoint to get the method/endpoint (it already handles extraction from body)
    const endpoint = getEndpoint(request);

    // Get HTTP method if available
    const httpMethod = request.method || '';

    // Get URL if available
    const url = request.url || '';

    // Build info string - prioritize endpoint (JSON-RPC method), then HTTP method + URL, then just method
    if (endpoint && endpoint !== '-') {
      // If we have both HTTP method and endpoint, show both
      if (httpMethod && url) {
        return `${httpMethod} ${endpoint}`;
      }
      if (httpMethod) {
        return `${httpMethod} ${endpoint}`;
      }
      return endpoint;
    }
    if (httpMethod && url) {
      return `${httpMethod} ${url}`;
    }
    if (httpMethod) {
      return httpMethod;
    }
    if (url) {
      return url;
    }
    return 'Request';
  }

  // For responses
  const status = request.status_code || '';

  // Try to get JSON-RPC method if available
  const rpcMethod = request.jsonrpc_method || getJsonRpcMethod(request);

  if (status && rpcMethod) {
    return `${status} ${rpcMethod}`;
  }
  if (status) {
    return `Status: ${status}`;
  }
  if (rpcMethod) {
    return rpcMethod;
  }
  return 'Response';
}

export function getRequestColor(request) {
  if (request.direction === 'request') {
    return '#faf9f7';
  }
  if (request.status_code >= 400) {
    return '#fef0f0';
  }
  if (request.status_code >= 300) {
    return '#fff8e8';
  }
  return '#f0f8f0';
}

// Helper function to extract JSON-RPC method from a request or response
export function getJsonRpcMethod(req) {
  // First check the jsonrpc_method field (most reliable)
  if (req.jsonrpc_method) {
    return req.jsonrpc_method;
  }

  // For requests, try to extract from body
  if (req.direction === 'request') {
    if (req.body_json) {
      try {
        const body = typeof req.body_json === 'string' ? JSON.parse(req.body_json) : req.body_json;
        if (body && typeof body === 'object' && body.method) {
          return body.method;
        }
      } catch (_e) {
        // Failed to parse
      }
    }
    if (req.body_raw) {
      try {
        const body = typeof req.body_raw === 'string' ? JSON.parse(req.body_raw) : req.body_raw;
        if (body && typeof body === 'object' && body.method) {
          return body.method;
        }
      } catch (_e) {
        // Failed to parse
      }
    }
  }

  // For responses, try to extract from body if available
  if (req.direction === 'response' && req.body_json) {
    try {
      const _body = typeof req.body_json === 'string' ? JSON.parse(req.body_json) : req.body_json;
      // Responses don't have a method field, but we can check if it's an error response
      // For now, we'll rely on jsonrpc_method field
    } catch (_e) {
      // Failed to parse
    }
  }

  return null;
}

// Re-export pairRequestsWithResponses from requestPairing.js
export { pairRequestsWithResponses } from './requestPairing.js';
