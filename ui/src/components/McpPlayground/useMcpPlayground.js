import { useState, useEffect } from 'react';

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

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (serverStatus?.running && activeSection === 'tools' && tools.length === 0) {
      const timer = setTimeout(() => {
        loadTools();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [serverStatus?.running]);

  useEffect(() => {
    if (!serverStatus?.running) return;

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
  };
}
