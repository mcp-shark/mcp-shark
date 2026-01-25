import assert from 'node:assert';
import { describe, it } from 'node:test';

import * as asi02 from '../scans/agentic02ToolMisuse.js';
import * as asi03 from '../scans/agentic03IdentityAbuse.js';
import * as asi04 from '../scans/agentic04SupplyChain.js';
import * as asi05 from '../scans/agentic05RCE.js';
import * as asi06 from '../scans/agentic06MemoryPoisoning.js';
import * as asi07 from '../scans/agentic07InsecureCommunication.js';
import * as asi08 from '../scans/agentic08CascadingFailures.js';
import * as asi09 from '../scans/agentic09TrustExploitation.js';
import * as asi10 from '../scans/agentic10RogueAgent.js';

describe('Agentic Security Scan Rules', () => {
  describe('agentic02ToolMisuse', () => {
    it('has correct metadata', () => {
      assert.ok(asi02.ruleMetadata);
      assert.strictEqual(asi02.ruleMetadata.id, 'asi02-tool-misuse');
      assert.strictEqual(asi02.ruleMetadata.owasp_id, 'ASI02');
      assert.strictEqual(asi02.ruleMetadata.type, 'agentic-security');
    });

    it('detects tool misuse patterns', () => {
      const findings = asi02.analyzeTool({
        name: 'abuse-tool',
        description: 'Can misuse tool capabilities for unauthorized access',
      });
      assert.ok(findings.length > 0, 'Should detect tool misuse');
    });

    it('returns empty for proper tool usage', () => {
      const findings = asi02.analyzeTool({
        name: 'normal-tool',
        description: 'Standard data processing tool',
      });
      assert.strictEqual(findings.length, 0);
    });
  });

  describe('agentic03IdentityAbuse', () => {
    it('has correct metadata', () => {
      assert.ok(asi03.ruleMetadata);
      assert.strictEqual(asi03.ruleMetadata.id, 'asi03-identity-abuse');
      assert.strictEqual(asi03.ruleMetadata.owasp_id, 'ASI03');
    });

    it('detects identity abuse patterns', () => {
      const findings = asi03.analyzeTool({
        name: 'abuse-tool',
        description: 'Abuse identity to escalate privilege for admin access',
      });
      assert.ok(findings.length > 0, 'Should detect identity abuse');
    });

    it('returns empty for normal identity handling', () => {
      const findings = asi03.analyzeTool({
        name: 'auth-tool',
        description: 'Validates user credentials securely',
      });
      assert.strictEqual(findings.length, 0);
    });
  });

  describe('agentic04SupplyChain', () => {
    it('has correct metadata', () => {
      assert.ok(asi04.ruleMetadata);
      assert.strictEqual(asi04.ruleMetadata.id, 'asi04-supply-chain');
      assert.strictEqual(asi04.ruleMetadata.owasp_id, 'ASI04');
    });

    it('detects compromised agent patterns', () => {
      const findings = asi04.analyzeTool({
        name: 'agent-tool',
        description: 'Loads untrusted agent from external repository',
      });
      assert.ok(findings.length > 0, 'Should detect supply chain issues');
    });
  });

  describe('agentic05RCE', () => {
    it('has correct metadata', () => {
      assert.ok(asi05.ruleMetadata);
      assert.strictEqual(asi05.ruleMetadata.id, 'asi05-rce');
      assert.strictEqual(asi05.ruleMetadata.owasp_id, 'ASI05');
    });

    it('detects code execution patterns', () => {
      // Uses 2 critical patterns: $(cmd) and `cmd` backticks
      const findings = asi05.analyzeTool({
        name: 'exec-tool',
        description: 'Runs $(whoami) and `id` to check user',
      });
      assert.ok(findings.length > 0, 'Should detect RCE');
    });

    it('returns empty for safe execution', () => {
      const findings = asi05.analyzeTool({
        name: 'safe-tool',
        description: 'Runs predefined queries safely',
      });
      assert.strictEqual(findings.length, 0);
    });
  });

  describe('agentic06MemoryPoisoning', () => {
    it('has correct metadata', () => {
      assert.ok(asi06.ruleMetadata);
      assert.strictEqual(asi06.ruleMetadata.id, 'asi06-memory-poisoning');
      assert.strictEqual(asi06.ruleMetadata.owasp_id, 'ASI06');
    });

    it('detects memory manipulation', () => {
      const findings = asi06.analyzeTool({
        name: 'memory-tool',
        description: 'Can poison memory or manipulate agent state',
      });
      assert.ok(findings.length > 0, 'Should detect memory poisoning');
    });
  });

  describe('agentic07InsecureCommunication', () => {
    it('has correct metadata', () => {
      assert.ok(asi07.ruleMetadata);
      assert.strictEqual(asi07.ruleMetadata.id, 'asi07-insecure-communication');
      assert.strictEqual(asi07.ruleMetadata.owasp_id, 'ASI07');
    });

    it('detects unencrypted communication', () => {
      const findings = asi07.analyzeTool({
        name: 'http-tool',
        description: 'Sends data over unencrypted communication channel without TLS',
      });
      assert.ok(findings.length > 0, 'Should detect insecure communication');
    });

    it('returns empty for encrypted communication', () => {
      const findings = asi07.analyzeTool({
        name: 'https-tool',
        description: 'Connects securely to the API server',
      });
      assert.strictEqual(findings.length, 0);
    });
  });

  describe('agentic08CascadingFailures', () => {
    it('has correct metadata', () => {
      assert.ok(asi08.ruleMetadata);
      assert.strictEqual(asi08.ruleMetadata.id, 'asi08-cascading-failures');
      assert.strictEqual(asi08.ruleMetadata.owasp_id, 'ASI08');
    });

    it('detects cascading failure patterns', () => {
      const findings = asi08.analyzeTool({
        name: 'chain-tool',
        description: 'Failure in this tool causes cascading failures across system',
      });
      assert.ok(findings.length > 0, 'Should detect cascading failures');
    });
  });

  describe('agentic09TrustExploitation', () => {
    it('has correct metadata', () => {
      assert.ok(asi09.ruleMetadata);
      assert.strictEqual(asi09.ruleMetadata.id, 'asi09-trust-exploitation');
      assert.strictEqual(asi09.ruleMetadata.owasp_id, 'ASI09');
    });

    it('detects trust exploitation', () => {
      const findings = asi09.analyzeTool({
        name: 'trust-tool',
        description: 'Exploit trust relationship to gain access',
      });
      assert.ok(findings.length > 0, 'Should detect trust exploitation');
    });
  });

  describe('agentic10RogueAgent', () => {
    it('has correct metadata', () => {
      assert.ok(asi10.ruleMetadata);
      assert.strictEqual(asi10.ruleMetadata.id, 'asi10-rogue-agent');
      assert.strictEqual(asi10.ruleMetadata.owasp_id, 'ASI10');
    });

    it('detects rogue agent patterns', () => {
      const findings = asi10.analyzeTool({
        name: 'rogue-tool',
        description: 'This rogue agent can act maliciously',
      });
      assert.ok(findings.length > 0, 'Should detect rogue agent');
    });

    it('returns empty for normal agents', () => {
      const findings = asi10.analyzeTool({
        name: 'helper-tool',
        description: 'Assists users with their tasks',
      });
      assert.strictEqual(findings.length, 0);
    });
  });
});
