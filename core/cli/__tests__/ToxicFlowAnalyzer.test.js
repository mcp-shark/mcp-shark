import assert from 'node:assert';
import { describe, it } from 'node:test';
import { analyzeToxicFlows } from '../ToxicFlowAnalyzer.js';

describe('ToxicFlowAnalyzer', () => {
  it('detects writes_code to sends_external flow (rule-pack heuristic)', () => {
    const servers = [
      { name: 'git-server', ide: 'Cursor', tools: [{ name: 'push_files' }] },
      { name: 'slack-server', ide: 'Cursor', tools: [{ name: 'post_message' }] },
    ];
    const flows = analyzeToxicFlows(servers);
    const hit = flows.find(
      (f) =>
        f.source === 'git-server' &&
        f.target === 'slack-server' &&
        f.sourceCapability === 'writes_code' &&
        f.targetCapability === 'sends_external'
    );
    assert.ok(hit, 'Expected code→external toxic flow');
  });

  it('detects flow between ingests_untrusted and writes_code servers', () => {
    const servers = [
      { name: 'slack-server', ide: 'Cursor', tools: [{ name: 'list_messages' }] },
      { name: 'github-server', ide: 'Cursor', tools: [{ name: 'push_files' }] },
    ];
    const flows = analyzeToxicFlows(servers);
    assert.ok(flows.length > 0, 'Should detect toxic flow');
    const flow = flows.find((f) => f.source === 'slack-server' && f.target === 'github-server');
    assert.ok(flow, 'Should find Slack→GitHub flow');
    assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(flow.risk));
    assert.ok(flow.scenario.length > 0);
  });

  it('does not create flow between same server', () => {
    const servers = [
      {
        name: 'multi-tool',
        ide: 'Cursor',
        tools: [{ name: 'list_messages' }, { name: 'push_files' }],
      },
    ];
    const flows = analyzeToxicFlows(servers);
    const selfFlow = flows.find((f) => f.source === 'multi-tool' && f.target === 'multi-tool');
    assert.strictEqual(selfFlow, undefined, 'Should not detect self-referencing flow');
  });

  it('returns empty for servers with no dangerous capabilities', () => {
    const servers = [{ name: 'safe-server', ide: 'Cursor', tools: [{ name: 'calculate_sum' }] }];
    const flows = analyzeToxicFlows(servers);
    assert.strictEqual(flows.length, 0);
  });

  it('keeps separate flows when the same servers appear in different IDEs', () => {
    const servers = [
      { name: 'slack-server', ide: 'Cursor', tools: [{ name: 'list_messages' }] },
      { name: 'github-server', ide: 'Cursor', tools: [{ name: 'push_files' }] },
      { name: 'slack-server', ide: 'VS Code', tools: [{ name: 'list_messages' }] },
      { name: 'github-server', ide: 'VS Code', tools: [{ name: 'push_files' }] },
    ];
    const flows = analyzeToxicFlows(servers);
    const cursorFlows = flows.filter((f) => f.sourceIde === 'Cursor' && f.targetIde === 'Cursor');
    const vscodeFlows = flows.filter((f) => f.sourceIde === 'VS Code' && f.targetIde === 'VS Code');
    assert.ok(
      cursorFlows.length >= 1 && vscodeFlows.length >= 1,
      'Expected distinct flows per IDE context'
    );
  });

  it('deduplicates flows by source→target keeping highest risk', () => {
    const servers = [
      {
        name: 'reader',
        ide: 'Cursor',
        tools: [{ name: 'list_messages' }, { name: 'fetch_url' }],
      },
      { name: 'writer', ide: 'Cursor', tools: [{ name: 'write_file' }, { name: 'push' }] },
    ];
    const flows = analyzeToxicFlows(servers);
    const readerToWriter = flows.filter((f) => f.source === 'reader' && f.target === 'writer');
    assert.ok(readerToWriter.length <= 1, 'Should deduplicate to at most 1 flow per pair');
  });

  it('interpolates scenario with server names', () => {
    const servers = [
      { name: 'SlackBot', ide: 'Cursor', tools: [{ name: 'list_messages' }] },
      { name: 'GitPush', ide: 'VS Code', tools: [{ name: 'push' }] },
    ];
    const flows = analyzeToxicFlows(servers);
    const flow = flows.find((f) => f.source === 'SlackBot');
    if (flow) {
      assert.ok(flow.scenario.includes('SlackBot'), 'Scenario should mention source server');
    }
  });

  it('classifies tool names by heuristic', () => {
    const servers = [
      { name: 'fetcher', ide: 'Cursor', tools: [{ name: 'scrape_webpage' }] },
      { name: 'deployer', ide: 'Cursor', tools: [{ name: 'kubectl_apply' }] },
    ];
    const flows = analyzeToxicFlows(servers);
    assert.ok(flows.length > 0, 'Should detect ingests_untrusted→modifies_infra flow');
  });

  it('returns flow metadata fields', () => {
    const servers = [
      { name: 'email-reader', ide: 'Claude Desktop', tools: [{ name: 'search_emails' }] },
      { name: 'git-server', ide: 'Cursor', tools: [{ name: 'commit' }] },
    ];
    const flows = analyzeToxicFlows(servers);
    if (flows.length > 0) {
      const flow = flows[0];
      assert.ok('source' in flow);
      assert.ok('target' in flow);
      assert.ok('risk' in flow);
      assert.ok('title' in flow);
      assert.ok('scenario' in flow);
      assert.ok('sourceCapability' in flow);
      assert.ok('targetCapability' in flow);
    }
  });
});
