import assert from 'node:assert';
import { describe, it } from 'node:test';
import { generateWalkthroughs } from '../WalkthroughGenerator.js';

describe('WalkthroughGenerator', () => {
  it('generates walkthrough for known ingests_untrusted→writes_code flow', () => {
    const flows = [
      {
        source: 'Slack',
        target: 'GitHub',
        sourceIde: 'Cursor',
        targetIde: 'Cursor',
        risk: 'HIGH',
        title: 'Prompt Injection → Code Push',
        owasp: 'MCP06',
        catalog: '§1.2',
        sourceCapability: 'ingests_untrusted',
        targetCapability: 'writes_code',
      },
    ];
    const walkthroughs = generateWalkthroughs(flows);
    assert.strictEqual(walkthroughs.length, 1);
    const w = walkthroughs[0];
    assert.ok(w.steps.length >= 3, 'Should have multiple attack steps');
    assert.ok(w.example, 'Should include example payload');
    assert.ok(w.realWorld, 'Should include real-world reference');
    assert.ok(w.remediation.length >= 1, 'Should include remediation steps');
    assert.strictEqual(w.source, 'Slack');
    assert.strictEqual(w.target, 'GitHub');
  });

  it('generates walkthrough for reads_secrets→sends_external flow', () => {
    const flows = [
      {
        source: 'FileSystem',
        target: 'SlackBot',
        sourceCapability: 'reads_secrets',
        targetCapability: 'sends_external',
        risk: 'HIGH',
        title: 'Secret Exfiltration',
        owasp: 'MCP01',
        catalog: '§1.1',
        sourceIde: 'Cursor',
        targetIde: 'Cursor',
      },
    ];
    const walkthroughs = generateWalkthroughs(flows);
    assert.strictEqual(walkthroughs.length, 1);
    assert.ok(walkthroughs[0].steps.length >= 3);
    assert.ok(walkthroughs[0].example);
  });

  it('generates generic walkthrough for unknown flow type', () => {
    const flows = [
      {
        source: 'ServerA',
        target: 'ServerB',
        sourceCapability: 'unknown_cap',
        targetCapability: 'another_cap',
        risk: 'LOW',
        title: 'Unknown Flow',
        owasp: 'N/A',
        sourceIde: 'Cursor',
        targetIde: 'Cursor',
      },
    ];
    const walkthroughs = generateWalkthroughs(flows);
    assert.strictEqual(walkthroughs.length, 1);
    assert.strictEqual(walkthroughs[0].example, null);
    assert.strictEqual(walkthroughs[0].realWorld, null);
    assert.ok(walkthroughs[0].steps.length >= 2);
  });

  it('returns empty array for no flows', () => {
    assert.deepStrictEqual(generateWalkthroughs([]), []);
  });

  it('personalizes steps with server names', () => {
    const flows = [
      {
        source: 'MySlack',
        target: 'MyGitHub',
        sourceCapability: 'ingests_untrusted',
        targetCapability: 'writes_code',
        risk: 'HIGH',
        title: 'Test',
        owasp: 'MCP06',
        sourceIde: 'Cursor',
        targetIde: 'VS Code',
      },
    ];
    const walkthroughs = generateWalkthroughs(flows);
    const allSteps = walkthroughs[0].steps.join(' ');
    assert.ok(allSteps.includes('MySlack'), 'Steps should reference source server name');
    assert.ok(allSteps.includes('MyGitHub'), 'Steps should reference target server name');
  });
});
