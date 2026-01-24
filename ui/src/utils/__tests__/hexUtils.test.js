import { describe, expect, it } from 'vitest';
import { createFullRequestText, generateHexDump } from '../hexUtils';

describe('hexUtils', () => {
  describe('generateHexDump', () => {
    it('returns empty array for empty input', () => {
      expect(generateHexDump('')).toEqual([]);
    });

    it('returns empty array for null input', () => {
      expect(generateHexDump(null)).toEqual([]);
    });

    it('generates hex dump for short text', () => {
      const result = generateHexDump('Hello');

      expect(result.length).toBe(1);
      expect(result[0].offset).toBe('00000000');
      expect(result[0].ascii).toBe('Hello');
    });

    it('generates hex dump for text longer than 16 bytes', () => {
      const text = 'This is a test string that is longer than 16 bytes';
      const result = generateHexDump(text);

      expect(result.length).toBeGreaterThan(1);
      expect(result[0].offset).toBe('00000000');
      expect(result[1].offset).toBe('00000010');
    });

    it('replaces non-printable characters with dots in ascii', () => {
      const text = 'Hello\x00World';
      const result = generateHexDump(text);

      expect(result[0].ascii).toContain('.');
    });
  });

  describe('createFullRequestText', () => {
    it('creates request text with headers and body', () => {
      const headers = { 'Content-Type': 'application/json' };
      const body = '{"key": "value"}';

      const result = createFullRequestText(headers, body);

      expect(result).toContain('Content-Type: application/json');
      expect(result).toContain('{"key": "value"}');
    });

    it('creates request text without body', () => {
      const headers = { Accept: 'text/plain' };

      const result = createFullRequestText(headers, '');

      expect(result).toBe('Accept: text/plain');
    });

    it('handles multiple headers', () => {
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const result = createFullRequestText(headers, '');

      expect(result).toContain('Content-Type: application/json');
      expect(result).toContain('Accept: application/json');
    });
  });
});
