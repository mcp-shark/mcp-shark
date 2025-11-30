import { useState } from 'react';
import { colors, fonts } from '../theme';
import CollapsibleSection from './CollapsibleSection';

const ChevronDown = ({ size = 14, color = 'currentColor', rotated = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      transform: rotated ? 'rotate(-90deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s ease',
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

function CollapsibleRequestResponse({ title, titleColor, children, defaultExpanded = true }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      style={{
        background: colors.bgCard,
        borderRadius: '8px',
        border: `1px solid ${colors.borderLight}`,
        overflow: 'hidden',
        marginBottom: '20px',
      }}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '16px 20px',
          background: isExpanded ? colors.bgCard : colors.bgSecondary,
          borderBottom: isExpanded ? `1px solid ${colors.borderLight}` : 'none',
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.bgHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isExpanded ? colors.bgCard : colors.bgSecondary;
        }}
      >
        <div
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: titleColor,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: fonts.body,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ChevronDown size={14} color={titleColor} rotated={!isExpanded} />
          {title}
        </div>
      </div>
      {isExpanded && <div style={{ padding: '20px' }}>{children}</div>}
    </div>
  );
}

function DetailsTab({
  request,
  response,
  requestHeaders,
  requestBody,
  responseHeaders,
  responseBody,
}) {
  return (
    <div style={{ padding: '20px', overflow: 'auto', flex: 1, background: colors.bgPrimary }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {/* Request Section */}
        {request && (
          <CollapsibleRequestResponse
            title="Request"
            titleColor={colors.accentBlue}
            defaultExpanded={true}
          >
            <CollapsibleSection title="Network Information">
              <div
                style={{
                  fontSize: '12px',
                  color: colors.textPrimary,
                  fontFamily: fonts.body,
                  marginBottom: '4px',
                }}
              >
                Remote Address:{' '}
                <span style={{ color: colors.textSecondary, fontFamily: fonts.mono }}>
                  {request.remote_address || 'N/A'}
                </span>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: colors.textPrimary,
                  fontFamily: fonts.body,
                  marginBottom: '4px',
                }}
              >
                Host:{' '}
                <span style={{ color: colors.textSecondary, fontFamily: fonts.mono }}>
                  {request.host || 'N/A'}
                </span>
              </div>
              {request.user_agent && (
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                    marginBottom: '4px',
                  }}
                >
                  User Agent:{' '}
                  <span style={{ color: colors.textSecondary, fontSize: '11px' }}>
                    {request.user_agent}
                  </span>
                </div>
              )}
              {request.session_id && (
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                    marginBottom: '4px',
                  }}
                >
                  Session ID:{' '}
                  <span style={{ color: colors.textSecondary, fontFamily: fonts.mono }}>
                    {request.session_id}
                  </span>
                </div>
              )}
            </CollapsibleSection>

            <CollapsibleSection title={`${request.protocol || 'HTTP'} Protocol`}>
              <div
                style={{
                  fontSize: '12px',
                  color: colors.textPrimary,
                  fontFamily: fonts.body,
                  marginBottom: '4px',
                }}
              >
                Direction:{' '}
                <span style={{ color: colors.accentBlue, fontWeight: '500' }}>
                  {request.direction}
                </span>
              </div>
              {request.method && (
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                    marginBottom: '4px',
                  }}
                >
                  Method:{' '}
                  <span
                    style={{
                      color: colors.textSecondary,
                      fontFamily: fonts.mono,
                      fontWeight: '500',
                    }}
                  >
                    {request.method}
                  </span>
                </div>
              )}
              {request.url && (
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                    marginBottom: '4px',
                  }}
                >
                  URL:{' '}
                  <span
                    style={{
                      color: colors.textSecondary,
                      fontFamily: fonts.mono,
                      wordBreak: 'break-all',
                    }}
                  >
                    {request.url}
                  </span>
                </div>
              )}
              {request.jsonrpc_method && (
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                    marginBottom: '4px',
                  }}
                >
                  JSON-RPC Method:{' '}
                  <span style={{ color: colors.textSecondary, fontFamily: fonts.mono }}>
                    {request.jsonrpc_method}
                  </span>
                </div>
              )}
              {request.jsonrpc_id && (
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                    marginBottom: '4px',
                  }}
                >
                  JSON-RPC ID:{' '}
                  <span style={{ color: colors.textSecondary, fontFamily: fonts.mono }}>
                    {request.jsonrpc_id}
                  </span>
                </div>
              )}
            </CollapsibleSection>

            {Object.keys(requestHeaders).length > 0 && (
              <CollapsibleSection title="Headers">
                {Object.entries(requestHeaders).map(([key, value]) => (
                  <div
                    key={key}
                    style={{ marginBottom: '6px', fontSize: '12px', fontFamily: fonts.body }}
                  >
                    <span
                      style={{
                        color: colors.accentBlue,
                        fontWeight: '500',
                        fontFamily: fonts.mono,
                      }}
                    >
                      {key}:
                    </span>{' '}
                    <span style={{ color: colors.textPrimary }}>{String(value)}</span>
                  </div>
                ))}
              </CollapsibleSection>
            )}

            {requestBody && (
              <CollapsibleSection title="Body" titleColor={colors.accentGreen}>
                <pre
                  style={{
                    background: colors.bgSecondary,
                    padding: '16px',
                    borderRadius: '8px',
                    overflow: 'auto',
                    fontSize: '12px',
                    fontFamily: fonts.mono,
                    maxHeight: '400px',
                    border: `1px solid ${colors.borderLight}`,
                    color: colors.textPrimary,
                    lineHeight: '1.5',
                  }}
                >
                  {typeof requestBody === 'object'
                    ? JSON.stringify(requestBody, null, 2)
                    : requestBody}
                </pre>
              </CollapsibleSection>
            )}
          </CollapsibleRequestResponse>
        )}

        {/* Response Section */}
        {response && (
          <CollapsibleRequestResponse
            title="Response"
            titleColor={colors.accentGreen}
            defaultExpanded={true}
          >
            <CollapsibleSection title="Network Information">
              <div
                style={{
                  fontSize: '12px',
                  color: colors.textPrimary,
                  fontFamily: fonts.body,
                  marginBottom: '4px',
                }}
              >
                Remote Address:{' '}
                <span style={{ color: colors.textSecondary, fontFamily: fonts.mono }}>
                  {response.remote_address || 'N/A'}
                </span>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: colors.textPrimary,
                  fontFamily: fonts.body,
                  marginBottom: '4px',
                }}
              >
                Host:{' '}
                <span style={{ color: colors.textSecondary, fontFamily: fonts.mono }}>
                  {response.host || 'N/A'}
                </span>
              </div>
              {response.session_id && (
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                    marginBottom: '4px',
                  }}
                >
                  Session ID:{' '}
                  <span style={{ color: colors.textSecondary, fontFamily: fonts.mono }}>
                    {response.session_id}
                  </span>
                </div>
              )}
            </CollapsibleSection>

            <CollapsibleSection title={`${response.protocol || 'HTTP'} Protocol`}>
              <div
                style={{
                  fontSize: '12px',
                  color: colors.textPrimary,
                  fontFamily: fonts.body,
                  marginBottom: '4px',
                }}
              >
                Direction:{' '}
                <span style={{ color: colors.accentGreen, fontWeight: '500' }}>
                  {response.direction}
                </span>
              </div>
              {response.status_code && (
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                    marginBottom: '4px',
                  }}
                >
                  Status Code:{' '}
                  <span
                    style={{
                      color:
                        response.status_code >= 400
                          ? colors.error
                          : response.status_code >= 300
                            ? colors.warning
                            : colors.success,
                      fontFamily: fonts.mono,
                      fontWeight: '600',
                    }}
                  >
                    {response.status_code}
                  </span>
                </div>
              )}
              {response.jsonrpc_method && (
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                    marginBottom: '4px',
                  }}
                >
                  JSON-RPC Method:{' '}
                  <span style={{ color: colors.textSecondary, fontFamily: fonts.mono }}>
                    {response.jsonrpc_method}
                  </span>
                </div>
              )}
              {response.jsonrpc_id && (
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                    marginBottom: '4px',
                  }}
                >
                  JSON-RPC ID:{' '}
                  <span style={{ color: colors.textSecondary, fontFamily: fonts.mono }}>
                    {response.jsonrpc_id}
                  </span>
                </div>
              )}
            </CollapsibleSection>

            {Object.keys(responseHeaders).length > 0 && (
              <CollapsibleSection title="Headers">
                {Object.entries(responseHeaders).map(([key, value]) => (
                  <div
                    key={key}
                    style={{ marginBottom: '6px', fontSize: '12px', fontFamily: fonts.body }}
                  >
                    <span
                      style={{
                        color: colors.accentGreen,
                        fontWeight: '500',
                        fontFamily: fonts.mono,
                      }}
                    >
                      {key}:
                    </span>{' '}
                    <span style={{ color: colors.textPrimary }}>{String(value)}</span>
                  </div>
                ))}
              </CollapsibleSection>
            )}

            {responseBody && (
              <CollapsibleSection title="Body" titleColor={colors.accentGreen}>
                <pre
                  style={{
                    background: colors.bgSecondary,
                    padding: '16px',
                    borderRadius: '8px',
                    overflow: 'auto',
                    fontSize: '12px',
                    fontFamily: fonts.mono,
                    maxHeight: '400px',
                    border: `1px solid ${colors.borderLight}`,
                    color: colors.textPrimary,
                    lineHeight: '1.5',
                  }}
                >
                  {typeof responseBody === 'object'
                    ? JSON.stringify(responseBody, null, 2)
                    : responseBody}
                </pre>
              </CollapsibleSection>
            )}

            {response.jsonrpc_result && (
              <CollapsibleSection title="JSON-RPC Result" titleColor={colors.accentGreen}>
                <pre
                  style={{
                    background: colors.bgSecondary,
                    padding: '16px',
                    borderRadius: '8px',
                    overflow: 'auto',
                    fontSize: '12px',
                    fontFamily: fonts.mono,
                    maxHeight: '400px',
                    border: `1px solid ${colors.borderLight}`,
                    color: colors.textPrimary,
                    lineHeight: '1.5',
                  }}
                >
                  {JSON.stringify(JSON.parse(response.jsonrpc_result), null, 2)}
                </pre>
              </CollapsibleSection>
            )}

            {response.jsonrpc_error && (
              <CollapsibleSection title="JSON-RPC Error" titleColor={colors.error}>
                <pre
                  style={{
                    background: colors.bgSecondary,
                    padding: '16px',
                    borderRadius: '8px',
                    overflow: 'auto',
                    fontSize: '12px',
                    fontFamily: fonts.mono,
                    maxHeight: '400px',
                    border: `1px solid ${colors.borderLight}`,
                    color: colors.error,
                    lineHeight: '1.5',
                  }}
                >
                  {JSON.stringify(JSON.parse(response.jsonrpc_error), null, 2)}
                </pre>
              </CollapsibleSection>
            )}
          </CollapsibleRequestResponse>
        )}
      </div>
    </div>
  );
}

export default DetailsTab;
