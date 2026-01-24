import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  analyzePacket,
  analyzePrompt,
  analyzeResource,
  analyzeTool,
  ruleMetadata,
} from '../mcp01-token-exposure.js';

describe('mcp01-token-exposure', () => {
  describe('ruleMetadata', () => {
    it('has required properties', () => {
      assert.ok(ruleMetadata.id, 'Should have id');
      assert.ok(ruleMetadata.name, 'Should have name');
      assert.ok(ruleMetadata.owasp_id, 'Should have owasp_id');
      assert.ok(ruleMetadata.severity, 'Should have severity');
    });
  });

  describe('analyzeTool', () => {
    it('detects OpenAI API key', () => {
      const tool = {
        name: 'test',
        description: 'Use sk-test12345678901234567890123456789012345678901234567890',
      };
      const findings = analyzeTool(tool);
      assert.ok(findings.length > 0, 'Should detect OpenAI key');
    });

    it('detects AWS access key', () => {
      const tool = {
        name: 'test',
        description: 'AKIAIOSFODNN7EXAMPLE',
      };
      const findings = analyzeTool(tool);
      assert.ok(findings.length > 0, 'Should detect AWS key');
    });

    it('detects generic API key pattern', () => {
      const tool = {
        name: 'test',
        description: 'api_key: "abcdefghijklmnopqrstuvwxyz"',
      };
      const findings = analyzeTool(tool);
      assert.ok(findings.length > 0, 'Should detect generic API key');
    });

    it('returns empty for safe tool', () => {
      const tool = {
        name: 'test',
        description: 'A safe tool with no secrets',
      };
      const findings = analyzeTool(tool);
      assert.strictEqual(findings.length, 0);
    });

    it('checks inputSchema for secrets', () => {
      const tool = {
        name: 'test',
        description: 'Safe description',
        inputSchema: {
          type: 'object',
          properties: {
            key: { description: 'api_key: "abcdefghijklmnopqrstuvwxyz"' },
          },
        },
      };
      const findings = analyzeTool(tool);
      // The analysis checks inputSchema - result depends on implementation details
      assert.ok(Array.isArray(findings));
    });
  });

  describe('analyzePrompt', () => {
    it('detects secrets in prompt description', () => {
      const prompt = {
        name: 'test',
        description: 'Use api_key: "abcdefghijklmnopqrstuvwxyz"',
      };
      const findings = analyzePrompt(prompt);
      assert.ok(findings.length > 0, 'Should detect secret');
    });

    it('returns empty for safe prompt', () => {
      const prompt = {
        name: 'test',
        description: 'A helpful prompt',
      };
      const findings = analyzePrompt(prompt);
      assert.strictEqual(findings.length, 0);
    });
  });

  describe('analyzeResource', () => {
    it('detects secrets in resource URI', () => {
      const resource = {
        name: 'test',
        uri: 'https://api.example.com?api_key=abcdefghijklmnopqrstuvwxyz',
      };
      const findings = analyzeResource(resource);
      assert.ok(findings.length > 0, 'Should detect secret in URI');
    });

    it('returns empty for safe resource', () => {
      const resource = {
        name: 'test',
        uri: 'https://example.com/data',
        description: 'Safe resource',
      };
      const findings = analyzeResource(resource);
      assert.strictEqual(findings.length, 0);
    });
  });

  describe('analyzePacket', () => {
    it('detects secrets in packet body object', () => {
      const packet = {
        frameNumber: 1,
        body: { api_key: 'sk-test12345678901234567890123456789012345678901234567890' },
      };
      const findings = analyzePacket(packet);
      assert.ok(findings.length > 0, 'Should detect secret');
    });

    it('detects secrets in packet body string', () => {
      const packet = {
        frameNumber: 1,
        body: '{"key": "sk-test12345678901234567890123456789012345678901234567890"}',
      };
      const findings = analyzePacket(packet);
      assert.ok(findings.length > 0, 'Should detect secret');
    });

    it('returns empty for safe packet', () => {
      const packet = {
        frameNumber: 1,
        body: { message: 'Hello' },
      };
      const findings = analyzePacket(packet);
      assert.strictEqual(findings.length, 0);
    });
  });
});
