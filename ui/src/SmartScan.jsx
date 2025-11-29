import { useState, useEffect, useRef } from 'react';
import { colors, fonts } from './theme';
import anime from 'animejs';

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

const CacheIcon = ({ size = 16, color = 'currentColor' }) => (
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
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const LoadingSpinner = ({ size = 16, color = colors.accentBlue }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `2px solid ${colors.borderLight}`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }}
  />
);

const EmptyStateIcon = () => (
  <svg
    width={64}
    height={64}
    viewBox="0 0 24 24"
    fill="none"
    stroke={colors.textTertiary}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity: 0.5 }}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
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
  const [selectedServers, setSelectedServers] = useState(new Set());
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

      // Auto-select all discovered servers
      if (data.servers.length > 0) {
        setSelectedServers(new Set(data.servers.map((s) => s.name)));

        // Load cached results for discovered servers
        try {
          const cachedResponse = await fetch('/api/smartscan/cached-results', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              servers: data.servers,
            }),
          });

          if (cachedResponse.ok) {
            const cachedData = await cachedResponse.json();
            if (cachedData.success && cachedData.results) {
              // Filter to only successful cached results
              const validCachedResults = cachedData.results.filter((r) => r.success && r.cached);
              if (validCachedResults.length > 0) {
                // Set cached results to display
                setScanResults(validCachedResults);
              }
            }
          }
        } catch (err) {
          // Silently fail - cached results are optional
          console.debug('Could not load cached results:', err);
        }
      }

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

    if (selectedServers.size === 0) {
      setError('Please select at least one server to scan');
      return;
    }

    setScanning(true);
    setError(null);
    setScanResult(null);
    setScanResults([]);

    // Filter to only selected servers
    const serversToScan = discoveredServers.filter((server) => selectedServers.has(server.name));

    try {
      // Send batch scan requests (one per server)
      const response = await fetch('/api/smartscan/scans/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiToken,
          servers: serversToScan,
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
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: colors.bgPrimary,
      }}
    >
      {/* Top Bar - Controls */}
      <div
        style={{
          background: colors.bgCard,
          borderBottom: `1px solid ${colors.borderLight}`,
          padding: '16px 24px',
          boxShadow: `0 2px 4px ${colors.shadowSm}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginRight: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${colors.accentBlue}20, ${colors.accentGreen}20)`,
                border: `2px solid ${colors.accentBlue}40`,
                flexShrink: 0,
              }}
            >
              <ShieldIcon size={20} color={colors.accentBlue} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: colors.textPrimary,
                  fontFamily: fonts.body,
                  margin: 0,
                  letterSpacing: '-0.2px',
                }}
              >
                <a
                  href="https://smart.mcpshark.sh/#get-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: colors.textPrimary,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.accentBlue;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.textPrimary;
                  }}
                >
                  Smart Scan
                  <ExternalLinkIcon size={12} color="currentColor" />
                </a>
              </h1>
              <p
                style={{
                  fontSize: '11px',
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                  margin: 0,
                  lineHeight: '1.3',
                }}
              >
                AI-powered security analysis for Model Context Protocol (MCP) servers
              </p>
            </div>
          </div>

          {/* Controls Container */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
            {/* API Token Section */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                  whiteSpace: 'nowrap',
                }}
              >
                API Token:
              </label>
              <div style={{ position: 'relative', width: '200px' }}>
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
                  placeholder="sk_..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    paddingRight: apiToken ? '28px' : '10px',
                    border: `1px solid ${apiToken ? colors.accentGreen : colors.borderMedium}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: fonts.body,
                    background: colors.bgSecondary,
                    color: colors.textPrimary,
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.accentBlue;
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accentBlue}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = apiToken
                      ? colors.accentGreen
                      : colors.borderMedium;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {apiToken && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <CheckIcon size={12} color={colors.accentGreen} />
                  </div>
                )}
              </div>
              <a
                href="https://smart.mcpshark.sh/tokens"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: colors.accentBlue,
                  textDecoration: 'none',
                  fontFamily: fonts.body,
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                <span>Get token</span>
                <ExternalLinkIcon size={10} color={colors.accentBlue} />
              </a>
            </div>

            {/* Discover MCP Data Section */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                  whiteSpace: 'nowrap',
                }}
              >
                Servers:
              </label>
              <button
                onClick={discoverMcpData}
                disabled={loadingData}
                style={{
                  padding: '8px 14px',
                  background: !loadingData ? colors.buttonPrimary : colors.buttonSecondary,
                  color: !loadingData ? colors.textInverse : colors.textTertiary,
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  fontFamily: fonts.body,
                  cursor: !loadingData ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!loadingData) {
                    e.currentTarget.style.background = colors.buttonPrimaryHover;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loadingData) {
                    e.currentTarget.style.background = colors.buttonPrimary;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {loadingData ? (
                  <>
                    <LoadingSpinner size={12} />
                    <span>Discovering...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon size={12} color={colors.textInverse} />
                    <span>Discover</span>
                  </>
                )}
              </button>
              {discoveredServers.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    background: colors.bgTertiary,
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                  }}
                >
                  <CheckIcon size={12} color={colors.accentGreen} />
                  <span>
                    {discoveredServers.length} server{discoveredServers.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Discovered Servers Selection Row */}
      {discoveredServers.length > 0 && (
        <div
          style={{
            background: colors.bgSecondary,
            borderBottom: `1px solid ${colors.borderLight}`,
            padding: '12px 24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: colors.textSecondary,
                fontFamily: fonts.body,
                whiteSpace: 'nowrap',
              }}
            >
              Select servers to scan:
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                flex: 1,
              }}
            >
              {discoveredServers.map((server, idx) => {
                const isSelected = selectedServers.has(server.name);
                return (
                  <label
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: isSelected ? colors.bgCard : colors.bgTertiary,
                      border: `1px solid ${isSelected ? colors.accentBlue : colors.borderLight}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '12px',
                      fontFamily: fonts.body,
                      fontWeight: isSelected ? '600' : '500',
                      color: isSelected ? colors.textPrimary : colors.textSecondary,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.accentBlue;
                      e.currentTarget.style.boxShadow = `0 2px 4px ${colors.shadowSm}`;
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = colors.borderLight;
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const newSelected = new Set(selectedServers);
                        if (e.target.checked) {
                          newSelected.add(server.name);
                        } else {
                          newSelected.delete(server.name);
                        }
                        setSelectedServers(newSelected);
                      }}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: colors.accentBlue,
                      }}
                    />
                    <span>{server.name}</span>
                    <span
                      style={{
                        fontSize: '10px',
                        color: colors.textTertiary,
                        fontWeight: '400',
                      }}
                    >
                      ({server.tools?.length || 0} tools, {server.resources?.length || 0} resources,{' '}
                      {server.prompts?.length || 0} prompts)
                    </span>
                  </label>
                );
              })}
            </div>
            <button
              onClick={() => {
                if (selectedServers.size === discoveredServers.length) {
                  setSelectedServers(new Set());
                } else {
                  setSelectedServers(new Set(discoveredServers.map((s) => s.name)));
                }
              }}
              style={{
                padding: '6px 12px',
                background: colors.buttonSecondary,
                color: colors.textPrimary,
                border: `1px solid ${colors.borderMedium}`,
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                fontFamily: fonts.body,
                cursor: 'pointer',
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
              {selectedServers.size === discoveredServers.length ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={runScan}
              disabled={!apiToken || selectedServers.size === 0 || scanning}
              style={{
                padding: '8px 16px',
                background:
                  apiToken && selectedServers.size > 0 && !scanning
                    ? colors.buttonPrimary
                    : colors.buttonSecondary,
                color:
                  apiToken && selectedServers.size > 0 && !scanning
                    ? colors.textInverse
                    : colors.textTertiary,
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: fonts.body,
                cursor:
                  apiToken && selectedServers.size > 0 && !scanning ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (apiToken && selectedServers.size > 0 && !scanning) {
                  e.currentTarget.style.background = colors.buttonPrimaryHover;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${colors.shadowMd}`;
                }
              }}
              onMouseLeave={(e) => {
                if (apiToken && selectedServers.size > 0 && !scanning) {
                  e.currentTarget.style.background = colors.buttonPrimary;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {scanning ? (
                <>
                  <LoadingSpinner size={14} color={colors.textInverse} />
                  <span>
                    Scanning {selectedServers.size} server{selectedServers.size !== 1 ? 's' : ''}...
                  </span>
                </>
              ) : (
                <>
                  <ShieldIcon
                    size={14}
                    color={
                      apiToken && selectedServers.size > 0
                        ? colors.textInverse
                        : colors.textTertiary
                    }
                  />
                  <span>Run Scan ({selectedServers.size})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Right Content Area - Results */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '32px',
          background: colors.bgPrimary,
        }}
      >
        {/* Empty State */}
        {!error && scanResults.length === 0 && !scanResult && !scanning && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              textAlign: 'center',
              padding: '40px',
            }}
          >
            <div style={{ marginBottom: '24px', opacity: 0.6 }}>
              <EmptyStateIcon />
            </div>
            <h3
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: colors.textPrimary,
                fontFamily: fonts.body,
                marginBottom: '8px',
              }}
            >
              Ready to Scan
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: colors.textSecondary,
                fontFamily: fonts.body,
                maxWidth: '400px',
                lineHeight: '1.6',
              }}
            >
              Configure your API token and discover MCP servers to start security scanning. Results
              will appear here.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div
            style={{
              background: colors.bgCard,
              border: `1px solid ${colors.error}`,
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <AlertIcon size={20} color={colors.error} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: '14px',
                  color: colors.error,
                  fontFamily: fonts.body,
                  margin: 0,
                  fontWeight: '600',
                  marginBottom: '4px',
                }}
              >
                Error
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                  margin: 0,
                  lineHeight: '1.5',
                }}
              >
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Scanning Progress Indicator */}
        {scanning && (
          <div
            style={{
              background: colors.bgCard,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: `0 2px 8px ${colors.shadowSm}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LoadingSpinner size={20} />
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                    margin: 0,
                    marginBottom: '4px',
                  }}
                >
                  Scanning {selectedServers.size} server{selectedServers.size !== 1 ? 's' : ''}...
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: colors.textSecondary,
                    fontFamily: fonts.body,
                    margin: 0,
                  }}
                >
                  Analyzing security vulnerabilities and risks
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display - Multiple Servers */}
        {scanResults.length > 0 && (
          <div
            style={{
              background: colors.bgCard,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: `0 2px 8px ${colors.shadowSm}`,
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
              <div>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                    margin: 0,
                    marginBottom: '4px',
                  }}
                >
                  Scan Results ({scanResults.length} server{scanResults.length !== 1 ? 's' : ''})
                </h2>
                {scanResults.every((r) => r.cached) && (
                  <p
                    style={{
                      fontSize: '12px',
                      color: colors.textTertiary,
                      fontFamily: fonts.body,
                      margin: 0,
                    }}
                  >
                    Showing cached results. Run a new scan to get the latest analysis.
                  </p>
                )}
              </div>
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
                    <span
                      style={{
                        padding: '6px 10px',
                        background: colors.bgTertiary,
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontFamily: fonts.body,
                      }}
                    >
                      <CacheIcon size={12} color={colors.textSecondary} />
                      <span>{scanResults.filter((r) => r.cached).length} cached</span>
                    </span>
                  )}
                  {scanResults.filter((r) => r.success && !r.cached).length > 0 && (
                    <span
                      style={{
                        padding: '6px 10px',
                        background: colors.bgTertiary,
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckIcon size={12} color={colors.accentGreen} />
                      <span>
                        {scanResults.filter((r) => r.success && !r.cached).length} scanned
                      </span>
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
                              background: colors.bgSecondary,
                              color: colors.textSecondary,
                              border: `1px solid ${colors.borderLight}`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="This result was retrieved from cache"
                          >
                            <CacheIcon size={12} color={colors.textSecondary} />
                            <span>Cached</span>
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
                  href={`https://smart.mcpshark.sh/scan-results?id=${scanResult.scan_id}`}
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
