import assert from 'node:assert';
import { describe, it } from 'node:test';
import { mergeClassifications } from '../ToolClassifications.js';

describe('ToolClassifications', () => {
  describe('mergeClassifications', () => {
    it('merges new server entries from overrides', () => {
      const merged = mergeClassifications(
        { alpha: { t1: 'reads_secrets' } },
        { beta: { t2: 'writes_code' } }
      );
      assert.strictEqual(merged.alpha.t1, 'reads_secrets');
      assert.strictEqual(merged.beta.t2, 'writes_code');
    });

    it('extends existing server tool maps', () => {
      const merged = mergeClassifications(
        { srv: { a: 'reads_secrets' } },
        { srv: { b: 'writes_code' } }
      );
      assert.strictEqual(merged.srv.a, 'reads_secrets');
      assert.strictEqual(merged.srv.b, 'writes_code');
    });

    it('ignores unsafe server keys', () => {
      const merged = mergeClassifications(
        { safe: { x: 'reads_secrets' } },
        {
          __proto__: { polluted: 'writes_code' },
          constructor: { c: 'writes_code' },
          prototype: { p: 'writes_code' },
        }
      );
      assert.strictEqual(merged.safe.x, 'reads_secrets');
      assert.strictEqual(merged.__proto__, Object.prototype);
      assert.strictEqual('polluted' in merged, false);
    });

    it('strips unsafe keys from override tool maps', () => {
      const merged = mergeClassifications(
        {},
        {
          srv: {
            ok: 'reads_secrets',
            __proto__: 'writes_code',
            constructor: 'writes_code',
          },
        }
      );
      assert.strictEqual(merged.srv.ok, 'reads_secrets');
      assert.strictEqual(Object.hasOwn(merged.srv, '__proto__'), false);
      assert.strictEqual(Object.hasOwn(merged.srv, 'constructor'), false);
    });

    it('skips non-object override entries', () => {
      const merged = mergeClassifications(
        { keep: { x: 'reads_secrets' } },
        { bad: null, also: ['array'], keep: { y: 'writes_code' } }
      );
      assert.strictEqual(merged.keep.x, 'reads_secrets');
      assert.strictEqual(merged.keep.y, 'writes_code');
    });
  });
});
