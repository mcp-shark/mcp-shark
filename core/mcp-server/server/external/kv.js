const kv = new Map();

export function buildKv(downstreamServers) {
  for (const downstreamServer of downstreamServers) {
    const { name, tools, resources, prompts, callTool, getPrompt, readResource } = downstreamServer;

    if (!kv.has(name)) {
      const toolsMap = new Map();
      const resourcesMap = new Map();
      const promptsMap = new Map();

      for (const tool of tools) {
        toolsMap.set(tool.name, callTool);
      }

      for (const resource of resources) {
        resourcesMap.set(resource.name, readResource);
      }

      for (const prompt of prompts) {
        promptsMap.set(prompt.name, getPrompt);
      }

      kv.set(name, {
        toolsMap,
        resourcesMap,
        promptsMap,
        tools: tools.map((tool) => {
          return { ...tool, name: tool.name };
        }),
        resources: resources.map((resource) => {
          return {
            ...resource,
            name: resource.name,
          };
        }),
        prompts: prompts.map((prompt) => {
          return { ...prompt, name: prompt.name };
        }),
      });
    }
  }

  return kv;
}

export function getBy(database, requestedMcpServer, calledName, action) {
  const entry = database.get(requestedMcpServer);
  if (!entry) {
    return null;
  }

  // Type-based lookup
  if (action === 'getTools') {
    return entry.toolsMap.get(calledName);
  }
  if (action === 'getResources') {
    return entry.resourcesMap.get(calledName);
  }
  if (action === 'getPrompts') {
    return entry.promptsMap.get(calledName);
  }

  // Action-based lookup
  if (action === 'callTool') {
    return entry.toolsMap.get(calledName);
  }
  if (action === 'readResource') {
    return entry.resourcesMap.get(calledName);
  }
  if (action === 'getPrompt') {
    return entry.promptsMap.get(calledName);
  }
  return null;
}

export function listAll(database, requestedMcpServer, type) {
  const serverEntry = database.get(requestedMcpServer);
  if (!serverEntry) {
    return [];
  }
  return serverEntry[type];
}
