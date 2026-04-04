import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getAllServers } from '../ConfigScanner.js';

describe('ConfigScanner', () => {
  describe('getAllServers', () => {
    it('returns empty array for no IDE results', () => {
      const servers = getAllServers([]);
      assert.deepStrictEqual(servers, []);
    });

    it('skips unfound IDEs', () => {
      const ideResults = [
        { name: 'Cursor', found: false, servers: {} },
        { name: 'VS Code', found: false, servers: {} },
      ];
      const servers = getAllServers(ideResults);
      assert.strictEqual(servers.length, 0);
    });

    it('extracts servers from found IDEs', () => {
      const ideResults = [
        {
          name: 'Cursor',
          found: true,
          configPath: '/home/user/.cursor/mcp.json',
          servers: {
            'my-server': {
              command: 'node',
              args: ['server.js'],
              env: { API_KEY: 'test' },
              tools: [{ name: 'read_file' }],
            },
          },
        },
      ];
      const servers = getAllServers(ideResults);
      assert.strictEqual(servers.length, 1);
      assert.strictEqual(servers[0].name, 'my-server');
      assert.strictEqual(servers[0].ide, 'Cursor');
      assert.strictEqual(servers[0].configPath, '/home/user/.cursor/mcp.json');
      assert.ok(Array.isArray(servers[0].tools));
    });

    it('treats null server config as having no tools', () => {
      const ideResults = [
        {
          name: 'Cursor',
          found: true,
          configPath: '/path/mcp.json',
          servers: { broken: null },
        },
      ];
      const servers = getAllServers(ideResults);
      assert.strictEqual(servers.length, 1);
      assert.deepStrictEqual(servers[0].tools, []);
    });

    it('handles multiple servers from multiple IDEs', () => {
      const ideResults = [
        {
          name: 'Cursor',
          found: true,
          configPath: '/path/a',
          servers: { srv1: {}, srv2: {} },
        },
        {
          name: 'VS Code',
          found: true,
          configPath: '/path/b',
          servers: { srv3: {} },
        },
        {
          name: 'Windsurf',
          found: false,
          servers: {},
        },
      ];
      const servers = getAllServers(ideResults);
      assert.strictEqual(servers.length, 3);
      const names = servers.map((s) => s.name);
      assert.ok(names.includes('srv1'));
      assert.ok(names.includes('srv2'));
      assert.ok(names.includes('srv3'));
    });
  });
});
