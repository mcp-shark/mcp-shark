import { useState, useEffect, useCallback } from 'react';

export function useMcpPlayground() {
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
  const [availableServers, setAvailableServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);

  useEffect(() => {
    checkServerStatus();
    loadAvailableServers();
    const interval = setInterval(checkServerStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (availableServers.length > 0 && !selectedServer) {
      setSelectedServer(availableServers[0]);
    }
  }, [availableServers]);

  // Reset and reload data when server changes
  useEffect(() => {
    if (!selectedServer || !serverStatus?.running) {
      return;
    }

    // Reset all loaded states and clear data
    setToolsLoaded(false);
    setPromptsLoaded(false);
    setResourcesLoaded(false);
    setTools([]);
    setPrompts([]);
    setResources([]);
    setSelectedTool(null);
    setSelectedPrompt(null);
    setSelectedResource(null);
    setToolResult(null);
    setPromptResult(null);
    setResourceResult(null);
    setToolArgs('{}');
    setPromptArgs('{}');
    setSessionId(null); // Reset session when server changes
    setError(null);

    // Reload data for the active section
    const timer = setTimeout(() => {
      if (activeSection === 'tools') {
        loadTools();
      } else if (activeSection === 'prompts') {
        loadPrompts();
      } else if (activeSection === 'resources') {
        loadResources();
      }
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServer, serverStatus?.running, activeSection]);

  const loadAvailableServers = async () => {
    try {
      const res = await fetch('/api/composite/servers');
      if (res.ok) {
        const data = await res.json();
        setAvailableServers(data.servers || []);
        if (data.servers && data.servers.length > 0 && !selectedServer) {
          setSelectedServer(data.servers[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load servers:', err);
    }
  };

  useEffect(() => {
    if (
      serverStatus?.running &&
      activeSection === 'tools' &&
      tools.length === 0 &&
      selectedServer
    ) {
      const timer = setTimeout(() => {
        loadTools();
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverStatus?.running, selectedServer, activeSection, tools.length]);

  useEffect(() => {
    if (!serverStatus?.running || !selectedServer) return;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeSection,
    serverStatus?.running,
    selectedServer,
    toolsLoaded,
    promptsLoaded,
    resourcesLoaded,
    toolsLoading,
    promptsLoading,
    resourcesLoading,
  ]);

  const checkServerStatus = async () => {
    try {
      const res = await fetch('/api/composite/status');
      if (!res.ok) {
        throw new Error('Server not available');
      }
      const data = await res.json();
      const wasRunning = serverStatus?.running;
      setServerStatus(data);

      if (!data.running) {
        if (!showLoadingModal || wasRunning) {
          setShowLoadingModal(true);
        }
      } else if (data.running && showLoadingModal) {
        setShowLoadingModal(false);
      }
    } catch (err) {
      // Silently handle connection errors - server is not running
      setServerStatus({ running: false });
      if (!showLoadingModal) {
        setShowLoadingModal(true);
      }
    }
  };

  const makeMcpRequest = useCallback(
    async (method, params = {}) => {
      if (!selectedServer) {
        throw new Error('No server selected');
      }

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
          body: JSON.stringify({ method, params, serverName: selectedServer }),
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
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedServer, sessionId]
  );

  const loadTools = async () => {
    if (!selectedServer) {
      setError('tools: No server selected');
      setToolsLoaded(true);
      return;
    }

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
    if (!selectedServer) {
      setError('prompts: No server selected');
      setPromptsLoaded(true);
      return;
    }

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
    if (!selectedServer) {
      setError('resources: No server selected');
      setResourcesLoaded(true);
      return;
    }

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

  return {
    activeSection,
    setActiveSection,
    tools,
    prompts,
    resources,
    loading,
    error,
    selectedTool,
    setSelectedTool,
    toolArgs,
    setToolArgs,
    toolResult,
    selectedPrompt,
    setSelectedPrompt,
    promptArgs,
    setPromptArgs,
    promptResult,
    selectedResource,
    setSelectedResource,
    resourceResult,
    serverStatus,
    showLoadingModal,
    toolsLoading,
    promptsLoading,
    resourcesLoading,
    toolsLoaded,
    promptsLoaded,
    resourcesLoaded,
    loadTools,
    loadPrompts,
    loadResources,
    handleCallTool,
    handleGetPrompt,
    handleReadResource,
    availableServers,
    selectedServer,
    setSelectedServer,
  };
}
