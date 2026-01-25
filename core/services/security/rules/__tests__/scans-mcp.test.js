import assert from 'node:assert';
import { describe, it } from 'node:test';

import * as mcp02 from '../scans/mcp02ScopeCreep.js';
import * as mcp04 from '../scans/mcp04SupplyChain.js';
import * as mcp05 from '../scans/mcp05CommandInjection.js';
import * as mcp07 from '../scans/mcp07InsufficientAuth.js';
import * as mcp08 from '../scans/mcp08LackAudit.js';
import * as mcp09 from '../scans/mcp09ShadowServers.js';
import * as mcp10 from '../scans/mcp10ContextInjection.js';

describe('MCP Scan Rules', () => {
  describe('mcp02ScopeCreep', () => {
    it('has correct metadata', () => {
      assert.ok(mcp02.ruleMetadata);
      assert.strictEqual(mcp02.ruleMetadata.id, 'mcp02-scope-creep');
      assert.strictEqual(mcp02.ruleMetadata.owasp_id, 'MCP02');
    });

    it('detects scope expansion patterns', () => {
      const findings = mcp02.analyzeTool({
        name: 'test-tool',
        description: 'This tool can expand scope and increase permissions for the user',
      });
      assert.ok(findings.length > 0, 'Should detect scope creep');
    });

    it('detects privilege escalation patterns', () => {
      const findings = mcp02.analyzeTool({
        name: 'escalate-tool',
        description: 'Escalate privilege to get full access to all resources',
      });
      assert.ok(findings.length > 0, 'Should detect privilege escalation');
    });

    it('returns empty for safe tools', () => {
      const findings = mcp02.analyzeTool({
        name: 'safe-tool',
        description: 'A tool that processes user data securely',
      });
      assert.strictEqual(findings.length, 0);
    });

    it('analyzes packets', () => {
      const findings = mcp02.analyzePacket({
        frameNumber: 1,
        body: { message: 'Request to bypass restriction' },
      });
      assert.ok(findings.length > 0);
      assert.strictEqual(findings[0].target_type, 'packet');
    });
  });

  describe('mcp04SupplyChain', () => {
    it('has correct metadata', () => {
      assert.ok(mcp04.ruleMetadata);
      assert.strictEqual(mcp04.ruleMetadata.id, 'mcp04-supply-chain');
      assert.strictEqual(mcp04.ruleMetadata.owasp_id, 'MCP04');
    });

    it('detects unsigned package patterns', () => {
      const findings = mcp04.analyzeTool({
        name: 'pkg-tool',
        description: 'Loads unsigned package from external source',
      });
      assert.ok(findings.length > 0, 'Should detect unsigned package');
    });

    it('detects dependency confusion', () => {
      const findings = mcp04.analyzeTool({
        name: 'confused-tool',
        description: 'Handles dependency confusion attack vectors',
      });
      assert.ok(findings.length > 0, 'Should detect dependency confusion');
    });

    it('returns empty for secure dependencies', () => {
      const findings = mcp04.analyzeTool({
        name: 'secure-tool',
        description: 'Uses verified packages from npm registry',
      });
      assert.strictEqual(findings.length, 0);
    });
  });

  describe('mcp05CommandInjection', () => {
    it('has correct metadata', () => {
      assert.ok(mcp05.ruleMetadata);
      assert.strictEqual(mcp05.ruleMetadata.id, 'mcp05-command-injection');
      assert.strictEqual(mcp05.ruleMetadata.owasp_id, 'MCP05');
      assert.strictEqual(mcp05.ruleMetadata.severity, 'critical');
    });

    it('detects command injection patterns', () => {
      // Uses 2 critical patterns: $(cmd) and `cmd` backticks
      const findings = mcp05.analyzeTool({
        name: 'shell-tool',
        description: 'Runs $(whoami) and `id` to check user',
      });
      assert.ok(findings.length > 0, 'Should detect command injection');
    });

    it('returns empty for safe tools', () => {
      const findings = mcp05.analyzeTool({
        name: 'data-tool',
        description: 'Processes JSON data and returns formatted output',
      });
      assert.strictEqual(findings.length, 0);
    });
  });

  describe('mcp07InsufficientAuth', () => {
    it('has correct metadata', () => {
      assert.ok(mcp07.ruleMetadata);
      assert.strictEqual(mcp07.ruleMetadata.id, 'mcp07-insufficient-auth');
      assert.strictEqual(mcp07.ruleMetadata.owasp_id, 'MCP07');
    });

    it('detects missing authentication', () => {
      const findings = mcp07.analyzeTool({
        name: 'public-tool',
        description: 'Public access endpoint with no authentication required',
      });
      assert.ok(findings.length > 0, 'Should detect missing auth');
    });

    it('detects bypass patterns', () => {
      const findings = mcp07.analyzeTool({
        name: 'bypass-tool',
        description: 'Skip authentication check for admin users',
      });
      assert.ok(findings.length > 0, 'Should detect auth bypass');
    });

    it('returns empty for authenticated tools', () => {
      const findings = mcp07.analyzeTool({
        name: 'secure-tool',
        description: 'Requires OAuth2 token for all requests',
      });
      assert.strictEqual(findings.length, 0);
    });
  });

  describe('mcp08LackAudit', () => {
    it('has correct metadata', () => {
      assert.ok(mcp08.ruleMetadata);
      assert.strictEqual(mcp08.ruleMetadata.id, 'mcp08-lack-audit');
      assert.strictEqual(mcp08.ruleMetadata.owasp_id, 'MCP08');
    });

    it('detects missing logging', () => {
      const findings = mcp08.analyzeTool({
        name: 'quiet-tool',
        description: 'Operates in silent mode with no logging',
      });
      assert.ok(findings.length > 0, 'Should detect lack of audit');
    });

    it('detects disabled telemetry', () => {
      const findings = mcp08.analyzeTool({
        name: 'hidden-tool',
        description: 'Disable logging for sensitive operations',
      });
      assert.ok(findings.length > 0, 'Should detect disabled logging');
    });

    it('returns empty for audited tools', () => {
      const findings = mcp08.analyzeTool({
        name: 'logged-tool',
        description: 'All operations are recorded in audit log',
      });
      assert.strictEqual(findings.length, 0);
    });
  });

  describe('mcp09ShadowServers', () => {
    it('has correct metadata', () => {
      assert.ok(mcp09.ruleMetadata);
      assert.strictEqual(mcp09.ruleMetadata.id, 'mcp09-shadow-servers');
      assert.strictEqual(mcp09.ruleMetadata.owasp_id, 'MCP09');
    });

    it('detects unauthorized servers', () => {
      const findings = mcp09.analyzeTool({
        name: 'rogue-tool',
        description: 'Connects to shadow server for data exfiltration',
      });
      assert.ok(findings.length > 0, 'Should detect shadow server');
    });

    it('detects bypass governance', () => {
      const findings = mcp09.analyzeTool({
        name: 'bypass-tool',
        description: 'Bypass approval process for quick deployment',
      });
      assert.ok(findings.length > 0, 'Should detect governance bypass');
    });

    it('returns empty for approved servers', () => {
      const findings = mcp09.analyzeTool({
        name: 'approved-tool',
        description: 'Connects to production API server',
      });
      assert.strictEqual(findings.length, 0);
    });
  });

  describe('mcp10ContextInjection', () => {
    it('has correct metadata', () => {
      assert.ok(mcp10.ruleMetadata);
      assert.strictEqual(mcp10.ruleMetadata.id, 'mcp10-context-injection');
      assert.strictEqual(mcp10.ruleMetadata.owasp_id, 'MCP10');
    });

    it('detects context over-sharing', () => {
      const findings = mcp10.analyzeTool({
        name: 'share-tool',
        description: 'Share all context and information with external services',
      });
      assert.ok(findings.length > 0, 'Should detect context over-sharing');
    });

    it('detects context injection', () => {
      const findings = mcp10.analyzePrompt({
        name: 'inject-prompt',
        description: 'Inject context into the system prompt area',
      });
      assert.ok(findings.length > 0, 'Should detect context injection');
    });

    it('returns empty for isolated contexts', () => {
      const findings = mcp10.analyzeTool({
        name: 'isolated-tool',
        description: 'Processes data in isolated environment',
      });
      assert.strictEqual(findings.length, 0);
    });
  });
});
