import { useState } from 'react';

export function useMcpDataLoader(makeMcpRequest, selectedServer, setError) {
  const [tools, setTools] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [resources, setResources] = useState([]);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [toolsLoaded, setToolsLoaded] = useState(false);
  const [promptsLoaded, setPromptsLoaded] = useState(false);
  const [resourcesLoaded, setResourcesLoaded] = useState(false);

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

  const resetData = () => {
    setToolsLoaded(false);
    setPromptsLoaded(false);
    setResourcesLoaded(false);
    setTools([]);
    setPrompts([]);
    setResources([]);
  };

  return {
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
  };
}
