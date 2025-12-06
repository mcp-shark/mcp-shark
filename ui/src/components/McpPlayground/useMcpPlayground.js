import { useState, useEffect } from 'react';
import { useMcpRequest } from './hooks/useMcpRequest';
import { useMcpServerStatus } from './hooks/useMcpServerStatus';
import { useMcpDataLoader } from './hooks/useMcpDataLoader';

export function useMcpPlayground() {
  const [activeSection, setActiveSection] = useState('tools');
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolArgs, setToolArgs] = useState('{}');
  const [toolResult, setToolResult] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [promptArgs, setPromptArgs] = useState('{}');
  const [promptResult, setPromptResult] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceResult, setResourceResult] = useState(null);

  const { serverStatus, showLoadingModal, availableServers, selectedServer, setSelectedServer } =
    useMcpServerStatus();

  const { makeMcpRequest, loading, error, setError, resetSession } = useMcpRequest(selectedServer);

  const {
    tools,
    prompts,
    resources,
    toolsLoading,
    promptsLoading,
    resourcesLoading,
    toolsLoaded,
    promptsLoaded,
    resourcesLoaded,
    loadTools,
    loadPrompts,
    loadResources,
    resetData,
  } = useMcpDataLoader(makeMcpRequest, selectedServer, setError);

  // Reset and reload data when server changes
  useEffect(() => {
    if (!selectedServer || !serverStatus?.running) {
      return;
    }

    resetData();
    setSelectedTool(null);
    setSelectedPrompt(null);
    setSelectedResource(null);
    setToolResult(null);
    setPromptResult(null);
    setResourceResult(null);
    setToolArgs('{}');
    setPromptArgs('{}');
    resetSession();
    setError(null);

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
