import * as fs from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';

export function resolveFileData(filePath, fileContent) {
  if (fileContent) {
    const resolvedFilePath = filePath
      ? filePath.startsWith('~')
        ? path.join(homedir(), filePath.slice(1))
        : filePath
      : null;
    return { content: fileContent, resolvedFilePath };
  }

  const resolvedFilePath = filePath.startsWith('~')
    ? path.join(homedir(), filePath.slice(1))
    : filePath;

  if (!fs.existsSync(resolvedFilePath)) {
    return null;
  }

  return {
    content: fs.readFileSync(resolvedFilePath, 'utf-8'),
    resolvedFilePath,
  };
}

export function parseJsonConfig(content) {
  try {
    return { config: JSON.parse(content), error: null };
  } catch (e) {
    return { config: null, error: e };
  }
}

export function filterServers(config, services) {
  const filteredServers = {};
  services.forEach((serviceName) => {
    if (config.servers[serviceName]) {
      filteredServers[serviceName] = config.servers[serviceName];
    }
  });
  return { servers: filteredServers };
}
