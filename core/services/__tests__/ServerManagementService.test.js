import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { ServerManagementService } from '../ServerManagementService.js';

describe('ServerManagementService', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.mockConfigService = {
      getMcpConfigPath: () => '/tmp/test-config.json',
      processSetup: () => ({ success: true }),
      writeConfigAsJson: () => {},
      fileExists: () => true,
    };
    ctx.mockConfigPatchingService = {
      restoreIfPatched: () => ({}),
      patchConfigFile: () => ({}),
    };
    ctx.mockLogger = {
      info: () => {},
      error: () => {},
      debug: () => {},
      warn: () => {},
    };
    ctx.service = new ServerManagementService(
      ctx.mockConfigService,
      ctx.mockConfigPatchingService,
      ctx.mockLogger
    );
  });

  describe('getServerStatus', () => {
    test('returns not running when no server instance', () => {
      const status = ctx.service.getServerStatus();
      assert.strictEqual(status.running, false);
      assert.strictEqual(status.pid, null);
    });

    test('returns running when server instance exists', () => {
      ctx.service.serverInstance = { stop: () => {} };
      const status = ctx.service.getServerStatus();
      assert.strictEqual(status.running, true);
    });
  });

  describe('getConnectedServers', () => {
    test('returns empty array when no server instance', () => {
      const servers = ctx.service.getConnectedServers();
      assert.deepStrictEqual(servers, []);
    });

    test('returns empty array when server has no externalServers', () => {
      ctx.service.serverInstance = {};
      const servers = ctx.service.getConnectedServers();
      assert.deepStrictEqual(servers, []);
    });

    test('returns empty array when externalServers is empty', () => {
      ctx.service.serverInstance = { externalServers: [] };
      const servers = ctx.service.getConnectedServers();
      assert.deepStrictEqual(servers, []);
    });

    test('filters out servers with errors', () => {
      ctx.service.serverInstance = {
        externalServers: [
          { name: 'server1', error: 'Connection failed', client: null },
          { name: 'server2', client: {}, tools: ['tool1'] },
        ],
      };
      const servers = ctx.service.getConnectedServers();
      assert.strictEqual(servers.length, 1);
      assert.strictEqual(servers[0].name, 'server2');
    });

    test('filters out servers without client', () => {
      ctx.service.serverInstance = {
        externalServers: [
          { name: 'server1', client: null },
          { name: 'server2', client: {}, tools: ['tool1'] },
        ],
      };
      const servers = ctx.service.getConnectedServers();
      assert.strictEqual(servers.length, 1);
      assert.strictEqual(servers[0].name, 'server2');
    });

    test('returns connected servers with tools, resources, prompts', () => {
      ctx.service.serverInstance = {
        externalServers: [
          {
            name: 'filesystem',
            client: {},
            tools: [{ name: 'read_file' }, { name: 'write_file' }],
            resources: [{ uri: 'file:///' }],
            prompts: [{ name: 'summarize' }],
          },
          {
            name: 'github',
            client: {},
            tools: [{ name: 'create_issue' }],
            resources: [],
            prompts: [],
          },
        ],
      };
      const servers = ctx.service.getConnectedServers();
      assert.strictEqual(servers.length, 2);

      assert.strictEqual(servers[0].name, 'filesystem');
      assert.strictEqual(servers[0].tools.length, 2);
      assert.strictEqual(servers[0].resources.length, 1);
      assert.strictEqual(servers[0].prompts.length, 1);

      assert.strictEqual(servers[1].name, 'github');
      assert.strictEqual(servers[1].tools.length, 1);
    });

    test('handles missing tools/resources/prompts with defaults', () => {
      ctx.service.serverInstance = {
        externalServers: [{ name: 'minimal', client: {} }],
      };
      const servers = ctx.service.getConnectedServers();
      assert.strictEqual(servers.length, 1);
      assert.deepStrictEqual(servers[0].tools, []);
      assert.deepStrictEqual(servers[0].resources, []);
      assert.deepStrictEqual(servers[0].prompts, []);
    });

    test('filters out null entries in externalServers', () => {
      ctx.service.serverInstance = {
        externalServers: [null, { name: 'valid', client: {} }, undefined],
      };
      const servers = ctx.service.getConnectedServers();
      assert.strictEqual(servers.length, 1);
      assert.strictEqual(servers[0].name, 'valid');
    });
  });

  describe('getServerInstance', () => {
    test('returns null when no instance', () => {
      assert.strictEqual(ctx.service.getServerInstance(), null);
    });

    test('returns server instance when set', () => {
      const instance = { stop: () => {} };
      ctx.service.serverInstance = instance;
      assert.strictEqual(ctx.service.getServerInstance(), instance);
    });
  });

  describe('setServerInstance', () => {
    test('sets the server instance', () => {
      const instance = { stop: () => {} };
      ctx.service.setServerInstance(instance);
      assert.strictEqual(ctx.service.serverInstance, instance);
    });
  });

  describe('stopServer', () => {
    test('returns false when no server running', async () => {
      const result = await ctx.service.stopServer();
      assert.strictEqual(result, false);
    });

    test('stops server and clears instance', async () => {
      let stopCalled = false;
      ctx.service.serverInstance = {
        stop: async () => {
          stopCalled = true;
        },
      };

      const result = await ctx.service.stopServer();
      assert.strictEqual(result, true);
      assert.strictEqual(stopCalled, true);
      assert.strictEqual(ctx.service.serverInstance, null);
    });
  });

  describe('shutdown', () => {
    test('throws error if cleanup is not a function', async () => {
      await assert.rejects(async () => ctx.service.shutdown(null), {
        message: 'Cleanup function is required',
      });
    });

    test('throws error if cleanup is missing', async () => {
      await assert.rejects(async () => ctx.service.shutdown(), {
        message: 'Cleanup function is required',
      });
    });

    test('calls cleanup function', async () => {
      let cleanupCalled = false;
      const cleanup = async () => {
        cleanupCalled = true;
      };

      const result = await ctx.service.shutdown(cleanup);
      assert.strictEqual(cleanupCalled, true);
      assert.strictEqual(result.success, true);
    });

    test('stops server before cleanup', async () => {
      const callOrder = [];
      ctx.service.serverInstance = {
        stop: async () => {
          callOrder.push('stop');
        },
      };

      const cleanup = async () => {
        callOrder.push('cleanup');
      };

      await ctx.service.shutdown(cleanup);
      assert.deepStrictEqual(callOrder, ['stop', 'cleanup']);
    });
  });

  describe('setup self-write protection', () => {
    function buildSetupCtx({
      sourcePath,
      mcpsPath = '/tmp/mcps.json',
      convertedConfig = { servers: { upstream: { type: 'stdio', command: 'node' } } },
      existingMcpsContent = null,
    }) {
      const writes = [];
      const patchCalls = [];
      const startCalls = [];

      const writeMap = new Map();
      if (existingMcpsContent !== null) {
        writeMap.set(mcpsPath, existingMcpsContent);
      }

      const configService = {
        getMcpConfigPath: () => mcpsPath,
        processSetup: () => ({
          success: true,
          fileData: { resolvedFilePath: sourcePath, content: '{}' },
          originalConfig: { mcpServers: {} },
          convertedConfig,
          updatedConfig: { mcpServers: {} },
        }),
        writeConfigAsJson: (p, cfg) => {
          writes.push({ path: p, config: cfg });
          writeMap.set(p, JSON.stringify(cfg));
        },
        fileExists: (p) => writeMap.has(p) || p === sourcePath,
        readConfigFile: (p) => writeMap.get(p) || '',
        tryParseJson: (s) => {
          try {
            return s ? JSON.parse(s) : null;
          } catch {
            return null;
          }
        },
      };

      const configPatchingService = {
        restoreIfPatched: () => ({}),
        patchConfigFile: (p, cfg) => {
          patchCalls.push({ path: p, config: cfg });
          return {};
        },
      };

      const service = new ServerManagementService(
        configService,
        configPatchingService,
        ctx.mockLogger
      );
      service.startServer = async (opts) => {
        startCalls.push(opts);
        return { stop: () => {} };
      };

      return { service, writes, patchCalls, startCalls };
    }

    test('does not patch source when source is the proxy mcps.json', async () => {
      const mcpsPath = '/tmp/mcps.json';
      const { service, writes, patchCalls, startCalls } = buildSetupCtx({
        sourcePath: mcpsPath,
        mcpsPath,
      });

      const result = await service.setup({ filePath: mcpsPath });
      assert.strictEqual(result.success, true);
      assert.strictEqual(writes.length, 1, 'still writes converted config to mcps.json');
      assert.strictEqual(writes[0].path, mcpsPath);
      assert.strictEqual(patchCalls.length, 0, 'must NOT patch the proxy config file');
      assert.strictEqual(startCalls.length, 1, 'still starts the proxy');
    });

    test('still patches when source is an editor config', async () => {
      const mcpsPath = '/tmp/mcps.json';
      const editorPath = '/tmp/cursor-mcp.json';
      const { service, patchCalls } = buildSetupCtx({
        sourcePath: editorPath,
        mcpsPath,
      });

      await service.setup({ filePath: editorPath });
      assert.strictEqual(patchCalls.length, 1, 'editor config still gets patched');
      assert.strictEqual(patchCalls[0].path, editorPath);
    });

    test('preserves existing mcps.json when conversion produced zero upstreams', async () => {
      const mcpsPath = '/tmp/mcps.json';
      const editorPath = '/tmp/cursor-mcp.json';
      const existing = JSON.stringify({
        servers: { keep: { type: 'stdio', command: 'node' } },
      });
      const { service, writes } = buildSetupCtx({
        sourcePath: editorPath,
        mcpsPath,
        convertedConfig: { servers: {} },
        existingMcpsContent: existing,
      });

      await service.setup({ filePath: editorPath });
      assert.strictEqual(
        writes.length,
        0,
        'must not overwrite a healthy mcps.json with an empty conversion'
      );
    });

    test('writes empty config when no existing upstreams to preserve', async () => {
      const mcpsPath = '/tmp/mcps.json';
      const editorPath = '/tmp/cursor-mcp.json';
      const { service, writes } = buildSetupCtx({
        sourcePath: editorPath,
        mcpsPath,
        convertedConfig: { servers: {} },
        existingMcpsContent: null,
      });

      await service.setup({ filePath: editorPath });
      assert.strictEqual(writes.length, 1, 'first-time setup may legitimately write empty config');
    });
  });
});
