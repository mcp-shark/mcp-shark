import { useState, useEffect } from 'react';
import { colors, fonts } from '../theme';

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

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 2000);
    return () => clearInterval(interval);
  }, []);

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
      setServerStatus(data);
    } catch (err) {
      setServerStatus({ running: false });
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
    try {
      const result = await makeMcpRequest('tools/list');
      setTools(result?.tools || []);
    } catch (err) {
      console.error('Failed to load tools:', err);
    }
  };

  const loadPrompts = async () => {
    try {
      const result = await makeMcpRequest('prompts/list');
      setPrompts(result?.prompts || []);
    } catch (err) {
      console.error('Failed to load prompts:', err);
    }
  };

  const loadResources = async () => {
    try {
      const result = await makeMcpRequest('resources/list');
      setResources(result?.resources || []);
    } catch (err) {
      console.error('Failed to load resources:', err);
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
    // Only auto-load if server is running
    if (!serverStatus?.running) return;

    if (activeSection === 'tools' && tools.length === 0) {
      // Don't auto-load tools - let user click the button after server is ready
      // loadTools();
    } else if (activeSection === 'prompts' && prompts.length === 0) {
      // Don't auto-load prompts
      // loadPrompts();
    } else if (activeSection === 'resources' && resources.length === 0) {
      // Don't auto-load resources
      // loadResources();
    }
  }, [activeSection, serverStatus?.running]);

  const renderTools = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={loadTools}
          disabled={loading}
          style={{
            padding: '8px 16px',
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
          {loading ? 'Loading...' : 'Refresh Tools'}
        </button>
        <span style={{ color: colors.textSecondary, fontSize: '13px' }}>
          {tools.length} tool{tools.length !== 1 ? 's' : ''} available
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
            }}
          >
            {tools.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: '13px',
                }}
              >
                No tools available. Make sure the MCP server is running.
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
          disabled={loading}
          style={{
            padding: '8px 16px',
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
          {loading ? 'Loading...' : 'Refresh Prompts'}
        </button>
        <span style={{ color: colors.textSecondary, fontSize: '13px' }}>
          {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} available
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
            }}
          >
            {prompts.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: '13px',
                }}
              >
                No prompts available. Make sure the MCP server is running.
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
          disabled={loading}
          style={{
            padding: '8px 16px',
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
          {loading ? 'Loading...' : 'Refresh Resources'}
        </button>
        <span style={{ color: colors.textSecondary, fontSize: '13px' }}>
          {resources.length} resource{resources.length !== 1 ? 's' : ''} available
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
            }}
          >
            {resources.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: '13px',
                }}
              >
                No resources available. Make sure the MCP server is running.
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: colors.bgPrimary,
        padding: '20px',
        gap: '16px',
      }}
    >
      {!serverStatus?.running && (
        <div
          style={{
            padding: '12px 16px',
            background: colors.warning,
            color: colors.textInverse,
            borderRadius: '6px',
            fontSize: '13px',
            fontFamily: fonts.body,
          }}
        >
          ⚠️ MCP server is not running. Please start it from the Setup tab.
        </div>
      )}

      {error && (
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
  );
}

export default McpPlayground;
