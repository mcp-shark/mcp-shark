import assert from 'node:assert';
import { describe, test } from 'node:test';
import { serializeBigInt } from '../serialization.js';

describe('serialization', () => {
  describe('serializeBigInt', () => {
    test('converts BigInt to string', () => {
      const result = serializeBigInt(BigInt(9007199254740991));
      assert.strictEqual(result, '9007199254740991');
    });

    test('handles null', () => {
      const result = serializeBigInt(null);
      assert.strictEqual(result, null);
    });

    test('handles undefined', () => {
      const result = serializeBigInt(undefined);
      assert.strictEqual(result, undefined);
    });

    test('handles primitive types', () => {
      assert.strictEqual(serializeBigInt(42), 42);
      assert.strictEqual(serializeBigInt('hello'), 'hello');
      assert.strictEqual(serializeBigInt(true), true);
    });

    test('recursively handles arrays', () => {
      const data = [BigInt(1), BigInt(2), 'normal'];
      const result = serializeBigInt(data);

      assert.strictEqual(result[0], '1');
      assert.strictEqual(result[1], '2');
      assert.strictEqual(result[2], 'normal');
    });

    test('recursively handles objects', () => {
      const data = {
        bigValue: BigInt(123456789),
        normal: 42,
        nested: {
          anotherBig: BigInt(987654321),
        },
      };

      const result = serializeBigInt(data);

      assert.strictEqual(result.bigValue, '123456789');
      assert.strictEqual(result.normal, 42);
      assert.strictEqual(result.nested.anotherBig, '987654321');
    });
  });
});
