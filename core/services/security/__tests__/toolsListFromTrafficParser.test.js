import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  toolsFromJsonrpcResultString,
  toolsFromTrafficResponseBody,
} from '../toolsListFromTrafficParser.js';

describe('toolsListFromTrafficParser', () => {
  it('toolsFromTrafficResponseBody parses tools/list success', () => {
    const body = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        tools: [{ name: 'get_secret', description: 'read' }, { name: 'noop' }],
      },
    };
    const tools = toolsFromTrafficResponseBody(body);
    assert.strictEqual(tools?.length, 2);
    assert.strictEqual(tools[0].name, 'get_secret');
  });

  it('toolsFromTrafficResponseBody returns null for non-matching body', () => {
    assert.strictEqual(toolsFromTrafficResponseBody({ result: {} }), null);
    assert.strictEqual(toolsFromTrafficResponseBody(null), null);
  });

  it('toolsFromTrafficResponseBody parses JSON string body', () => {
    const str = JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      result: { tools: [{ name: 'post_message' }] },
    });
    const tools = toolsFromTrafficResponseBody(str);
    assert.strictEqual(tools?.length, 1);
    assert.strictEqual(tools[0].name, 'post_message');
  });

  it('toolsFromJsonrpcResultString reads stringified result object', () => {
    const resultStr = JSON.stringify({
      tools: [{ name: 'fetch_docs', description: 'x' }],
    });
    const tools = toolsFromJsonrpcResultString(resultStr);
    assert.strictEqual(tools?.length, 1);
    assert.strictEqual(tools[0].name, 'fetch_docs');
  });

  it('toolsFromJsonrpcResultString returns null for invalid JSON', () => {
    assert.strictEqual(toolsFromJsonrpcResultString('{not json'), null);
  });

  it('toolsFromJsonrpcResultString returns null when tools missing or empty', () => {
    assert.strictEqual(toolsFromJsonrpcResultString(JSON.stringify({})), null);
    assert.strictEqual(toolsFromJsonrpcResultString(JSON.stringify({ tools: [] })), null);
  });

  it('filters tools without usable name', () => {
    const body = {
      jsonrpc: '2.0',
      result: {
        tools: [{ name: 'ok_tool' }, { name: '' }, { description: 'no name' }, null],
      },
    };
    const tools = toolsFromTrafficResponseBody(body);
    assert.strictEqual(tools?.length, 1);
    assert.strictEqual(tools[0].name, 'ok_tool');
  });

  it('coerces non-string description to null', () => {
    const body = {
      result: {
        tools: [{ name: 't', description: 123 }],
      },
    };
    const tools = toolsFromTrafficResponseBody(body);
    assert.strictEqual(tools[0].description, null);
  });

  it('toolsFromTrafficResponseBody returns null for error responses', () => {
    const body = {
      jsonrpc: '2.0',
      error: { code: -32000, message: 'fail' },
      id: 1,
    };
    assert.strictEqual(toolsFromTrafficResponseBody(body), null);
  });
});
