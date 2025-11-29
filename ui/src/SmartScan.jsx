import { useState, useEffect, useRef } from 'react';
import { colors, fonts } from './theme';

const ShieldIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const ExternalLinkIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const AlertIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CheckIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function getRiskLevelColor(riskLevel) {
  if (!riskLevel) return colors.textTertiary;
  switch (riskLevel.toLowerCase()) {
    case 'none':
      return colors.accentGreen;
    case 'low':
      return colors.accentBlue;
    case 'medium':
      return colors.accentOrange;
    case 'high':
      return colors.error;
    case 'critical':
      return colors.error;
    default:
      return colors.textTertiary;
  }
}

function SmartScan() {
  const [apiToken, setApiToken] = useState('');
  const [serverStatus, setServerStatus] = useState(null);
  const [mcpData, setMcpData] = useState(null);
  const [discoveredServers, setDiscoveredServers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanResults, setScanResults] = useState([]);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const saveTokenTimeoutRef = useRef(null);

  useEffect(() => {
    checkServerStatus();
    loadStoredToken();
    const interval = setInterval(checkServerStatus, 2000);
    return () => {
      clearInterval(interval);
      if (saveTokenTimeoutRef.current) {
        clearTimeout(saveTokenTimeoutRef.current);
      }
    };
  }, []);

  const loadStoredToken = async () => {
    try {
      const response = await fetch('/api/smartscan/token');
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          setApiToken(data.token);
        }
      }
    } catch (err) {
      // Silently fail - token might not exist yet
      console.debug('No stored token found');
    }
  };

  const saveToken = async (token) => {
    try {
      const response = await fetch('/api/smartscan/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        console.error('Failed to save token');
      }
    } catch (err) {
      console.error('Error saving token:', err);
    }
  };

  const checkServerStatus = async () => {
    try {
      const res = await fetch('/api/composite/status');
      if (!res.ok) {
        throw new Error('Server not available');
      }
      const data = await res.json();
      setServerStatus(data);
    } catch (err) {
      setServerStatus({ running: false });
    }
  };

  const makeMcpRequest = async (method, params = {}) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (sessionId) {
        headers['Mcp-Session-Id'] = sessionId;
      }

      const response = await fetch('/api/playground/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({ method, params }),
      });

      const data = await response.json();

      const responseSessionId =
        response.headers.get('Mcp-Session-Id') ||
        response.headers.get('mcp-session-id') ||
        data._sessionId;
      if (responseSessionId && responseSessionId !== sessionId) {
        setSessionId(responseSessionId);
      }

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Request failed');
      }

      return data.result || data;
    } catch (err) {
      throw err;
    }
  };

  const discoverMcpData = async () => {
    setLoadingData(true);
    setError(null);
    setMcpData(null);
    setDiscoveredServers([]);

    try {
      // Discover all servers from config
      const response = await fetch('/api/smartscan/discover');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to discover servers');
      }

      const data = await response.json();
      if (!data.success || !data.servers || data.servers.length === 0) {
        throw new Error(
          'No MCP servers found in config. Please configure servers in the Setup tab.'
        );
      }

      setDiscoveredServers(data.servers);

      // For backward compatibility, also set mcpData to first server
      if (data.servers.length > 0) {
        const firstServer = data.servers[0];
        setMcpData({
          server: {
            name: firstServer.name,
            description: `Discovered from MCP config`,
          },
          tools: firstServer.tools || [],
          resources: firstServer.resources || [],
          prompts: firstServer.prompts || [],
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to discover MCP server data');
    } finally {
      setLoadingData(false);
    }
  };

  const runScan = async () => {
    if (!apiToken) {
      setError('Please enter your API token');
      return;
    }

    if (!discoveredServers || discoveredServers.length === 0) {
      setError('Please discover MCP servers first');
      return;
    }

    setScanning(true);
    setError(null);
    setScanResult(null);
    setScanResults([]);

    try {
      // Send batch scan requests (one per server)
      const response = await fetch('/api/smartscan/scans/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiToken,
          servers: discoveredServers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || data.message || `API error: ${response.status}`;

        if (response.status === 400 && data.details) {
          if (Array.isArray(data.details)) {
            errorMessage = `Validation failed: ${data.details
              .map((d) => {
                if (typeof d === 'string') return d;
                if (d.field && d.message) return `${d.field}: ${d.message}`;
                return JSON.stringify(d);
              })
              .join('; ')}`;
          } else if (typeof data.details === 'string') {
            errorMessage = data.details;
          }
        }

        setError(errorMessage);
        return;
      }

      // Process results
      if (data.results && Array.isArray(data.results)) {
        setScanResults(data.results);

        // For backward compatibility, set scanResult to first successful result
        const firstSuccess = data.results.find((r) => r.success);
        if (firstSuccess) {
          setScanResult(firstSuccess.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to run scan');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div
      data-tab-content
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '48px 32px',
        background: colors.bgPrimary,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${colors.accentBlue}20, ${colors.accentGreen}20)`,
              border: `2px solid ${colors.accentBlue}40`,
            }}
          >
            <ShieldIcon size={40} color={colors.accentBlue} />
          </div>
          <div>
            <h1
              style={{
                fontSize: '36px',
                fontWeight: '700',
                color: colors.textPrimary,
                fontFamily: fonts.body,
                margin: 0,
                marginBottom: '12px',
                letterSpacing: '-0.5px',
              }}
            >
              Smart Scan
            </h1>
            <p
              style={{
                fontSize: '18px',
                color: colors.textSecondary,
                fontFamily: fonts.body,
                margin: 0,
                lineHeight: '1.6',
              }}
            >
              AI-powered security analysis for MCP servers
            </p>
          </div>
        </div>

        {/* API Token Section */}
        <div
          style={{
            background: colors.bgCard,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '20px',
            boxShadow: `0 2px 8px ${colors.shadowSm}`,
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              fontFamily: fonts.body,
              marginBottom: '12px',
            }}
          >
            API Token
          </h2>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              marginBottom: '8px',
            }}
          >
            <div style={{ flex: 1, minWidth: '280px' }}>
              <input
                type="password"
                value={apiToken}
                onChange={(e) => {
                  const newToken = e.target.value;
                  setApiToken(newToken);
                  // Save token when changed (debounced)
                  if (saveTokenTimeoutRef.current) {
                    clearTimeout(saveTokenTimeoutRef.current);
                  }
                  if (newToken) {
                    saveTokenTimeoutRef.current = setTimeout(() => {
                      saveToken(newToken);
                    }, 1000);
                  } else {
                    // Clear token if input is empty
                    saveToken('');
                  }
                }}
                placeholder="Enter your Smart Scan API token (sk_...)"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${colors.borderMedium}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: fonts.body,
                  background: colors.bgSecondary,
                  color: colors.textPrimary,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <a
              href="https://smart-scan.mcp-shark.org/tokens"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                background: colors.buttonSecondary,
                color: colors.textPrimary,
                border: `1px solid ${colors.borderMedium}`,
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: fonts.body,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.buttonSecondaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.buttonSecondary;
              }}
            >
              <span>Get Token</span>
              <ExternalLinkIcon size={12} color={colors.textPrimary} />
            </a>
          </div>
          <p
            style={{
              fontSize: '12px',
              color: colors.textTertiary,
              fontFamily: fonts.body,
              marginTop: '8px',
              marginBottom: 0,
              lineHeight: '1.5',
            }}
          >
            Don't have a token? Sign up at{' '}
            <a
              href="https://smart-scan.mcp-shark.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: colors.accentBlue, textDecoration: 'none' }}
            >
              smart-scan.mcp-shark.org
            </a>{' '}
            to get your API token.
          </p>
        </div>

        {/* Discover MCP Data Section */}
        <div
          style={{
            background: colors.bgCard,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '20px',
            boxShadow: `0 2px 8px ${colors.shadowSm}`,
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              fontFamily: fonts.body,
              marginBottom: '12px',
            }}
          >
            MCP Server Data
          </h2>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: '8px',
            }}
          >
            <button
              onClick={discoverMcpData}
              disabled={loadingData}
              style={{
                padding: '10px 20px',
                background: !loadingData ? colors.buttonPrimary : colors.buttonSecondary,
                color: !loadingData ? colors.textInverse : colors.textTertiary,
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: fonts.body,
                cursor: !loadingData ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loadingData) {
                  e.currentTarget.style.background = colors.buttonPrimaryHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!loadingData) {
                  e.currentTarget.style.background = colors.buttonPrimary;
                }
              }}
            >
              {loadingData ? 'Discovering...' : 'Discover from Config'}
            </button>
            {discoveredServers.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  fontSize: '13px',
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontWeight: '500' }}>
                  ✓ {discoveredServers.length} server{discoveredServers.length !== 1 ? 's' : ''}
                </span>
                {discoveredServers.map((server, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '4px 10px',
                      background: colors.bgTertiary,
                      borderRadius: '6px',
                      fontSize: '12px',
                      border: `1px solid ${colors.borderLight}`,
                    }}
                  >
                    {server.name}: {server.tools?.length || 0} tools,{' '}
                    {server.resources?.length || 0} resources, {server.prompts?.length || 0} prompts
                  </span>
                ))}
              </div>
            )}
          </div>
          {discoveredServers.length === 0 && !loadingData && (
            <p
              style={{
                fontSize: '13px',
                color: colors.textTertiary,
                fontFamily: fonts.body,
                marginTop: '12px',
                marginBottom: 0,
              }}
            >
              Click "Discover from Config" to scan all MCP servers from your configuration file.
            </p>
          )}
        </div>

        {/* Run Scan Section */}
        <div
          style={{
            background: colors.bgCard,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '20px',
            boxShadow: `0 2px 8px ${colors.shadowSm}`,
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              fontFamily: fonts.body,
              marginBottom: '12px',
            }}
          >
            Run Security Scan
          </h2>
          <button
            onClick={runScan}
            disabled={!apiToken || discoveredServers.length === 0 || scanning}
            style={{
              padding: '10px 20px',
              background:
                apiToken && discoveredServers.length > 0 && !scanning
                  ? colors.buttonPrimary
                  : colors.buttonSecondary,
              color:
                apiToken && discoveredServers.length > 0 && !scanning
                  ? colors.textInverse
                  : colors.textTertiary,
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: fonts.body,
              cursor:
                apiToken && discoveredServers.length > 0 && !scanning ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (apiToken && discoveredServers.length > 0 && !scanning) {
                e.currentTarget.style.background = colors.buttonPrimaryHover;
              }
            }}
            onMouseLeave={(e) => {
              if (apiToken && discoveredServers.length > 0 && !scanning) {
                e.currentTarget.style.background = colors.buttonPrimary;
              }
            }}
          >
            {scanning
              ? `Scanning ${discoveredServers.length} server${discoveredServers.length !== 1 ? 's' : ''}...`
              : `Run Scan (${discoveredServers.length} server${discoveredServers.length !== 1 ? 's' : ''})`}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div
            style={{
              background: colors.bgCard,
              border: `1px solid ${colors.error}`,
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '32px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
            }}
          >
            <AlertIcon size={22} color={colors.error} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: '16px',
                  color: colors.error,
                  fontFamily: fonts.body,
                  margin: 0,
                  fontWeight: '600',
                  marginBottom: '6px',
                }}
              >
                Error
              </p>
              <p
                style={{
                  fontSize: '14px',
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Results Display - Multiple Servers */}
        {scanResults.length > 0 && (
          <div
            style={{
              background: colors.bgCard,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '16px',
              padding: '32px',
              boxShadow: `0 4px 12px ${colors.shadowSm}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  fontFamily: fonts.body,
                  margin: 0,
                }}
              >
                Scan Results ({scanResults.length} server{scanResults.length !== 1 ? 's' : ''})
              </h2>
              {scanResults.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    fontSize: '13px',
                    color: colors.textSecondary,
                    fontFamily: fonts.body,
                  }}
                >
                  {scanResults.filter((r) => r.cached).length > 0 && (
                    <span>📦 {scanResults.filter((r) => r.cached).length} cached</span>
                  )}
                  {scanResults.filter((r) => r.success && !r.cached).length > 0 && (
                    <span>
                      ✓ {scanResults.filter((r) => r.success && !r.cached).length} scanned
                    </span>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {scanResults.map((result, idx) => (
                <div
                  key={idx}
                  style={{
                    background: colors.bgTertiary,
                    border: `1px solid ${result.success ? colors.borderLight : colors.error}`,
                    borderRadius: '12px',
                    padding: '20px 24px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: result.success ? '16px' : 0,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '17px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        fontFamily: fonts.body,
                        margin: 0,
                      }}
                    >
                      {result.serverName}
                    </h3>
                    {result.success ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {result.cached && (
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '600',
                              fontFamily: fonts.body,
                              background: colors.bgTertiary,
                              color: colors.textSecondary,
                              border: `1px solid ${colors.borderLight}`,
                            }}
                            title="This result was retrieved from cache"
                          >
                            📦 Cached
                          </span>
                        )}
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            fontFamily: fonts.body,
                            background: colors.accentGreen,
                            color: colors.textInverse,
                          }}
                        >
                          ✓ Success
                        </span>
                      </div>
                    ) : (
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          fontFamily: fonts.body,
                          background: colors.error,
                          color: colors.textInverse,
                        }}
                      >
                        ✗ Failed
                      </span>
                    )}
                  </div>

                  {result.success && result.data && (
                    <div>
                      {result.data.data?.overall_risk_level && (
                        <div style={{ marginBottom: '16px' }}>
                          <span
                            style={{
                              padding: '6px 14px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '700',
                              fontFamily: fonts.body,
                              background: getRiskLevelColor(result.data.data.overall_risk_level),
                              color: colors.textInverse,
                              marginRight: '12px',
                            }}
                          >
                            {result.data.data.overall_risk_level.toUpperCase()}
                          </span>
                          <span
                            style={{
                              fontSize: '14px',
                              color: colors.textSecondary,
                              fontFamily: fonts.body,
                            }}
                          >
                            Overall Risk
                          </span>
                        </div>
                      )}
                      {result.data.scan_id && (
                        <a
                          href={`https://smart.mcpshark.sh/scan-results?id=${result.data.scan_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            color: colors.accentBlue,
                            textDecoration: 'none',
                            fontFamily: fonts.body,
                            fontWeight: '500',
                          }}
                        >
                          View Full Results
                          <ExternalLinkIcon size={12} color={colors.accentBlue} />
                        </a>
                      )}
                    </div>
                  )}

                  {!result.success && (
                    <p
                      style={{
                        fontSize: '14px',
                        color: colors.error,
                        fontFamily: fonts.body,
                        margin: '12px 0 0 0',
                        lineHeight: '1.6',
                      }}
                    >
                      {result.error || 'Unknown error'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Display - Single (Backward Compatibility) */}
        {scanResult && scanResults.length === 0 && (
          <div
            style={{
              background: colors.bgCard,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: `0 2px 8px ${colors.shadowSm}`,
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: colors.textPrimary,
                fontFamily: fonts.body,
                marginBottom: '20px',
              }}
            >
              Scan Results
            </h2>

            {/* Overall Risk */}
            {scanResult.data?.overall_risk_level && (
              <div
                style={{
                  background: colors.bgTertiary,
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      fontFamily: fonts.body,
                      background: getRiskLevelColor(scanResult.data.overall_risk_level),
                      color: colors.textInverse,
                    }}
                  >
                    {scanResult.data.overall_risk_level.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      color: colors.textSecondary,
                      fontFamily: fonts.body,
                    }}
                  >
                    Overall Risk Level
                  </span>
                </div>
                {scanResult.data.overall_reason && (
                  <p
                    style={{
                      fontSize: '13px',
                      color: colors.textSecondary,
                      fontFamily: fonts.body,
                      margin: 0,
                    }}
                  >
                    {scanResult.data.overall_reason}
                  </p>
                )}
              </div>
            )}

            {/* Findings Summary */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              {scanResult.data?.tool_findings?.length > 0 && (
                <div
                  style={{
                    background: colors.bgTertiary,
                    border: `1px solid ${colors.borderLight}`,
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: colors.textPrimary,
                      fontFamily: fonts.body,
                    }}
                  >
                    {scanResult.data.tool_findings.length}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: colors.textSecondary,
                      fontFamily: fonts.body,
                    }}
                  >
                    Tool Findings
                  </div>
                </div>
              )}
              {scanResult.data?.resource_findings?.length > 0 && (
                <div
                  style={{
                    background: colors.bgTertiary,
                    border: `1px solid ${colors.borderLight}`,
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: colors.textPrimary,
                      fontFamily: fonts.body,
                    }}
                  >
                    {scanResult.data.resource_findings.length}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: colors.textSecondary,
                      fontFamily: fonts.body,
                    }}
                  >
                    Resource Findings
                  </div>
                </div>
              )}
              {scanResult.data?.prompt_findings?.length > 0 && (
                <div
                  style={{
                    background: colors.bgTertiary,
                    border: `1px solid ${colors.borderLight}`,
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: colors.textPrimary,
                      fontFamily: fonts.body,
                    }}
                  >
                    {scanResult.data.prompt_findings.length}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: colors.textSecondary,
                      fontFamily: fonts.body,
                    }}
                  >
                    Prompt Findings
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {scanResult.data?.recommendations?.length > 0 && (
              <div
                style={{
                  background: colors.bgTertiary,
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                    marginBottom: '12px',
                  }}
                >
                  Recommendations
                </h3>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: '20px',
                    fontSize: '13px',
                    color: colors.textSecondary,
                    fontFamily: fonts.body,
                    lineHeight: '1.8',
                  }}
                >
                  {scanResult.data.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* View Full Results Link */}
            {scanResult.scan_id && (
              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: `1px solid ${colors.borderLight}`,
                }}
              >
                <a
                  href={`https://smart-scan.mcp-shark.org/scan-results?id=${scanResult.scan_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: colors.buttonSecondary,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.borderMedium}`,
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '600',
                    fontFamily: fonts.body,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.buttonSecondaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.buttonSecondary;
                  }}
                >
                  <span>View Full Results</span>
                  <ExternalLinkIcon size={14} color={colors.textPrimary} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SmartScan;
