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
      source: request.remote_address || 'Client',
      dest: request.host || 'Server',
    };
  }
  return {
    source: request.host || 'Server',
    dest: request.remote_address || 'Client',
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
    const method = request.method || 'HTTP';
    const url = request.url || '';
    const rpc = request.jsonrpc_method ? ` ${request.jsonrpc_method}` : '';
    return `${method} ${url}${rpc}`;
  }
  const status = request.status_code || '';
  const rpc = request.jsonrpc_method ? ` ${request.jsonrpc_method}` : '';
  return `${status}${rpc}`;
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
