import { useState, useEffect } from 'react';

function CompositeSetup() {
  const [fileContent, setFileContent] = useState('');
  const [filePath, setFilePath] = useState('');
  const [updatePath, setUpdatePath] = useState('');
  const [status, setStatus] = useState({ running: false, pid: null });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [detectedPaths, setDetectedPaths] = useState([]);
  const [detecting, setDetecting] = useState(true);
  const [viewingConfig, setViewingConfig] = useState(null);
  const [configContent, setConfigContent] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);

  useEffect(() => {
    // Check composite status on mount
    fetchStatus();
    // Poll status every 2 seconds
    const interval = setInterval(fetchStatus, 2000);

    // Detect default config paths
    detectConfigPaths();

    // Load backups
    loadBackups();

    return () => clearInterval(interval);
  }, []);

  const detectConfigPaths = async () => {
    setDetecting(true);
    try {
      const res = await fetch('/api/config/detect');
      const data = await res.json();
      setDetectedPaths(data.detected || []);
    } catch (err) {
      console.error('Failed to detect config paths:', err);
    } finally {
      setDetecting(false);
    }
  };

  const loadBackups = async () => {
    setLoadingBackups(true);
    try {
      const res = await fetch('/api/config/backups');
      const data = await res.json();
      setBackups(data.backups || []);
    } catch (err) {
      console.error('Failed to load backups:', err);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleRestore = async (backupPath) => {
    if (
      !confirm(
        'Are you sure you want to restore this backup? This will overwrite the current config file.'
      )
    ) {
      return;
    }

    try {
      const res = await fetch('/api/config/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupPath }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Config restored successfully');
        setError(null);
        // Reload backups
        loadBackups();
        // Reload detected paths
        detectConfigPaths();
        // Small delay to allow log to appear
        setTimeout(() => {
          // Logs will update automatically via WebSocket
        }, 500);
      } else {
        setError(data.error || 'Failed to restore backup');
        setMessage(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to restore backup');
      setMessage(null);
    }
  };

  const handleViewConfig = async (filePath) => {
    setLoadingConfig(true);
    setViewingConfig(filePath);
    try {
      const res = await fetch(`/api/config/read?filePath=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (res.ok) {
        setConfigContent(data);
      } else {
        setError(data.error || 'Failed to read config file');
        setConfigContent(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to read config file');
      setConfigContent(null);
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/composite/status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target.result);
        // Don't set filePath from file picker (browser security - can't get full path)
      };
      reader.readAsText(file);
    }
  };

  const handlePathInput = (e) => {
    setFilePath(e.target.value);
    if (e.target.value) {
      setFileContent(''); // Clear file content when path is entered
    }
  };

  const handleUpdatePathInput = (e) => {
    setUpdatePath(e.target.value);
  };

  const handleSetup = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload = fileContent ? { fileContent, filePath: updatePath || null } : { filePath };

      const res = await fetch('/api/composite/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        let msg = data.message || 'MCP Shark server started successfully';
        if (data.backupPath) {
          msg += ` (Backup saved to ${data.backupPath})`;
        }
        setMessage(msg);
        setFileContent('');
        setFilePath('');
        setUpdatePath('');
        setTimeout(fetchStatus, 1000);
      } else {
        setError(data.error || 'Failed to setup MCP Shark server');
      }
    } catch (err) {
      setError(err.message || 'Failed to setup MCP Shark server');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/composite/stop', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        let msg = data.message || 'MCP Shark server stopped';
        if (data.message && data.message.includes('restored')) {
          msg = 'MCP Shark server stopped and original config file restored';
        }
        setMessage(msg);
        setTimeout(fetchStatus, 1000);
      } else {
        setError(data.error || 'Failed to stop MCP Shark server');
      }
    } catch (err) {
      setError(err.message || 'Failed to stop MCP Shark server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#1e1e1e',
        overflow: 'auto',
      }}
    >
      {/* Main Setup Panel */}
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px',
          minHeight: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <h2
            style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px', color: '#d4d4d4' }}
          >
            MCP Shark Server Setup
          </h2>
          <p style={{ fontSize: '13px', color: '#858585', lineHeight: '1.5' }}>
            Convert your MCP configuration file and start the MCP Shark server to aggregate multiple
            MCP servers into a single endpoint.
          </p>
        </div>

        <div
          style={{
            background: '#252526',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3
              style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#d4d4d4' }}
            >
              Configuration File
            </h3>
            <p style={{ fontSize: '12px', color: '#858585', lineHeight: '1.4' }}>
              Select your MCP configuration file or provide a file path. The file will be converted
              to MCP Shark format and used to start the server.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {detectedPaths.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#858585', fontWeight: '500' }}>
                    Detected Configuration Files:
                  </div>
                  <button
                    onClick={detectConfigPaths}
                    disabled={detecting}
                    style={{
                      padding: '4px 8px',
                      background: 'transparent',
                      border: '1px solid #444',
                      color: '#858585',
                      cursor: detecting ? 'not-allowed' : 'pointer',
                      fontSize: '11px',
                      borderRadius: '4px',
                      opacity: detecting ? 0.5 : 1,
                    }}
                    title="Refresh detection"
                  >
                    {detecting ? 'Detecting...' : '🔄 Refresh'}
                  </button>
                </div>
                <div
                  data-tour="detected-editors"
                  style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
                >
                  {detectedPaths.map((item, idx) => (
                    <button
                      key={idx}
                      data-tour={idx === 0 ? 'first-detected-editor' : undefined}
                      onClick={() => {
                        setFilePath(item.path);
                        setFileContent(''); // Clear any file picker content
                        setUpdatePath(item.path); // Set update path to same as file path
                      }}
                      onDoubleClick={() => {
                        // Double-click to view the file
                        if (item.exists) {
                          handleViewConfig(item.path);
                        }
                      }}
                      style={{
                        padding: '8px 12px',
                        background: item.exists ? '#1e3a5f' : '#2d2d2d',
                        border: `1px solid ${item.exists ? '#0e639c' : '#444'}`,
                        color: '#d4d4d4',
                        cursor: 'pointer',
                        fontSize: '12px',
                        borderRadius: '4px',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = item.exists ? '#264f78' : '#3d3d3d';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = item.exists ? '#1e3a5f' : '#2d2d2d';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          {item.editor === 'Cursor' ? (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 2L2 7l10 5 10-5-10-5z" />
                              <path d="M2 17l10 5 10-5" />
                              <path d="M2 12l10 5 10-5" />
                            </svg>
                          ) : (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </svg>
                          )}
                        </span>
                        <div>
                          <div style={{ fontWeight: '500' }}>{item.editor}</div>
                          <div style={{ fontSize: '11px', color: '#858585' }}>
                            {item.displayPath}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {item.exists && (
                          <>
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                background: '#89d185',
                                color: '#1e1e1e',
                                borderRadius: '3px',
                                fontWeight: '500',
                              }}
                            >
                              Found
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewConfig(item.path);
                              }}
                              style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                background: 'transparent',
                                border: '1px solid #444',
                                color: '#858585',
                                borderRadius: '3px',
                                cursor: 'pointer',
                              }}
                              title="View file content"
                            >
                              👁️ View
                            </button>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label
                data-tour="select-file"
                style={{
                  padding: '8px 16px',
                  background: '#0e639c',
                  border: '1px solid #0e639c',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  borderRadius: '4px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1177bb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0e639c';
                }}
              >
                Select File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </label>
              <span style={{ color: '#666', fontSize: '12px', fontWeight: '500' }}>OR</span>
              <input
                type="text"
                placeholder="Enter file path (e.g., ~/.cursor/mcp.json)"
                value={filePath}
                onChange={handlePathInput}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: '#1e1e1e',
                  border: '1px solid #444',
                  color: '#d4d4d4',
                  fontSize: '13px',
                  borderRadius: '4px',
                }}
              />
            </div>
            {fileContent && !filePath && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#858585',
                    marginBottom: '6px',
                  }}
                >
                  Optional: File Path to Update
                </label>
                <input
                  type="text"
                  placeholder="Enter file path to update (e.g., ~/.cursor/mcp.json)"
                  value={updatePath}
                  onChange={handleUpdatePathInput}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#1e1e1e',
                    border: '1px solid #444',
                    color: '#d4d4d4',
                    fontSize: '13px',
                    borderRadius: '4px',
                  }}
                />
                <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
                  Provide the file path if you want to update the original config file (backup will
                  be created)
                </div>
              </div>
            )}

            {fileContent && (
              <div style={{ marginTop: '8px' }}>
                <div
                  style={{
                    color: '#858585',
                    fontSize: '12px',
                    marginBottom: '6px',
                    fontWeight: '500',
                  }}
                >
                  File Content Preview
                </div>
                <pre
                  style={{
                    background: '#1e1e1e',
                    padding: '12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#d4d4d4',
                    maxHeight: '200px',
                    overflow: 'auto',
                    border: '1px solid #333',
                    lineHeight: '1.5',
                  }}
                >
                  {fileContent}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            background: '#252526',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3
              style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#d4d4d4' }}
            >
              Server Control
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              data-tour="start-button"
              onClick={handleSetup}
              disabled={loading || (!fileContent && !filePath)}
              style={{
                padding: '10px 20px',
                background: status.running ? '#2d2d2d' : '#0e639c',
                border: '1px solid',
                borderColor: status.running ? '#444' : '#0e639c',
                color: '#ffffff',
                cursor: loading || (!fileContent && !filePath) ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                borderRadius: '4px',
                opacity: loading || (!fileContent && !filePath) ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!loading && (fileContent || filePath) && !status.running) {
                  e.currentTarget.style.background = '#1177bb';
                }
              }}
              onMouseLeave={(e) => {
                if (!status.running) {
                  e.currentTarget.style.background = '#0e639c';
                }
              }}
            >
              {loading ? 'Processing...' : status.running ? 'Restart MCP Shark' : 'Start MCP Shark'}
            </button>

            {status.running && (
              <button
                onClick={handleStop}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  background: '#c72e2e',
                  border: '1px solid #c72e2e',
                  color: '#ffffff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  borderRadius: '4px',
                  opacity: loading ? 0.5 : 1,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = '#e63946';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#c72e2e';
                }}
              >
                Stop MCP Shark
              </button>
            )}

            <div
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 16px',
                background: '#1e1e1e',
                border: '1px solid #333',
                borderRadius: '4px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: status.running ? '#89d185' : '#888',
                  boxShadow: status.running ? '0 0 8px rgba(137, 209, 133, 0.5)' : 'none',
                  transition: 'all 0.3s',
                }}
              />
              <span style={{ color: '#d4d4d4', fontSize: '13px', fontWeight: '500' }}>
                {status.running ? `Running (PID: ${status.pid})` : 'Stopped'}
              </span>
            </div>
          </div>
        </div>

        {(message || error) && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 16px',
              background: message ? '#264f78' : '#5a1d1d',
              border: `1px solid ${message ? '#0e639c' : '#c72e2e'}`,
              borderRadius: '4px',
              color: message ? '#d4d4d4' : '#f48771',
              fontSize: '13px',
              lineHeight: '1.5',
            }}
          >
            {message || error}
          </div>
        )}

        {/* Backup Files Section */}
        {backups.length > 0 && (
          <div
            style={{
              background: '#252526',
              border: '1px solid #333',
              borderRadius: '6px',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#d4d4d4' }}>
                Backup Files
              </h3>
              <button
                onClick={loadBackups}
                disabled={loadingBackups}
                style={{
                  padding: '4px 8px',
                  background: 'transparent',
                  border: '1px solid #444',
                  color: '#858585',
                  cursor: loadingBackups ? 'not-allowed' : 'pointer',
                  fontSize: '11px',
                  borderRadius: '4px',
                  opacity: loadingBackups ? 0.5 : 1,
                }}
                title="Refresh backups"
              >
                {loadingBackups ? 'Loading...' : '🔄 Refresh'}
              </button>
            </div>
            <p
              style={{
                fontSize: '12px',
                color: '#858585',
                marginBottom: '12px',
                lineHeight: '1.4',
              }}
            >
              Restore your original MCP configuration files from backups created when starting MCP
              Shark.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {backups.map((backup, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    background: '#1e1e1e',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color: '#d4d4d4',
                        fontSize: '12px',
                        fontWeight: '500',
                        marginBottom: '4px',
                      }}
                    >
                      {backup.displayPath}
                    </div>
                    <div style={{ color: '#858585', fontSize: '11px' }}>
                      Created: {new Date(backup.createdAt).toLocaleString()} • Size:{' '}
                      {(backup.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestore(backup.backupPath)}
                    style={{
                      padding: '6px 12px',
                      background: '#0e639c',
                      border: '1px solid #0e639c',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      borderRadius: '4px',
                      fontWeight: '500',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#1177bb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#0e639c';
                    }}
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            background: '#252526',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '20px',
          }}
        >
          <h3
            style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: '#d4d4d4' }}
          >
            What This Does
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '13px',
              color: '#858585',
              lineHeight: '1.8',
            }}
          >
            <li>
              Converts your MCP config (<code style={{ color: '#dcdcaa' }}>mcpServers</code>) to MCP
              Shark format (<code style={{ color: '#dcdcaa' }}>servers</code>)
            </li>
            <li>
              Starts the MCP Shark server on{' '}
              <code style={{ color: '#4ec9b0' }}>http://localhost:9851/mcp</code>
            </li>
            <li>
              {filePath || updatePath
                ? 'Updates your original config file to point to the MCP Shark server (creates a backup first)'
                : 'Note: Provide a file path to update your original config file automatically'}
            </li>
            {(filePath || updatePath) && (
              <li style={{ color: '#89d185', marginTop: '4px' }}>
                ✓ Original config will be automatically restored when you stop the server or close
                the UI
              </li>
            )}
          </ul>
        </div>

        {/* Config File Viewer Modal */}
        {viewingConfig && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
            onClick={() => {
              setViewingConfig(null);
              setConfigContent(null);
            }}
          >
            <div
              style={{
                background: '#1e1e1e',
                border: '1px solid #333',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '800px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #333',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      marginBottom: '4px',
                      color: '#d4d4d4',
                    }}
                  >
                    MCP Configuration File
                  </h3>
                  {configContent && (
                    <div style={{ fontSize: '12px', color: '#858585' }}>
                      {configContent.displayPath}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setViewingConfig(null);
                    setConfigContent(null);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#d4d4d4',
                    cursor: 'pointer',
                    fontSize: '24px',
                    padding: '0',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>
              <div
                style={{
                  flex: 1,
                  overflow: 'auto',
                  padding: '20px',
                }}
              >
                {loadingConfig ? (
                  <div style={{ color: '#858585', textAlign: 'center', padding: '40px' }}>
                    Loading...
                  </div>
                ) : configContent ? (
                  <pre
                    style={{
                      background: '#1e1e1e',
                      padding: '16px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      color: '#d4d4d4',
                      overflow: 'auto',
                      border: '1px solid #333',
                      lineHeight: '1.6',
                      margin: 0,
                    }}
                  >
                    {configContent.content}
                  </pre>
                ) : (
                  <div style={{ color: '#f48771', textAlign: 'center', padding: '40px' }}>
                    Failed to load file content
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompositeSetup;
