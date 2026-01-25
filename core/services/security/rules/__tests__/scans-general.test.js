import assert from 'node:assert';
import { describe, it } from 'node:test';

import * as commandInjection from '../scans/commandInjection.js';
import * as crossServerShadowing from '../scans/crossServerShadowing.js';
import * as toolNameAmbiguity from '../scans/toolNameAmbiguity.js';

describe('General Security Scan Rules', () => {
  describe('commandInjection', () => {
    it('has correct metadata', () => {
      assert.ok(commandInjection.ruleMetadata);
      assert.strictEqual(commandInjection.ruleMetadata.id, 'command-injection');
      assert.strictEqual(commandInjection.ruleMetadata.owasp_id, 'CMD-INJ');
    });

    it('detects shell command patterns', () => {
      // Uses 2 critical patterns: $(cmd) and `cmd` backticks
      const findings = commandInjection.analyzeTool({
        name: 'shell-tool',
        description: 'Runs $(whoami) and `id` to check user',
      });
      assert.ok(findings.length > 0, 'Should detect command injection');
      assert.strictEqual(findings[0].target_type, 'tool');
    });

    it('detects dangerous operators', () => {
      // Uses critical patterns: ; a and | b operators
      const findings = commandInjection.analyzeTool({
        name: 'pipe-tool',
        description: 'echo hello; rm file | grep test',
      });
      assert.ok(findings.length > 0, 'Should detect dangerous operators');
    });

    it('returns empty for safe tools', () => {
      const findings = commandInjection.analyzeTool({
        name: 'json-tool',
        description: 'Parses and formats JSON data',
      });
      assert.strictEqual(findings.length, 0);
    });

    it('analyzes packets for command injection', () => {
      const findings = commandInjection.analyzePacket({
        frameNumber: 1,
        body: { command: 'Runs $(whoami) and `id` to check user' },
      });
      assert.ok(findings.length > 0, 'Should detect command injection in packet');
      assert.strictEqual(findings[0].target_type, 'packet');
    });
  });

  describe('crossServerShadowing', () => {
    it('has correct metadata', () => {
      assert.ok(crossServerShadowing.ruleMetadata);
      assert.strictEqual(crossServerShadowing.ruleMetadata.id, 'cross-server-shadowing');
      assert.strictEqual(crossServerShadowing.ruleMetadata.owasp_id, 'SHADOW');
      assert.strictEqual(crossServerShadowing.ruleMetadata.type, 'general-security');
    });

    it('returns empty for isolated tools', () => {
      const findings = crossServerShadowing.analyzeTool({
        name: 'api-tool',
        description: 'Calls external API and returns response',
      });
      assert.strictEqual(findings.length, 0);
    });

    it('has required analyze functions', () => {
      assert.strictEqual(typeof crossServerShadowing.analyzeTool, 'function');
      assert.strictEqual(typeof crossServerShadowing.analyzePrompt, 'function');
      assert.strictEqual(typeof crossServerShadowing.analyzeResource, 'function');
      assert.strictEqual(typeof crossServerShadowing.analyzePacket, 'function');
    });
  });

  describe('toolNameAmbiguity', () => {
    it('has correct metadata', () => {
      assert.ok(toolNameAmbiguity.ruleMetadata);
      assert.strictEqual(toolNameAmbiguity.ruleMetadata.id, 'tool-name-ambiguity');
      assert.strictEqual(toolNameAmbiguity.ruleMetadata.owasp_id, 'AMBIG');
    });

    it('detects similar tool names', () => {
      // Use the raw scan function with identical names for guaranteed match
      const result = toolNameAmbiguity.scanToolNameAmbiguity({
        tools: [
          { name: 'readfile', description: 'Reads files' },
          { name: 'readFile', description: 'Also reads files' },
        ],
      });
      assert.ok(result.toolFindings.length > 0, 'Should detect ambiguous tool name');
    });

    it('returns empty for unique tools', () => {
      const allTools = [
        { name: 'processor', description: 'Processes data' },
        { name: 'analyzer', description: 'Analyzes data' },
      ];
      const findings = toolNameAmbiguity.analyzeTool(allTools[0], null, allTools);
      assert.strictEqual(findings.length, 0);
    });
  });
});
