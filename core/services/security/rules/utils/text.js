const JSON_SPACES = 0;

const stringify = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value, null, JSON_SPACES);
  } catch {
    return String(value);
  }
};

export const toolToText = (tool = {}) => {
  const parts = [
    tool.name,
    tool.title,
    tool.description,
    stringify(tool.input_schema || tool.inputSchema),
    stringify(tool.output_schema || tool.outputSchema),
    Array.isArray(tool.tags) ? tool.tags.join(' ') : '',
    tool.server_name,
    tool.server?.name,
  ];
  return parts.filter(Boolean).join(' ');
};

export const resourceToText = (resource = {}) => {
  const parts = [
    resource.uri,
    resource.name,
    resource.title,
    resource.description,
    resource.mimeType || resource.mime_type,
    Array.isArray(resource.tags) ? resource.tags.join(' ') : '',
    resource.server_name,
  ];
  return parts.filter(Boolean).join(' ');
};

export const promptToText = (prompt = {}) => {
  const parts = [
    prompt.name,
    prompt.title,
    prompt.description,
    stringify(prompt.arguments),
    Array.isArray(prompt.tags) ? prompt.tags.join(' ') : '',
  ];
  return parts.filter(Boolean).join(' ');
};

export const packetToText = (packet = {}) => {
  const parts = [];
  if (packet.body) {
    const bodyStr = typeof packet.body === 'string' ? packet.body : stringify(packet.body);
    parts.push(bodyStr);
  }
  if (packet.headers) {
    parts.push(stringify(packet.headers));
  }
  return parts.filter(Boolean).join(' ');
};

export const unique = (items = []) => {
  return Array.from(new Set(items.filter(Boolean)));
};

export const summarizeList = (items = [], limit = 5) => {
  if (!items.length) {
    return '';
  }
  if (items.length <= limit) {
    return items.join(', ');
  }
  const head = items.slice(0, limit).join(', ');
  return `${head}, +${items.length - limit} more`;
};

export const normalizeName = (value) => (value || '').trim().toLowerCase();
