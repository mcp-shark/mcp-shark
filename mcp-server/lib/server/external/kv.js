const kv = new Map();

function buildName(name, typeName) {
  return `${name}.${typeName}`;
}

export function extractName(name) {
  const [serverName, typeName] = name.split('.');
  return { serverName, typeName };
}

export function buildKv(downstreamServers) {
  for (const downstreamServer of downstreamServers) {
    const {
      name,
      tools,
      resources,
      prompts,
      callTool,
      getPrompt,
      readResource,
    } = downstreamServer;

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
        tools: tools.map(tool => {
          return { ...tool, name: buildName(name, tool.name) };
        }),
        resources: resources.map(resource => {
          return {
            ...resource,
            name: buildName(name, resource.name),
          };
        }),
        prompts: prompts.map(prompt => {
          return { ...prompt, name: buildName(name, prompt.name) };
        }),
      });
    }
  }

  return kv;
}

export function getBy(database, calledName, action) {
  const { serverName, typeName } = extractName(calledName);
  if (!serverName || !typeName) {
    return null;
  }
  const entry = database.get(serverName);
  if (!entry) {
    return null;
  }

  // Type-based lookup
  if (action === 'getTools') {
    return entry.toolsMap.get(typeName);
  }
  if (action === 'getResources') {
    return entry.resourcesMap.get(typeName);
  }
  if (action === 'getPrompts') {
    return entry.promptsMap.get(typeName);
  }

  // Action-based lookup
  if (action === 'callTool') {
    return entry.toolsMap.get(typeName);
  }
  if (action === 'readResource') {
    return entry.resourcesMap.get(typeName);
  }
  if (action === 'getPrompt') {
    return entry.promptsMap.get(typeName);
  }
  return null;
}

export function listAll(database, type) {
  return Array.from(database.values())
    .map(entry => entry[type])
    .flat();
}
