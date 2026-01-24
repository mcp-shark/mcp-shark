import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';
import { SerializationLibrary } from '../SerializationLibrary.js';

describe('SerializationLibrary', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.lib = new SerializationLibrary();
  });

  describe('serializeBigInt', () => {
    test('converts BigInt to string', () => {
      const result = ctx.lib.serializeBigInt(BigInt(9007199254740991));
      assert.strictEqual(result, '9007199254740991');
    });

    test('handles null', () => {
      const result = ctx.lib.serializeBigInt(null);
      assert.strictEqual(result, null);
    });

    test('handles undefined', () => {
      const result = ctx.lib.serializeBigInt(undefined);
      assert.strictEqual(result, undefined);
    });

    test('handles primitive types', () => {
      assert.strictEqual(ctx.lib.serializeBigInt(42), 42);
      assert.strictEqual(ctx.lib.serializeBigInt('hello'), 'hello');
      assert.strictEqual(ctx.lib.serializeBigInt(true), true);
    });

    test('recursively handles arrays', () => {
      const data = [BigInt(1), BigInt(2), 'normal'];
      const result = ctx.lib.serializeBigInt(data);

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

      const result = ctx.lib.serializeBigInt(data);

      assert.strictEqual(result.bigValue, '123456789');
      assert.strictEqual(result.normal, 42);
      assert.strictEqual(result.nested.anotherBig, '987654321');
    });

    test('handles mixed nested structures', () => {
      const data = {
        array: [BigInt(1), { value: BigInt(2) }],
        object: { arr: [BigInt(3)] },
      };

      const result = ctx.lib.serializeBigInt(data);

      assert.strictEqual(result.array[0], '1');
      assert.strictEqual(result.array[1].value, '2');
      assert.strictEqual(result.object.arr[0], '3');
    });
  });
});
