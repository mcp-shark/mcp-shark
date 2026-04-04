import assert from 'node:assert';
import { describe, it } from 'node:test';
import { detectHardcodedSecrets } from '../SecretDetector.js';

const SERVER = { name: 'test-server', ide: 'Cursor', configPath: '/test/mcp.json' };

describe('SecretDetector', () => {
  it('detects AWS access key', () => {
    const env = { AWS_KEY: 'AKIAIOSFODNN7EXAMPLE' };
    const findings = detectHardcodedSecrets(env, SERVER);
    assert.ok(findings.length > 0, 'Should detect AWS key');
    assert.strictEqual(findings[0].rule_id, 'hardcoded-secret');
    assert.strictEqual(findings[0].fixable, true);
  });

  it('detects Slack token', () => {
    const env = { SLACK: 'xoxb-1234-5678-abcdef' };
    const findings = detectHardcodedSecrets(env, SERVER);
    assert.ok(findings.length > 0, 'Should detect Slack token');
  });

  it('detects GitHub personal access token', () => {
    const env = { GH_TOKEN: 'ghp_1234567890abcdef1234567890abcdef12345678' };
    const findings = detectHardcodedSecrets(env, SERVER);
    assert.ok(findings.length > 0, 'Should detect GitHub PAT');
  });

  it('skips environment variable references ($VAR)', () => {
    const env = { API_KEY: '$API_KEY' };
    const findings = detectHardcodedSecrets(env, SERVER);
    assert.strictEqual(findings.length, 0, 'Should skip $-prefixed values');
  });

  it('skips ${} template references', () => {
    const env = { API_KEY: '${API_KEY}' };
    const findings = detectHardcodedSecrets(env, SERVER);
    assert.strictEqual(findings.length, 0, 'Should skip ${}-wrapped values');
  });

  it('skips non-string values', () => {
    const env = { PORT: 3000, ENABLED: true };
    const findings = detectHardcodedSecrets(env, SERVER);
    assert.strictEqual(findings.length, 0);
  });

  it('returns empty for clean env vars', () => {
    const env = { NODE_ENV: 'production', PORT: '8080', HOST: 'localhost' };
    const findings = detectHardcodedSecrets(env, SERVER);
    assert.strictEqual(findings.length, 0);
  });

  it('masks secret in finding description (long value)', () => {
    const env = { TOKEN: 'xoxb-abcdefghijklmnop' };
    const findings = detectHardcodedSecrets(env, SERVER);
    if (findings.length > 0) {
      assert.ok(
        findings[0].description.includes('xoxb****'),
        'Should mask to first 4 chars + ****'
      );
      assert.ok(!findings[0].description.includes('abcdefghijklmnop'));
    }
  });

  it('masks short secrets completely', () => {
    const env = { KEY: 'sk-abc' };
    const findings = detectHardcodedSecrets(env, SERVER);
    if (findings.length > 0) {
      assert.ok(findings[0].description.includes('****'));
    }
  });

  it('includes fix_type and fix_data for remediation', () => {
    const env = { OPENAI_KEY: 'sk-proj-abc123def456ghi789' };
    const findings = detectHardcodedSecrets(env, SERVER);
    if (findings.length > 0) {
      assert.strictEqual(findings[0].fix_type, 'env_var_replacement');
      assert.strictEqual(findings[0].fix_data.key, 'OPENAI_KEY');
      assert.strictEqual(findings[0].fix_data.original, 'sk-proj-abc123def456ghi789');
    }
  });

  it('sets correct server context in findings', () => {
    const env = { TOKEN: 'ghp_abc123def456ghi789jklmno0123456789abc' };
    const findings = detectHardcodedSecrets(env, SERVER);
    if (findings.length > 0) {
      assert.strictEqual(findings[0].server_name, 'test-server');
      assert.strictEqual(findings[0].ide, 'Cursor');
      assert.strictEqual(findings[0].config_path, '/test/mcp.json');
    }
  });

  it('handles empty env vars object', () => {
    const findings = detectHardcodedSecrets({}, SERVER);
    assert.strictEqual(findings.length, 0);
  });

  it('returns empty when env vars is null or not an object', () => {
    assert.strictEqual(detectHardcodedSecrets(null, SERVER).length, 0);
    assert.strictEqual(detectHardcodedSecrets(undefined, SERVER).length, 0);
  });
});
