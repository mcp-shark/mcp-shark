import assert from 'node:assert';
import { describe, it } from 'node:test';
import { TrafficToxicFlowService } from '../TrafficToxicFlowService.js';

describe('TrafficToxicFlowService', () => {
  it('rebuildFromDatabase returns zeros when packet repository has no list method', () => {
    const svc = new TrafficToxicFlowService({}, null);
    const stats = svc.rebuildFromDatabase();
    assert.deepStrictEqual(stats, { packetRows: 0, serverCount: 0, flowCount: 0 });
  });

  it('rebuildFromDatabase yields no flows with only one server', () => {
    const rows = [
      {
        remote_address: 'only-one',
        session_id: 's1',
        jsonrpc_result: JSON.stringify({
          tools: [{ name: 'get_secret' }, { name: 'post_message' }],
        }),
        body_json: null,
        body_raw: null,
      },
    ];
    const svc = new TrafficToxicFlowService({ listResponsesWithToolsList: () => rows }, null);
    const stats = svc.rebuildFromDatabase();
    assert.strictEqual(stats.serverCount, 1);
    assert.strictEqual(stats.flowCount, 0);
    assert.strictEqual(svc.getSnapshot().toxicFlows.length, 0);
  });

  it('rebuildFromDatabase skips rows without server key', () => {
    const rows = [
      {
        remote_address: null,
        session_id: null,
        jsonrpc_result: JSON.stringify({ tools: [{ name: 'x' }] }),
        body_json: null,
        body_raw: null,
      },
    ];
    const svc = new TrafficToxicFlowService({ listResponsesWithToolsList: () => rows }, null);
    svc.rebuildFromDatabase();
    assert.strictEqual(svc.getSnapshot().servers.length, 0);
  });

  it('rebuildFromDatabase uses body_json when jsonrpc_result unparseable for tools', () => {
    const bodyObj = {
      jsonrpc: '2.0',
      id: 1,
      result: { tools: [{ name: 'get_secret' }] },
    };
    const rows = [
      {
        remote_address: 'srv-a',
        session_id: 's1',
        jsonrpc_result: '{"tools":"not-array"}',
        body_json: JSON.stringify(bodyObj),
        body_raw: null,
      },
      {
        remote_address: 'srv-b',
        session_id: 's1',
        jsonrpc_result: JSON.stringify({ tools: [{ name: 'post_message' }] }),
        body_json: null,
        body_raw: null,
      },
    ];
    const svc = new TrafficToxicFlowService({ listResponsesWithToolsList: () => rows }, null);
    const stats = svc.rebuildFromDatabase();
    assert.strictEqual(stats.serverCount, 2);
    assert.ok(stats.flowCount >= 1);
  });

  it('rebuildFromDatabase last row wins for same server key', () => {
    const rows = [
      {
        remote_address: 'dup',
        session_id: 's1',
        jsonrpc_result: JSON.stringify({ tools: [{ name: 'noop' }] }),
        body_json: null,
        body_raw: null,
      },
      {
        remote_address: 'dup',
        session_id: 's1',
        jsonrpc_result: JSON.stringify({ tools: [{ name: 'get_secret' }] }),
        body_json: null,
        body_raw: null,
      },
      {
        remote_address: 'other',
        session_id: 's1',
        jsonrpc_result: JSON.stringify({ tools: [{ name: 'post_message' }] }),
        body_json: null,
        body_raw: null,
      },
    ];
    const svc = new TrafficToxicFlowService({ listResponsesWithToolsList: () => rows }, null);
    svc.rebuildFromDatabase();
    const dupEntry = svc.getSnapshot().servers.find((s) => s.name === 'dup');
    assert.strictEqual(dupEntry.toolCount, 1);
    assert.strictEqual(dupEntry.name, 'dup');
  });

  it('ingestFromTrafficResponse uses session fallback when no mcpServerName', async () => {
    const svc = new TrafficToxicFlowService({ listResponsesWithToolsList: () => [] }, null);
    svc.ingestFromTrafficResponse({
      mcpServerName: null,
      sessionId: 'sess-abc',
      body: {
        jsonrpc: '2.0',
        result: { tools: [{ name: 'get_secret' }] },
      },
    });
    svc.ingestFromTrafficResponse({
      mcpServerName: null,
      sessionId: 'sess-def',
      body: {
        jsonrpc: '2.0',
        result: { tools: [{ name: 'post_message' }] },
      },
    });
    await new Promise((r) => setTimeout(r, 500));
    const snap = svc.getSnapshot();
    assert.ok(snap.servers.some((s) => s.name === 'session:sess-abc'));
    assert.ok(snap.servers.some((s) => s.name === 'session:sess-def'));
    assert.ok(snap.toxicFlows.length >= 1);
  });

  it('ingestFromTrafficResponse ignores non-tools-list bodies', () => {
    const svc = new TrafficToxicFlowService({ listResponsesWithToolsList: () => [] }, null);
    svc.ingestFromTrafficResponse({
      mcpServerName: 'x',
      sessionId: 's',
      body: { jsonrpc: '2.0', result: {} },
    });
    assert.strictEqual(svc.getSnapshot().servers.length, 0);
  });

  it('clear resets registry and pending debounce', async () => {
    const svc = new TrafficToxicFlowService({ listResponsesWithToolsList: () => [] }, null);
    svc.ingestFromTrafficResponse({
      mcpServerName: 'a',
      sessionId: 's',
      body: { jsonrpc: '2.0', result: { tools: [{ name: 'get_secret' }] } },
    });
    svc.clear();
    await new Promise((r) => setTimeout(r, 500));
    const snap = svc.getSnapshot();
    assert.strictEqual(snap.servers.length, 0);
    assert.strictEqual(snap.toxicFlows.length, 0);
    assert.strictEqual(snap.computedAt, null);
  });

  it('rebuildFromDatabase produces flows for two capability servers', () => {
    const rows = [
      {
        remote_address: 'vault-server',
        session_id: 's1',
        jsonrpc_result: JSON.stringify({
          tools: [{ name: 'get_secret', description: 'vault' }],
        }),
        body_json: null,
        body_raw: null,
      },
      {
        remote_address: 'notify-server',
        session_id: 's1',
        jsonrpc_result: JSON.stringify({
          tools: [{ name: 'post_message', description: 'slack' }],
        }),
        body_json: null,
        body_raw: null,
      },
    ];
    const packetRepository = {
      listResponsesWithToolsList: () => rows,
    };
    const svc = new TrafficToxicFlowService(packetRepository, null);
    const stats = svc.rebuildFromDatabase();
    assert.strictEqual(stats.serverCount, 2);
    assert.ok(stats.flowCount >= 1);
    const snap = svc.getSnapshot();
    assert.ok(snap.toxicFlows.some((f) => f.title.includes('Secret theft')));
  });

  it('ingestFromTrafficResponse debounces into flows (manual recompute via replay pattern)', async () => {
    const svc = new TrafficToxicFlowService({ listResponsesWithToolsList: () => [] }, null);
    svc.ingestFromTrafficResponse({
      mcpServerName: 'a',
      sessionId: 'x',
      body: {
        jsonrpc: '2.0',
        result: { tools: [{ name: 'get_secret' }] },
      },
    });
    svc.ingestFromTrafficResponse({
      mcpServerName: 'b',
      sessionId: 'x',
      body: {
        jsonrpc: '2.0',
        result: { tools: [{ name: 'post_message' }] },
      },
    });
    await new Promise((r) => setTimeout(r, 500));
    const snap = svc.getSnapshot();
    assert.strictEqual(snap.servers.length, 2);
    assert.ok(snap.toxicFlows.length >= 1);
  });
});
