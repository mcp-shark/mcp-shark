import { useState } from 'react';

// SVG Icon Component
const ChevronDown = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

function RequestDetail({ request, onClose }) {
  const [activeTab, setActiveTab] = useState('details');

  if (!request) return null;

  const headers = request.headers_json ? JSON.parse(request.headers_json) : {};
  const body = request.body_json ? JSON.parse(request.body_json) : request.body_raw;

  // Generate hex dump - include headers and body
  const generateHexDump = (text) => {
    if (!text) return [];
    const bytes = new TextEncoder().encode(text);
    const lines = [];
    for (let i = 0; i < bytes.length; i += 16) {
      const chunk = bytes.slice(i, i + 16);
      const hex = Array.from(chunk)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ');
      const ascii = Array.from(chunk)
        .map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : '.'))
        .join('');
      const offset = i.toString(16).padStart(8, '0');
      lines.push({ offset, hex, ascii });
    }
    return lines;
  };

  // Create full request/response text for hex dump (headers + body)
  const headersText = Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\r\n');
  const fullRequestText = headersText + (request.body_raw ? '\r\n\r\n' + request.body_raw : '');
  const hexLines = generateHexDump(fullRequestText);

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}
    >
      {/* Header */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #3e3e42',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#252526',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 'normal', color: '#d4d4d4', margin: 0 }}>
            #{request.frame_number}:{' '}
            {request.direction === 'request' ? 'HTTP Request' : 'HTTP Response'}
          </h3>
          <span
            style={{
              fontSize: '11px',
              color: '#858585',
              padding: '2px 6px',
              background: '#2d2d30',
              borderRadius: '3px',
            }}
          >
            {formatBytes(request.length)} bytes
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#d4d4d4',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0 8px',
          }}
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #3e3e42', background: '#252526' }}>
        {['details', 'hex', 'raw'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              background: activeTab === tab ? '#1e1e1e' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #0e639c' : '2px solid transparent',
              color: activeTab === tab ? '#d4d4d4' : '#858585',
              cursor: 'pointer',
              fontSize: '12px',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {activeTab === 'details' && (
          <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            {/* Request/Response Information */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  color: '#4ec9b0',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={(e) => {
                  const next = e.currentTarget.nextElementSibling;
                  if (next) next.style.display = next.style.display === 'none' ? 'block' : 'none';
                }}
              >
                <ChevronDown size={12} /> Request/Response #{request.frame_number}: {request.length} bytes
              </div>
              <div style={{ paddingLeft: '16px', color: '#d4d4d4' }}>
                <div>Entry Number: {request.frame_number}</div>
                <div>Size: {request.length} bytes</div>
                <div>Timestamp: {request.timestamp_iso}</div>
              </div>
            </div>

            {/* Network Information */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  color: '#4ec9b0',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={(e) => {
                  const next = e.currentTarget.nextElementSibling;
                  if (next) next.style.display = next.style.display === 'none' ? 'block' : 'none';
                }}
              >
                <ChevronDown size={12} /> Network Information
              </div>
              <div style={{ paddingLeft: '16px', color: '#d4d4d4' }}>
                <div>Remote Address: {request.remote_address || 'N/A'}</div>
                <div>Host: {request.host || 'N/A'}</div>
                <div>User Agent: {request.user_agent || 'N/A'}</div>
                <div>Session ID: {request.session_id || 'N/A'}</div>
              </div>
            </div>

            {/* HTTP Layer */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  color: '#4ec9b0',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={(e) => {
                  const next = e.currentTarget.nextElementSibling;
                  if (next) next.style.display = next.style.display === 'none' ? 'block' : 'none';
                }}
              >
                <ChevronDown size={12} /> {request.protocol || 'HTTP'} Protocol
              </div>
              <div style={{ paddingLeft: '16px', color: '#d4d4d4' }}>
                <div>Direction: {request.direction}</div>
                {request.method && <div>Method: {request.method}</div>}
                {request.url && <div>URL: {request.url}</div>}
                {request.status_code && <div>Status Code: {request.status_code}</div>}
                {request.jsonrpc_method && <div>JSON-RPC Method: {request.jsonrpc_method}</div>}
                {request.jsonrpc_id && <div>JSON-RPC ID: {request.jsonrpc_id}</div>}
              </div>
            </div>

            {/* Headers */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  color: '#4ec9b0',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={(e) => {
                  const next = e.currentTarget.nextElementSibling;
                  if (next) next.style.display = next.style.display === 'none' ? 'block' : 'none';
                }}
              >
                <ChevronDown size={12} /> Headers
              </div>
              <div style={{ paddingLeft: '16px', color: '#d4d4d4' }}>
                {Object.entries(headers).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '2px' }}>
                    <span style={{ color: '#569cd6' }}>{key}:</span>{' '}
                    <span style={{ color: '#ce9178' }}>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            {body && (
              <div style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    color: '#4ec9b0',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={(e) => {
                    const next = e.currentTarget.nextElementSibling;
                    if (next) next.style.display = next.style.display === 'none' ? 'block' : 'none';
                  }}
                >
                  <ChevronDown size={12} /> Body
                </div>
                <div style={{ paddingLeft: '16px', color: '#d4d4d4' }}>
                  <pre
                    style={{
                      background: '#1e1e1e',
                      padding: '8px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '11px',
                      maxHeight: '400px',
                      border: '1px solid #3e3e42',
                    }}
                  >
                    {typeof body === 'object' ? JSON.stringify(body, null, 2) : body}
                  </pre>
                </div>
              </div>
            )}

            {/* JSON-RPC Result/Error */}
            {request.jsonrpc_result && (
              <div style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    color: '#4ec9b0',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={(e) => {
                    const next = e.currentTarget.nextElementSibling;
                    if (next) next.style.display = next.style.display === 'none' ? 'block' : 'none';
                  }}
                >
                  <ChevronDown size={12} /> JSON-RPC Result
                </div>
                <div style={{ paddingLeft: '16px', color: '#d4d4d4' }}>
                  <pre
                    style={{
                      background: '#1e1e1e',
                      padding: '8px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '11px',
                      maxHeight: '400px',
                      border: '1px solid #3e3e42',
                    }}
                  >
                    {JSON.stringify(JSON.parse(request.jsonrpc_result), null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {request.jsonrpc_error && (
              <div style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    color: '#f48771',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={(e) => {
                    const next = e.currentTarget.nextElementSibling;
                    if (next) next.style.display = next.style.display === 'none' ? 'block' : 'none';
                  }}
                >
                  <ChevronDown size={12} /> JSON-RPC Error
                </div>
                <div style={{ paddingLeft: '16px', color: '#f48771' }}>
                  <pre
                    style={{
                      background: '#1e1e1e',
                      padding: '8px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '11px',
                      maxHeight: '400px',
                      border: '1px solid #3e3e42',
                    }}
                  >
                    {JSON.stringify(JSON.parse(request.jsonrpc_error), null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'hex' && (
          <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>
            <div style={{ marginBottom: '8px', color: '#858585' }}>
              Hex Dump (Offset | Hex | ASCII)
            </div>
            <div style={{ background: '#1e1e1e', padding: '8px', borderRadius: '4px' }}>
              {hexLines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '2px 0',
                    color: '#d4d4d4',
                  }}
                >
                  <span style={{ color: '#858585', minWidth: '80px' }}>{line.offset}</span>
                  <span style={{ minWidth: '400px' }}>{line.hex.padEnd(48)}</span>
                  <span style={{ color: '#ce9178' }}>{line.ascii}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>
            <div style={{ marginBottom: '8px', color: '#858585' }}>
              Raw Request/Response Data (Headers + Body)
            </div>
            <pre
              style={{
                background: '#1e1e1e',
                padding: '8px',
                borderRadius: '4px',
                overflow: 'auto',
                color: '#d4d4d4',
                border: '1px solid #3e3e42',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {fullRequestText || '(empty)'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestDetail;
