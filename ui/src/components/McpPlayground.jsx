import { useState, useEffect, useRef } from 'react';
import { colors, fonts } from '../theme';
import anime from 'animejs';

function McpPlayground() {
  const [activeSection, setActiveSection] = useState('tools');
  const [tools, setTools] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolArgs, setToolArgs] = useState('{}');
  const [toolResult, setToolResult] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [promptArgs, setPromptArgs] = useState('{}');
  const [promptResult, setPromptResult] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceResult, setResourceResult] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [toolsLoaded, setToolsLoaded] = useState(false);
  const [promptsLoaded, setPromptsLoaded] = useState(false);
  const [resourcesLoaded, setResourcesLoaded] = useState(false);
  const loadingModalRef = useRef(null);
  const spinnerRef = useRef(null);
  const dotsRef = useRef([]);

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // Animate loading modal
  useEffect(() => {
    if (showLoadingModal && loadingModalRef.current) {
      // Fade in modal
      anime({
        targets: loadingModalRef.current,
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 400,
        easing: 'easeOutExpo',
      });

      // Animate spinner
      if (spinnerRef.current) {
        anime({
          targets: spinnerRef.current,
          rotate: 360,
          duration: 2000,
          loop: true,
          easing: 'linear',
        });
      }

      // Animate dots
      if (dotsRef.current.length > 0) {
        anime({
          targets: dotsRef.current,
          translateY: [0, -10, 0],
          duration: 1200,
          delay: anime.stagger(200),
          loop: true,
          easing: 'easeInOutQuad',
        });
      }
    } else if (!showLoadingModal && loadingModalRef.current) {
      // Fade out modal
      anime({
        targets: loadingModalRef.current,
        opacity: [1, 0],
        scale: [1, 0.9],
        duration: 300,
        easing: 'easeInExpo',
        complete: () => {
          if (loadingModalRef.current) {
            loadingModalRef.current.style.display = 'none';
          }
        },
      });
    }
  }, [showLoadingModal]);

  // Wait a bit after server becomes ready before auto-loading
  useEffect(() => {
    if (serverStatus?.running && activeSection === 'tools' && tools.length === 0) {
      // Wait 2 seconds after server is ready before auto-loading
      const timer = setTimeout(() => {
        loadTools();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [serverStatus?.running]);

  const checkServerStatus = async () => {
    try {
      const res = await fetch('/api/composite/status');
      const data = await res.json();
      const wasRunning = serverStatus?.running;
      setServerStatus(data);

      // Show loading modal if server is not running (user might be starting it)
      // Hide it when server becomes ready
      if (!data.running) {
        // Only show if we haven't shown it yet or if it was running before (restarting)
        if (!showLoadingModal || wasRunning) {
          setShowLoadingModal(true);
        }
      } else if (data.running && showLoadingModal) {
        // Hide loading modal when server is ready
        setShowLoadingModal(false);
      }
    } catch (err) {
      setServerStatus({ running: false });
      // Don't show modal on fetch errors, just update status
    }
  };

  const makeMcpRequest = async (method, params = {}) => {
    setError(null);
    setLoading(true);

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

      // Extract session ID from response (check both headers and body)
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

      // The new API returns result directly, not wrapped in a result field
      return data.result || data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadTools = async () => {
    setToolsLoading(true);
    setError(null);
    try {
      const result = await makeMcpRequest('tools/list');
      setTools(result?.tools || []);
      setToolsLoaded(true);
    } catch (err) {
      const errorMsg = err.message || 'Failed to load tools';
      setError(`tools: ${errorMsg}`);
      setToolsLoaded(true);
      console.error('Failed to load tools:', err);
    } finally {
      setToolsLoading(false);
    }
  };

  const loadPrompts = async () => {
    setPromptsLoading(true);
    setError(null);
    try {
      const result = await makeMcpRequest('prompts/list');
      setPrompts(result?.prompts || []);
      setPromptsLoaded(true);
    } catch (err) {
      const errorMsg = err.message || 'Failed to load prompts';
      setError(`prompts: ${errorMsg}`);
      setPromptsLoaded(true);
      console.error('Failed to load prompts:', err);
    } finally {
      setPromptsLoading(false);
    }
  };

  const loadResources = async () => {
    setResourcesLoading(true);
    setError(null);
    try {
      const result = await makeMcpRequest('resources/list');
      setResources(result?.resources || []);
      setResourcesLoaded(true);
    } catch (err) {
      const errorMsg = err.message || 'Failed to load resources';
      setError(`resources: ${errorMsg}`);
      setResourcesLoaded(true);
      console.error('Failed to load resources:', err);
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleCallTool = async () => {
    if (!selectedTool) return;

    try {
      let args = {};
      try {
        args = JSON.parse(toolArgs);
      } catch (e) {
        setError('Invalid JSON in arguments');
        return;
      }

      const result = await makeMcpRequest('tools/call', {
        name: selectedTool.name,
        arguments: args,
      });

      setToolResult(result);
    } catch (err) {
      setToolResult({ error: err.message });
    }
  };

  const handleGetPrompt = async () => {
    if (!selectedPrompt) return;

    try {
      let args = {};
      try {
        args = JSON.parse(promptArgs);
      } catch (e) {
        setError('Invalid JSON in arguments');
        return;
      }

      const result = await makeMcpRequest('prompts/get', {
        name: selectedPrompt.name,
        arguments: args,
      });

      setPromptResult(result);
    } catch (err) {
      setPromptResult({ error: err.message });
    }
  };

  const handleReadResource = async () => {
    if (!selectedResource) return;

    try {
      const result = await makeMcpRequest('resources/read', {
        uri: selectedResource.uri,
      });

      setResourceResult(result);
    } catch (err) {
      setResourceResult({ error: err.message });
    }
  };

  useEffect(() => {
    // Auto-load when switching to a section if server is running and not already loaded
    if (!serverStatus?.running) return;

    // Small delay to ensure tab switch animation completes
    const timer = setTimeout(() => {
      if (activeSection === 'tools' && !toolsLoaded && !toolsLoading) {
        loadTools();
      } else if (activeSection === 'prompts' && !promptsLoaded && !promptsLoading) {
        loadPrompts();
      } else if (activeSection === 'resources' && !resourcesLoaded && !resourcesLoading) {
        loadResources();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [
    activeSection,
    serverStatus?.running,
    toolsLoaded,
    promptsLoaded,
    resourcesLoaded,
    toolsLoading,
    promptsLoading,
    resourcesLoading,
  ]);

  const renderTools = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={loadTools}
          disabled={loading || toolsLoading}
          style={{
            padding: '8px 16px',
            background: colors.buttonPrimary,
            color: colors.textInverse,
            border: 'none',
            borderRadius: '6px',
            cursor: loading || toolsLoading ? 'not-allowed' : 'pointer',
            fontFamily: fonts.body,
            fontSize: '13px',
            fontWeight: '500',
            opacity: loading || toolsLoading ? 0.6 : 1,
          }}
        >
          {toolsLoading ? 'Loading...' : 'Refresh Tools'}
        </button>
        <span style={{ color: colors.textSecondary, fontSize: '13px' }}>
          {toolsLoading
            ? 'Loading tools...'
            : `${tools.length} tool${tools.length !== 1 ? 's' : ''} available`}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
        <div
          style={{
            flex: 1,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '12px',
              background: colors.bgSecondary,
              borderBottom: `1px solid ${colors.borderLight}`,
              fontWeight: '500',
              fontSize: '14px',
              color: colors.textPrimary,
            }}
          >
            Available Tools
          </div>
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              background: colors.bgCard,
              position: 'relative',
            }}
          >
            {!serverStatus?.running ? (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: '13px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    margin: '0 auto 16px',
                    border: `3px solid ${colors.borderLight}`,
                    borderTop: `3px solid ${colors.accentBlue}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Waiting for MCP server to start...
              </div>
            ) : toolsLoading || !toolsLoaded ? (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: '13px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    margin: '0 auto 16px',
                    border: `3px solid ${colors.borderLight}`,
                    borderTop: `3px solid ${colors.accentBlue}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Loading tools...
              </div>
            ) : error && error.includes('tools:') ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: colors.error,
                  fontSize: '13px',
                }}
              >
                Error loading tools: {error.replace('tools: ', '')}
              </div>
            ) : tools.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: '13px',
                }}
              >
                No tools available.
              </div>
            ) : (
              tools.map((tool, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedTool(tool);
                    // Initialize with empty object or example based on inputSchema
                    const exampleArgs = tool.inputSchema?.properties
                      ? Object.keys(tool.inputSchema.properties).reduce((acc, key) => {
                          const prop = tool.inputSchema.properties[key];
                          acc[key] = prop.default !== undefined ? prop.default : '';
                          return acc;
                        }, {})
                      : {};
                    setToolArgs(JSON.stringify(exampleArgs, null, 2));
                    setToolResult(null);
                  }}
                  style={{
                    padding: '12px',
                    borderBottom: `1px solid ${colors.borderLight}`,
                    cursor: 'pointer',
                    background:
                      selectedTool?.name === tool.name ? colors.bgSecondary : colors.bgCard,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTool?.name !== tool.name) {
                      e.currentTarget.style.background = colors.bgHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTool?.name !== tool.name) {
                      e.currentTarget.style.background = colors.bgCard;
                    }
                  }}
                >
                  <div
                    style={{
                      fontWeight: '500',
                      fontSize: '13px',
                      color: colors.textPrimary,
                      marginBottom: '4px',
                    }}
                  >
                    {tool.name}
                  </div>
                  {tool.description && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: colors.textSecondary,
                        marginTop: '4px',
                      }}
                    >
                      {tool.description}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {selectedTool && (
          <div
            style={{
              flex: 1,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '12px',
                background: colors.bgSecondary,
                borderBottom: `1px solid ${colors.borderLight}`,
                fontWeight: '500',
                fontSize: '14px',
                color: colors.textPrimary,
              }}
            >
              Call Tool: {selectedTool.name}
            </div>
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: colors.textSecondary,
                    marginBottom: '6px',
                  }}
                >
                  Arguments (JSON)
                </label>
                <textarea
                  value={toolArgs}
                  onChange={(e) => setToolArgs(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '150px',
                    padding: '10px',
                    border: `1px solid ${colors.borderLight}`,
                    borderRadius: '6px',
                    fontFamily: fonts.mono,
                    fontSize: '12px',
                    background: colors.bgCard,
                    color: colors.textPrimary,
                    resize: 'vertical',
                  }}
                />
              </div>
              <button
                onClick={handleCallTool}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  background: colors.buttonPrimary,
                  color: colors.textInverse,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: fonts.body,
                  fontSize: '13px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Calling...' : 'Call Tool'}
              </button>
              {toolResult && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: colors.textSecondary,
                      marginBottom: '6px',
                    }}
                  >
                    Result
                  </label>
                  <pre
                    style={{
                      padding: '12px',
                      background: colors.bgSecondary,
                      border: `1px solid ${colors.borderLight}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: fonts.mono,
                      color: toolResult.error ? colors.error : colors.textPrimary,
                      overflow: 'auto',
                      maxHeight: '300px',
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(toolResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderPrompts = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={loadPrompts}
          disabled={loading || promptsLoading}
          style={{
            padding: '8px 16px',
            background: colors.buttonPrimary,
            color: colors.textInverse,
            border: 'none',
            borderRadius: '6px',
            cursor: loading || promptsLoading ? 'not-allowed' : 'pointer',
            fontFamily: fonts.body,
            fontSize: '13px',
            fontWeight: '500',
            opacity: loading || promptsLoading ? 0.6 : 1,
          }}
        >
          {promptsLoading ? 'Loading...' : 'Refresh Prompts'}
        </button>
        <span style={{ color: colors.textSecondary, fontSize: '13px' }}>
          {promptsLoading
            ? 'Loading prompts...'
            : `${prompts.length} prompt${prompts.length !== 1 ? 's' : ''} available`}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
        <div
          style={{
            flex: 1,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '12px',
              background: colors.bgSecondary,
              borderBottom: `1px solid ${colors.borderLight}`,
              fontWeight: '500',
              fontSize: '14px',
              color: colors.textPrimary,
            }}
          >
            Available Prompts
          </div>
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              background: colors.bgCard,
              position: 'relative',
            }}
          >
            {!serverStatus?.running ? (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: '13px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    margin: '0 auto 16px',
                    border: `3px solid ${colors.borderLight}`,
                    borderTop: `3px solid ${colors.accentBlue}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Waiting for MCP server to start...
              </div>
            ) : promptsLoading || !promptsLoaded ? (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: '13px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    margin: '0 auto 16px',
                    border: `3px solid ${colors.borderLight}`,
                    borderTop: `3px solid ${colors.accentBlue}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Loading prompts...
              </div>
            ) : error && error.includes('prompts:') ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: colors.error,
                  fontSize: '13px',
                }}
              >
                Error loading prompts: {error.replace('prompts: ', '')}
              </div>
            ) : prompts.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: '13px',
                }}
              >
                No prompts available.
              </div>
            ) : (
              prompts.map((prompt, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedPrompt(prompt);
                    // Initialize with empty object - prompt arguments are passed as key-value pairs
                    const exampleArgs = prompt.arguments
                      ? prompt.arguments.reduce((acc, arg) => {
                          acc[arg.name] = arg.default !== undefined ? arg.default : '';
                          return acc;
                        }, {})
                      : {};
                    setPromptArgs(JSON.stringify(exampleArgs, null, 2));
                    setPromptResult(null);
                  }}
                  style={{
                    padding: '12px',
                    borderBottom: `1px solid ${colors.borderLight}`,
                    cursor: 'pointer',
                    background:
                      selectedPrompt?.name === prompt.name ? colors.bgSecondary : colors.bgCard,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPrompt?.name !== prompt.name) {
                      e.currentTarget.style.background = colors.bgHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPrompt?.name !== prompt.name) {
                      e.currentTarget.style.background = colors.bgCard;
                    }
                  }}
                >
                  <div
                    style={{
                      fontWeight: '500',
                      fontSize: '13px',
                      color: colors.textPrimary,
                      marginBottom: '4px',
                    }}
                  >
                    {prompt.name}
                  </div>
                  {prompt.description && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: colors.textSecondary,
                        marginTop: '4px',
                      }}
                    >
                      {prompt.description}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {selectedPrompt && (
          <div
            style={{
              flex: 1,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '12px',
                background: colors.bgSecondary,
                borderBottom: `1px solid ${colors.borderLight}`,
                fontWeight: '500',
                fontSize: '14px',
                color: colors.textPrimary,
              }}
            >
              Get Prompt: {selectedPrompt.name}
            </div>
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: colors.textSecondary,
                    marginBottom: '6px',
                  }}
                >
                  Arguments (JSON)
                </label>
                <textarea
                  value={promptArgs}
                  onChange={(e) => setPromptArgs(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '150px',
                    padding: '10px',
                    border: `1px solid ${colors.borderLight}`,
                    borderRadius: '6px',
                    fontFamily: fonts.mono,
                    fontSize: '12px',
                    background: colors.bgCard,
                    color: colors.textPrimary,
                    resize: 'vertical',
                  }}
                />
              </div>
              <button
                onClick={handleGetPrompt}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  background: colors.buttonPrimary,
                  color: colors.textInverse,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: fonts.body,
                  fontSize: '13px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Getting...' : 'Get Prompt'}
              </button>
              {promptResult && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: colors.textSecondary,
                      marginBottom: '6px',
                    }}
                  >
                    Result
                  </label>
                  <pre
                    style={{
                      padding: '12px',
                      background: colors.bgSecondary,
                      border: `1px solid ${colors.borderLight}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: fonts.mono,
                      color: promptResult.error ? colors.error : colors.textPrimary,
                      overflow: 'auto',
                      maxHeight: '300px',
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(promptResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderResources = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={loadResources}
          disabled={loading || resourcesLoading}
          style={{
            padding: '8px 16px',
            background: colors.buttonPrimary,
            color: colors.textInverse,
            border: 'none',
            borderRadius: '6px',
            cursor: loading || resourcesLoading ? 'not-allowed' : 'pointer',
            fontFamily: fonts.body,
            fontSize: '13px',
            fontWeight: '500',
            opacity: loading || resourcesLoading ? 0.6 : 1,
          }}
        >
          {resourcesLoading ? 'Loading...' : 'Refresh Resources'}
        </button>
        <span style={{ color: colors.textSecondary, fontSize: '13px' }}>
          {resourcesLoading
            ? 'Loading resources...'
            : `${resources.length} resource${resources.length !== 1 ? 's' : ''} available`}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
        <div
          style={{
            flex: 1,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '12px',
              background: colors.bgSecondary,
              borderBottom: `1px solid ${colors.borderLight}`,
              fontWeight: '500',
              fontSize: '14px',
              color: colors.textPrimary,
            }}
          >
            Available Resources
          </div>
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              background: colors.bgCard,
              position: 'relative',
            }}
          >
            {!serverStatus?.running ? (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: '13px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    margin: '0 auto 16px',
                    border: `3px solid ${colors.borderLight}`,
                    borderTop: `3px solid ${colors.accentBlue}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Waiting for MCP server to start...
              </div>
            ) : resourcesLoading || !resourcesLoaded ? (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: '13px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    margin: '0 auto 16px',
                    border: `3px solid ${colors.borderLight}`,
                    borderTop: `3px solid ${colors.accentBlue}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Loading resources...
              </div>
            ) : error && error.includes('resources:') ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: colors.error,
                  fontSize: '13px',
                }}
              >
                Error loading resources: {error.replace('resources: ', '')}
              </div>
            ) : resources.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: '13px',
                }}
              >
                No resources available.
              </div>
            ) : (
              resources.map((resource, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedResource(resource);
                    setResourceResult(null);
                  }}
                  style={{
                    padding: '12px',
                    borderBottom: `1px solid ${colors.borderLight}`,
                    cursor: 'pointer',
                    background:
                      selectedResource?.uri === resource.uri ? colors.bgSecondary : colors.bgCard,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedResource?.uri !== resource.uri) {
                      e.currentTarget.style.background = colors.bgHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedResource?.uri !== resource.uri) {
                      e.currentTarget.style.background = colors.bgCard;
                    }
                  }}
                >
                  <div
                    style={{
                      fontWeight: '500',
                      fontSize: '13px',
                      color: colors.textPrimary,
                      marginBottom: '4px',
                    }}
                  >
                    {resource.uri}
                  </div>
                  {resource.name && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: colors.textSecondary,
                        marginTop: '4px',
                      }}
                    >
                      {resource.name}
                    </div>
                  )}
                  {resource.description && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: colors.textSecondary,
                        marginTop: '4px',
                      }}
                    >
                      {resource.description}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {selectedResource && (
          <div
            style={{
              flex: 1,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '12px',
                background: colors.bgSecondary,
                borderBottom: `1px solid ${colors.borderLight}`,
                fontWeight: '500',
                fontSize: '14px',
                color: colors.textPrimary,
              }}
            >
              Read Resource: {selectedResource.uri}
            </div>
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <button
                onClick={handleReadResource}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  background: colors.buttonPrimary,
                  color: colors.textInverse,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: fonts.body,
                  fontSize: '13px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Reading...' : 'Read Resource'}
              </button>
              {resourceResult && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: colors.textSecondary,
                      marginBottom: '6px',
                    }}
                  >
                    Result
                  </label>
                  <pre
                    style={{
                      padding: '12px',
                      background: colors.bgSecondary,
                      border: `1px solid ${colors.borderLight}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: fonts.mono,
                      color: resourceResult.error ? colors.error : colors.textPrimary,
                      overflow: 'auto',
                      maxHeight: '400px',
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(resourceResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: colors.bgPrimary,
          padding: '20px',
          gap: '16px',
          position: 'relative',
        }}
      >
        {/* Loading Modal */}
        {showLoadingModal && (
          <div
            ref={loadingModalRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(245, 243, 240, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              borderRadius: '8px',
              backdropFilter: 'blur(2px)',
            }}
          >
            <div
              style={{
                background: colors.bgCard,
                borderRadius: '16px',
                padding: '32px',
                boxShadow: `0 8px 32px ${colors.shadowMd}`,
                maxWidth: '320px',
                width: '90%',
                textAlign: 'center',
              }}
            >
              {/* Animated Spinner */}
              <div
                ref={spinnerRef}
                style={{
                  width: '48px',
                  height: '48px',
                  margin: '0 auto 20px',
                  position: 'relative',
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 64 64"
                  style={{ position: 'absolute', top: 0, left: 0 }}
                >
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke={colors.accentBlue}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="44 132"
                    opacity="0.3"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke={colors.accentBlue}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="22 132"
                    strokeDashoffset="11"
                  />
                </svg>
              </div>

              {/* Loading Text */}
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  fontFamily: fonts.body,
                  marginBottom: '8px',
                }}
              >
                Waiting for MCP Server
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                  marginBottom: '20px',
                }}
              >
                Waiting till MCP server starts...
              </p>

              {/* Animated Dots */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      if (el) dotsRef.current[i] = el;
                    }}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: colors.accentBlue,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Only show top-level error if it's not section-specific */}
        {error && !error.includes(':') && (
          <div
            style={{
              padding: '12px 16px',
              background: colors.error,
              color: colors.textInverse,
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: fonts.body,
            }}
          >
            Error: {error}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: `1px solid ${colors.borderLight}`,
          }}
        >
          {['tools', 'prompts', 'resources'].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              style={{
                padding: '10px 18px',
                background: activeSection === section ? colors.bgSecondary : 'transparent',
                border: 'none',
                borderBottom: `2px solid ${activeSection === section ? colors.accentBlue : 'transparent'}`,
                color: activeSection === section ? colors.textPrimary : colors.textSecondary,
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: fonts.body,
                fontWeight: activeSection === section ? '500' : '400',
                textTransform: 'capitalize',
                borderRadius: '6px 6px 0 0',
                transition: 'all 0.2s',
              }}
            >
              {section}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {activeSection === 'tools' && renderTools()}
          {activeSection === 'prompts' && renderPrompts()}
          {activeSection === 'resources' && renderResources()}
        </div>
      </div>
    </>
  );
}

export default McpPlayground;
