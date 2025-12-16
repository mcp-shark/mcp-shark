import * as fs from 'node:fs';

const state = { originalConfigData: null };

export function storeOriginalConfig(filePath, originalContent, backupPath) {
  state.originalConfigData = { filePath, originalContent, backupPath };
}

export function restoreOriginalConfig(mcpSharkLogs, broadcastLogUpdate) {
  if (state.originalConfigData?.filePath) {
    try {
      if (fs.existsSync(state.originalConfigData.filePath)) {
        fs.writeFileSync(
          state.originalConfigData.filePath,
          state.originalConfigData.originalContent
        );
        console.log(`Restored original config to: ${state.originalConfigData.filePath}`);
        state.originalConfigData = null;
        return true;
      }
      state.originalConfigData = null;
      return false;
    } catch (error) {
      console.error('Failed to restore original config:', error);
      const timestamp = new Date().toISOString();
      const errorLog = {
        timestamp,
        type: 'error',
        line: `[RESTORE ERROR] Failed to restore: ${error.message}`,
      };
      mcpSharkLogs.push(errorLog);
      if (mcpSharkLogs.length > 10000) {
        mcpSharkLogs.shift();
      }
      broadcastLogUpdate(errorLog);
      return false;
    }
  }
  return false;
}

export function clearOriginalConfig() {
  state.originalConfigData = null;
}

export function convertMcpServersToServers(config) {
  const { mcpServers, servers } = config;
  const converted = { servers: {} };

  if (servers) {
    converted.servers = servers;
  }

  if (mcpServers) {
    Object.entries(mcpServers).forEach(([name, cfg]) => {
      const type = cfg.type || (cfg.url ? 'http' : cfg.command ? 'stdio' : 'stdio');
      converted.servers[name] = { type, ...cfg };
    });
  }

  return converted;
}

export function extractServices(config) {
  const { mcpServers, servers } = config;
  const servicesMap = new Map();

  if (servers) {
    Object.entries(servers).forEach(([name, cfg]) => {
      const type = cfg.type || (cfg.url ? 'http' : cfg.command ? 'stdio' : 'stdio');
      servicesMap.set(name, {
        name,
        type,
        url: cfg.url || null,
        command: cfg.command || null,
        args: cfg.args || null,
      });
    });
  }

  if (mcpServers) {
    Object.entries(mcpServers).forEach(([name, cfg]) => {
      if (!servicesMap.has(name)) {
        const type = cfg.type || (cfg.url ? 'http' : cfg.command ? 'stdio' : 'stdio');
        servicesMap.set(name, {
          name,
          type,
          url: cfg.url || null,
          command: cfg.command || null,
          args: cfg.args || null,
        });
      }
    });
  }

  return Array.from(servicesMap.values());
}
