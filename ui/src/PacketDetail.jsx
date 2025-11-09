import { useState } from 'react';
import { colors, fonts } from './theme';

// SVG Icon Component
const ChevronDown = ({ size = 12, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}
  >
    <polyline points="6 9 12 15 18 9" />
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
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: colors.bgPrimary,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${colors.borderLight}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: colors.bgCard,
          boxShadow: `0 1px 3px ${colors.shadowSm}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary,
              margin: 0,
              fontFamily: fonts.body,
            }}
          >
            #{request.frame_number}:{' '}
            {request.direction === 'request' ? 'HTTP Request' : 'HTTP Response'}
          </h3>
          <span
            style={{
              fontSize: '11px',
              color: colors.textSecondary,
              padding: '4px 8px',
              background: colors.bgSecondary,
              borderRadius: '6px',
              fontFamily: fonts.mono,
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
            color: colors.textSecondary,
            cursor: 'pointer',
            fontSize: '20px',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'all 0.2s',
          }}
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${colors.borderLight}`,
          background: colors.bgCard,
        }}
      >
        {['details', 'hex', 'raw'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 18px',
              background: activeTab === tab ? colors.bgSecondary : 'transparent',
              border: 'none',
              borderBottom:
                activeTab === tab ? `2px solid ${colors.accentBlue}` : '2px solid transparent',
              color: activeTab === tab ? colors.textPrimary : colors.textSecondary,
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: fonts.body,
              fontWeight: activeTab === tab ? '500' : '400',
              textTransform: 'capitalize',
              borderRadius: '6px 6px 0 0',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = colors.bgHover;
                e.currentTarget.style.color = colors.textPrimary;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = colors.textSecondary;
              }
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px', background: colors.bgPrimary }}>
        {activeTab === 'details' && (
          <div style={{ fontSize: '13px', fontFamily: fonts.body }}>
            {/* Request/Response Information */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  color: colors.accentBlue,
                  fontWeight: '600',
                  fontFamily: fonts.body,
                  marginBottom: '4px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={(e) => {
                  const next = e.currentTarget.nextElementSibling;
                  if (next) next.style.display = next.style.display === 'none' ? 'block' : 'none';
                }}
              >
                <ChevronDown size={12} /> Request/Response #{request.frame_number}: {request.length}{' '}
                bytes
              </div>
              <div
                style={{ paddingLeft: '16px', color: colors.textPrimary, fontFamily: fonts.body }}
              >
                <div>Entry Number: {request.frame_number}</div>
                <div>Size: {request.length} bytes</div>
                <div>Timestamp: {request.timestamp_iso}</div>
              </div>
            </div>

            {/* Network Information */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  color: colors.accentBlue,
                  fontWeight: '600',
                  fontFamily: fonts.body,
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
              <div
                style={{ paddingLeft: '16px', color: colors.textPrimary, fontFamily: fonts.body }}
              >
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
                  color: colors.accentBlue,
                  fontWeight: '600',
                  fontFamily: fonts.body,
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
              <div
                style={{ paddingLeft: '16px', color: colors.textPrimary, fontFamily: fonts.body }}
              >
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
                  color: colors.accentBlue,
                  fontWeight: '600',
                  fontFamily: fonts.body,
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
              <div
                style={{ paddingLeft: '16px', color: colors.textPrimary, fontFamily: fonts.body }}
              >
                {Object.entries(headers).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '2px' }}>
                    <span style={{ color: colors.accentBlue, fontWeight: '500' }}>{key}:</span>{' '}
                    <span style={{ color: colors.textPrimary }}>{String(value)}</span>
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
                <div
                  style={{ paddingLeft: '16px', color: colors.textPrimary, fontFamily: fonts.body }}
                >
                  <pre
                    style={{
                      background: colors.bgSecondary,
                      padding: '12px',
                      borderRadius: '6px',
                      overflow: 'auto',
                      fontSize: '12px',
                      fontFamily: fonts.mono,
                      maxHeight: '400px',
                      border: `1px solid ${colors.borderLight}`,
                      color: colors.textPrimary,
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
                <div
                  style={{ paddingLeft: '16px', color: colors.textPrimary, fontFamily: fonts.body }}
                >
                  <pre
                    style={{
                      background: colors.bgSecondary,
                      padding: '12px',
                      borderRadius: '6px',
                      overflow: 'auto',
                      fontSize: '12px',
                      fontFamily: fonts.mono,
                      maxHeight: '400px',
                      border: `1px solid ${colors.borderLight}`,
                      color: colors.textPrimary,
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
                    color: colors.error,
                    fontFamily: fonts.body,
                    fontWeight: '600',
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
                <div style={{ paddingLeft: '16px', color: colors.error, fontFamily: fonts.body }}>
                  <pre
                    style={{
                      background: colors.bgSecondary,
                      padding: '12px',
                      borderRadius: '6px',
                      overflow: 'auto',
                      fontSize: '12px',
                      fontFamily: fonts.mono,
                      maxHeight: '400px',
                      border: `1px solid ${colors.borderLight}`,
                      color: colors.textPrimary,
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
            <div
              style={{
                marginBottom: '8px',
                color: colors.textSecondary,
                fontFamily: fonts.body,
                fontWeight: '500',
              }}
            >
              Hex Dump (Offset | Hex | ASCII)
            </div>
            <div
              style={{
                background: colors.bgSecondary,
                padding: '12px',
                borderRadius: '6px',
                border: `1px solid ${colors.borderLight}`,
              }}
            >
              {hexLines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '4px 0',
                    color: colors.textPrimary,
                    fontFamily: fonts.mono,
                    fontSize: '12px',
                  }}
                >
                  <span style={{ color: colors.textSecondary, minWidth: '80px' }}>
                    {line.offset}
                  </span>
                  <span style={{ minWidth: '400px', color: colors.textPrimary }}>
                    {line.hex.padEnd(48)}
                  </span>
                  <span style={{ color: colors.textPrimary }}>{line.ascii}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div style={{ fontFamily: fonts.mono, fontSize: '12px' }}>
            <div
              style={{
                marginBottom: '8px',
                color: colors.textSecondary,
                fontFamily: fonts.body,
                fontWeight: '500',
              }}
            >
              Raw Request/Response Data (Headers + Body)
            </div>
            <pre
              style={{
                background: colors.bgSecondary,
                padding: '12px',
                borderRadius: '6px',
                overflow: 'auto',
                fontSize: '12px',
                fontFamily: fonts.mono,
                color: colors.textPrimary,
                border: `1px solid ${colors.borderLight}`,
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
