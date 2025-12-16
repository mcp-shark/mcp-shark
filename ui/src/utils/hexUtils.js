export function generateHexDump(text) {
  if (!text) {
    return [];
  }
  const bytes = new TextEncoder().encode(text);
  const lines = [];
  const chunkSize = 16;
  const totalChunks = Math.ceil(bytes.length / chunkSize);

  for (const chunkIndex of Array.from({ length: totalChunks }, (_, idx) => idx)) {
    const startOffset = chunkIndex * chunkSize;
    const chunk = bytes.slice(startOffset, startOffset + chunkSize);
    const hex = Array.from(chunk)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(' ');
    const ascii = Array.from(chunk)
      .map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : '.'))
      .join('');
    const offset = startOffset.toString(16).padStart(8, '0');
    lines.push({ offset, hex, ascii });
  }
  return lines;
}

export function createFullRequestText(headers, bodyRaw) {
  const headersText = Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\r\n');
  return headersText + (bodyRaw ? `\r\n\r\n${bodyRaw}` : '');
}
