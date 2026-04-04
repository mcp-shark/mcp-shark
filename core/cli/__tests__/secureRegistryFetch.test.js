import assert from 'node:assert';
import { createHash } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import {
  assertAllowedRegistryUrl,
  assertSafePackId,
  assertSha256,
} from '../secureRegistryFetch.js';

describe('secureRegistryFetch', () => {
  describe('assertAllowedRegistryUrl', () => {
    it('accepts https URLs without credentials', () => {
      assert.strictEqual(
        assertAllowedRegistryUrl('https://example.com/path/manifest.json'),
        'https://example.com/path/manifest.json'
      );
    });

    it('rejects file URLs', () => {
      assert.throws(() => assertAllowedRegistryUrl('file:///etc/passwd'), /HTTPS/);
    });

    it('rejects javascript URLs', () => {
      assert.throws(() => assertAllowedRegistryUrl('javascript:alert(1)'), /Invalid URL|HTTPS/);
    });

    it('rejects http without env flag', () => {
      assert.throws(() => assertAllowedRegistryUrl('http://internal.corp/rules.json'), /HTTPS/);
    });

    it('rejects URLs with embedded credentials', () => {
      assert.throws(
        () => assertAllowedRegistryUrl('https://user:pass@example.com/x'),
        /credentials/
      );
    });
  });

  describe('with MCP_SHARK_INSECURE_HTTP_REGISTRY', () => {
    before(() => {
      process.env.MCP_SHARK_INSECURE_HTTP_REGISTRY = '1';
    });

    after(() => {
      process.env.MCP_SHARK_INSECURE_HTTP_REGISTRY = undefined;
    });

    it('allows http when explicitly opted in', () => {
      assert.ok(assertAllowedRegistryUrl('http://127.0.0.1:8080/manifest.json'));
    });
  });

  describe('assertSafePackId', () => {
    it('accepts safe ids', () => {
      assertSafePackId('owasp-mcp-2026');
      assertSafePackId('pack.v2');
    });

    it('rejects path segments', () => {
      assert.throws(() => assertSafePackId('../evil'), /Pack id/);
      assert.throws(() => assertSafePackId('a/b'), /Pack id/);
    });

    it('rejects empty', () => {
      assert.throws(() => assertSafePackId(''), /Pack id/);
    });
  });

  describe('assertSha256', () => {
    it('no-ops when expected is missing', () => {
      assert.doesNotThrow(() => assertSha256('', 'hello'));
      assert.doesNotThrow(() => assertSha256(undefined, 'hello'));
    });

    it('accepts matching hash', () => {
      const body = '{"x":1}';
      const hash = createHash('sha256').update(body, 'utf8').digest('hex');
      assert.doesNotThrow(() => assertSha256(hash, body));
    });

    it('rejects wrong hash', () => {
      const body = '{"x":1}';
      const wrong = 'a'.repeat(64);
      assert.throws(() => assertSha256(wrong, body), /SHA-256/);
    });

    it('rejects malformed hex', () => {
      assert.throws(() => assertSha256('not-hex', 'x'), /sha256 format/);
    });
  });
});
