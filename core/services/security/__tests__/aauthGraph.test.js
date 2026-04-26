import assert from 'node:assert';
import { describe, test } from 'node:test';
import { buildAauthGraph } from '../aauthGraph.js';

function reqPacket(frame, headers, url = 'http://api.example.com/mcp') {
  return {
    frame_number: frame,
    direction: 'request',
    method: 'POST',
    url,
    host: new URL(url).host,
    headers_json: JSON.stringify(headers),
  };
}

describe('buildAauthGraph', () => {
  test('returns an empty graph for no packets', () => {
    const g = buildAauthGraph([]);
    assert.deepStrictEqual(g.nodes, []);
    assert.deepStrictEqual(g.edges, []);
    assert.strictEqual(g.stats.observed_packets, 0);
    assert.strictEqual(g.categories.length, 5);
  });

  test('skips packets with no AAuth signal', () => {
    const g = buildAauthGraph([
      reqPacket(1, { 'content-type': 'application/json' }),
      reqPacket(2, { authorization: 'Basic abc' }),
    ]);
    assert.strictEqual(g.nodes.length, 0);
  });

  test('builds agent + mission + resource + signing nodes from a signed call', () => {
    const headers = {
      'aauth-agent': 'aauth:demo@example.dev',
      'aauth-mission': 'mission:lookup',
      signature: 'sig1=:AAAA=:',
      'signature-input': 'sig1=("@method");keyid="k1";alg="ed25519";created=1700000000',
    };
    const g = buildAauthGraph([reqPacket(7, headers, 'http://api.example.com/mcp')]);

    const byCat = (cat) => g.nodes.filter((n) => n.category === cat).map((n) => n.name);
    assert.deepStrictEqual(byCat('agent'), ['aauth:demo@example.dev']);
    assert.deepStrictEqual(byCat('mission'), ['mission:lookup']);
    assert.deepStrictEqual(byCat('resource'), ['api.example.com']);
    assert.deepStrictEqual(byCat('signing'), ['ed25519']);

    const kinds = g.edges.map((e) => e.kind).sort();
    assert.deepStrictEqual(kinds, ['calls', 'pursues', 'signs-with', 'targets']);
  });

  test('parses access mode from AAuth-Requirement', () => {
    const headers = {
      'aauth-requirement':
        'mode="ps-managed"; resource="https://api.example.com/x"; jwks_uri="https://example.com/.well-known/aauth/jwks.json"',
    };
    const g = buildAauthGraph([reqPacket(3, headers)]);
    const access = g.nodes.find((n) => n.category === 'access');
    assert.ok(access, 'access node should exist');
    assert.strictEqual(access.name, 'ps-managed');
    const requires = g.edges.find((e) => e.kind === 'requires');
    assert.ok(requires, 'requires edge should exist');
  });

  test('weights edges by repeated observations', () => {
    const headers = {
      'aauth-agent': 'aauth:repeater@example.dev',
      'aauth-mission': 'mission:repeated',
      signature: 'sig1=:X=:',
      'signature-input': 'sig1=("@method");keyid="k";alg="ed25519";created=1',
    };
    const g = buildAauthGraph([
      reqPacket(1, headers),
      reqPacket(2, headers),
      reqPacket(3, headers),
    ]);
    const calls = g.edges.find((e) => e.kind === 'calls');
    assert.strictEqual(calls.weight, 3);
    const agentNode = g.nodes.find((n) => n.category === 'agent');
    assert.strictEqual(agentNode.packet_count, 3);
    assert.strictEqual(agentNode.sample_frame_numbers.length, 3);
  });
});
