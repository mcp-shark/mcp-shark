import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  extractAgentId,
  inspectServerConfigForAauth,
  parseAauthForPacket,
  parseAauthHeaders,
  summarizeAauth,
} from '../aauthParser.js';

describe('parseAauthHeaders', () => {
  test('returns posture=none for null/undefined input', () => {
    assert.strictEqual(parseAauthHeaders(null).posture, 'none');
    assert.strictEqual(parseAauthHeaders(undefined).posture, 'none');
    assert.strictEqual(parseAauthHeaders({}).posture, 'none');
    assert.strictEqual(parseAauthHeaders('not an object').posture, 'none');
  });

  test('detects bearer posture from Authorization header', () => {
    const out = parseAauthHeaders({ authorization: 'Bearer abc.def.ghi' });
    assert.strictEqual(out.posture, 'bearer');
    assert.strictEqual(out.sig_present, false);
  });

  test('detects aauth-aware posture from AAuth-Agent header alone', () => {
    const out = parseAauthHeaders({ 'AAuth-Agent': 'aauth:bot@example.com' });
    assert.strictEqual(out.posture, 'aauth-aware');
    assert.strictEqual(out.agent, 'aauth:bot@example.com');
  });

  test('detects signed posture when both Signature and Signature-Input present', () => {
    const out = parseAauthHeaders({
      Signature: 'sig1=:abc==:',
      'Signature-Input':
        'sig1=("@method" "@target-uri");keyid="kid-1";alg="ed25519";created=1700000000',
      'AAuth-Agent': 'aauth:bot@example.com',
    });
    assert.strictEqual(out.posture, 'signed');
    assert.strictEqual(out.sig_present, true);
    assert.strictEqual(out.sig_alg, 'ed25519');
    assert.strictEqual(out.sig_keyid, 'kid-1');
    assert.deepStrictEqual(out.sig_covered, ['@method', '@target-uri']);
    assert.strictEqual(out.agent, 'aauth:bot@example.com');
  });

  test('extracts agent id from Signature-Key header when AAuth-Agent absent', () => {
    const out = parseAauthHeaders({
      'Signature-Key': 'aauth:agent-2@cool.dev:base64thumbprint==',
    });
    assert.strictEqual(out.agent, 'aauth:agent-2@cool.dev');
    assert.strictEqual(out.posture, 'aauth-aware');
  });

  test('captures requirement on AAuth challenge response', () => {
    const out = parseAauthHeaders({
      'AAuth-Requirement': 'mode="ps-managed"; resource="https://api.example.com"',
    });
    assert.strictEqual(out.requirement.includes('ps-managed'), true);
    assert.strictEqual(out.posture, 'aauth-aware');
  });

  test('header keys are matched case-insensitively', () => {
    const out = parseAauthHeaders({
      AUTHORIZATION: 'Bearer something',
      'aauth-mission': 'mission-42',
    });
    assert.strictEqual(out.mission, 'mission-42');
    assert.strictEqual(out.posture, 'aauth-aware');
  });

  test('shortened key fingerprints are stable for long values', () => {
    const long = 'a'.repeat(200);
    const out = parseAauthHeaders({ 'Signature-Key': long });
    assert.ok(out.key_thumbprint_short);
    assert.ok(out.key_thumbprint_short.length < long.length);
  });
});

describe('parseAauthForPacket', () => {
  test('reads headers_json string transparently', () => {
    const packet = {
      headers_json: JSON.stringify({ 'AAuth-Agent': 'aauth:p@x.io' }),
    };
    const out = parseAauthForPacket(packet);
    assert.strictEqual(out.agent, 'aauth:p@x.io');
  });

  test('tolerates malformed headers_json', () => {
    const out = parseAauthForPacket({ headers_json: '{not-json' });
    assert.strictEqual(out.posture, 'none');
  });
});

describe('summarizeAauth', () => {
  test('counts postures and unique agents/missions', () => {
    const packets = [
      { headers_json: JSON.stringify({ Authorization: 'Bearer x' }) },
      { headers_json: JSON.stringify({ 'AAuth-Agent': 'aauth:a@z.dev', 'AAuth-Mission': 'm1' }) },
      {
        headers_json: JSON.stringify({
          Signature: 'sig1=:x==:',
          'Signature-Input': 'sig1=("@method");alg="ed25519";keyid="k"',
          'AAuth-Agent': 'aauth:a@z.dev',
          'AAuth-Mission': 'm1',
        }),
      },
      { headers_json: JSON.stringify({}) },
    ];
    const out = summarizeAauth(packets);
    assert.strictEqual(out.total, 4);
    assert.strictEqual(out.counts.bearer, 1);
    assert.strictEqual(out.counts['aauth-aware'], 1);
    assert.strictEqual(out.counts.signed, 1);
    assert.strictEqual(out.counts.none, 1);
    assert.deepStrictEqual(out.unique_agents, ['aauth:a@z.dev']);
    assert.deepStrictEqual(out.unique_missions, ['m1']);
  });
});

describe('extractAgentId', () => {
  test('matches the AAuth agent id format', () => {
    assert.strictEqual(extractAgentId('aauth:bot@example.dev'), 'aauth:bot@example.dev');
    assert.strictEqual(
      extractAgentId('prefix aauth:a-1.b@x-y.z.io suffix'),
      'aauth:a-1.b@x-y.z.io'
    );
  });

  test('returns null on non-strings and non-matches', () => {
    assert.strictEqual(extractAgentId(null), null);
    assert.strictEqual(extractAgentId(123), null);
    assert.strictEqual(extractAgentId('no agent here'), null);
  });
});

describe('inspectServerConfigForAauth', () => {
  test('returns null when no AAuth signal', () => {
    assert.strictEqual(inspectServerConfigForAauth({ command: 'node', args: [] }), null);
    assert.strictEqual(inspectServerConfigForAauth(null), null);
  });

  test('finds agent id in nested config', () => {
    const cfg = { url: 'https://x.dev', meta: { aauth_id: 'aauth:srv@x.dev' } };
    const out = inspectServerConfigForAauth(cfg);
    assert.strictEqual(out.agent, 'aauth:srv@x.dev');
  });

  test('finds well-known and jwks urls', () => {
    const cfg = {
      url: 'https://api.example.com/mcp',
      well_known: 'https://example.com/.well-known/aauth',
      jwks: 'https://example.com/jwks.json',
    };
    const out = inspectServerConfigForAauth(cfg);
    assert.ok(out.well_known_url.includes('.well-known/aauth'));
    assert.ok(out.jwks_url.includes('jwks'));
  });
});
