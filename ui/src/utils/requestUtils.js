const LLM_SERVER = 'LLM Server';
export function extractServerName(request) {
  if (request.body_json) {
    try {
      const body =
        typeof request.body_json === 'string' ? JSON.parse(request.body_json) : request.body_json;
      if (body.params && body.params.name) {
        const fullName = body.params.name;
        return fullName.includes('.') ? fullName.split('.')[0] : fullName;
      }
    } catch (e) {
      // Failed to parse JSON, try body_raw
    }
  }

  if (request.body_raw) {
    try {
      const body =
        typeof request.body_raw === 'string' ? JSON.parse(request.body_raw) : request.body_raw;
      if (body.params && body.params.name) {
        const fullName = body.params.name;
        return fullName.includes('.') ? fullName.split('.')[0] : fullName;
      }
    } catch (e) {
      // Failed to parse
    }
  }

  if (request.host) {
    return request.host;
  }

  return '__UNKNOWN_SERVER__';
}

export function formatRelativeTime(timestampISO, firstTime) {
  if (!firstTime) return '0.000000';
  const diff = new Date(timestampISO) - new Date(firstTime);
  return (diff / 1000).toFixed(6);
}

export function formatDateTime(timestampISO) {
  if (!timestampISO) return '-';
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
  } catch (e) {
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
      } catch (e) {
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
      } catch (e) {
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
      } catch (e) {
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
      } else if (httpMethod) {
        return `${httpMethod} ${endpoint}`;
      }
      return endpoint;
    } else if (httpMethod && url) {
      return `${httpMethod} ${url}`;
    } else if (httpMethod) {
      return httpMethod;
    } else if (url) {
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
  } else if (status) {
    return `Status: ${status}`;
  } else if (rpcMethod) {
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
      } catch (e) {
        // Failed to parse
      }
    }
    if (req.body_raw) {
      try {
        const body = typeof req.body_raw === 'string' ? JSON.parse(req.body_raw) : req.body_raw;
        if (body && typeof body === 'object' && body.method) {
          return body.method;
        }
      } catch (e) {
        // Failed to parse
      }
    }
  }

  // For responses, try to extract from body if available
  if (req.direction === 'response' && req.body_json) {
    try {
      const body = typeof req.body_json === 'string' ? JSON.parse(req.body_json) : req.body_json;
      // Responses don't have a method field, but we can check if it's an error response
      // For now, we'll rely on jsonrpc_method field
    } catch (e) {
      // Failed to parse
    }
  }

  return null;
}

export function pairRequestsWithResponses(requests) {
  const pairs = [];
  const processed = new Set();

  // Helper function to check if two requests match (same session, JSON-RPC method, and optionally jsonrpc_id)
  const matches = (req, resp) => {
    // Session ID must match (or both null for initiation)
    const sessionMatch = req.session_id === resp.session_id;
    if (!sessionMatch) return false;

    // JSON-RPC Method must match
    const reqMethod = getJsonRpcMethod(req);
    const respMethod = getJsonRpcMethod(resp);

    // Both must have a method, and they must match
    if (!reqMethod || !respMethod) {
      // If either doesn't have a method, we can't match by method
      // Fall back to JSON-RPC ID matching only
      if (req.jsonrpc_id && resp.jsonrpc_id) {
        return req.jsonrpc_id === resp.jsonrpc_id;
      }
      // If no method and no ID, we can't match reliably
      return false;
    }

    const methodMatch = reqMethod === respMethod;
    if (!methodMatch) return false;

    // If JSON-RPC ID exists, it must match (for more precise pairing)
    if (req.jsonrpc_id && resp.jsonrpc_id) {
      return req.jsonrpc_id === resp.jsonrpc_id;
    }

    // If no JSON-RPC ID, match by session and method only
    return true;
  };

  requests.forEach((request) => {
    if (processed.has(request.frame_number)) return;

    if (request.direction === 'request') {
      // Find matching response - must match session, endpoint, and optionally jsonrpc_id
      const response = requests.find(
        (r) =>
          r.direction === 'response' &&
          !processed.has(r.frame_number) &&
          matches(request, r) &&
          r.frame_number > request.frame_number
      );

      if (response) {
        pairs.push({ request, response, frame_number: request.frame_number });
        processed.add(request.frame_number);
        processed.add(response.frame_number);
      } else {
        // Request without response
        pairs.push({ request, response: null, frame_number: request.frame_number });
        processed.add(request.frame_number);
      }
    } else if (request.direction === 'response') {
      // Find matching request - must match session, endpoint, and optionally jsonrpc_id
      const matchingRequest = requests.find(
        (r) =>
          r.direction === 'request' &&
          !processed.has(r.frame_number) &&
          matches(r, request) &&
          r.frame_number < request.frame_number
      );

      if (!matchingRequest) {
        // Response without request (orphaned)
        pairs.push({ request: null, response: request, frame_number: request.frame_number });
        processed.add(request.frame_number);
      }
      // If matching request exists, it will be handled when we iterate over it
    }
  });

  // Sort by frame number (descending - latest first)
  return pairs.sort((a, b) => b.frame_number - a.frame_number);
}
