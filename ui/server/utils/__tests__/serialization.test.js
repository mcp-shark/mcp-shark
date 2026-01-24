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

  describe('character code object sanitization (Issue #4)', () => {
    test('converts body_json character code object back to JSON string', () => {
      const originalJson = '{"result":"test","jsonrpc":"2.0","id":1}';

      // Create a character code object (the bug format)
      const characterCodeObject = {};
      [...originalJson].forEach((char, i) => {
        characterCodeObject[String(i)] = char.charCodeAt(0);
      });

      const packet = {
        frame_number: 1,
        body_json: JSON.stringify(characterCodeObject),
        body_raw: JSON.stringify(characterCodeObject),
      };

      const result = serializeBigInt(packet);

      // Should be converted back to the original JSON string
      assert.strictEqual(result.body_json, originalJson);
      assert.strictEqual(result.body_raw, originalJson);
    });

    test('preserves normal body_json strings', () => {
      const normalJson = '{"result":"test","jsonrpc":"2.0","id":1}';

      const packet = {
        frame_number: 1,
        body_json: normalJson,
        body_raw: normalJson,
      };

      const result = serializeBigInt(packet);

      assert.strictEqual(result.body_json, normalJson);
      assert.strictEqual(result.body_raw, normalJson);
    });

    test('handles null body fields', () => {
      const packet = {
        frame_number: 1,
        body_json: null,
        body_raw: null,
      };

      const result = serializeBigInt(packet);

      assert.strictEqual(result.body_json, null);
      assert.strictEqual(result.body_raw, null);
    });
  });
});
