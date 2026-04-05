import assert from 'node:assert';
import { createServer } from 'node:http';
import { after, before, describe, it } from 'node:test';
import express from 'express';

import { DependencyContainer } from '#core';
import { initDb } from '#core/db/init.js';
import { createSecurityRoutes } from '#ui/server/routes/security.js';

function listen(app) {
  return new Promise((resolve, reject) => {
    const server = createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : null;
      if (port == null) {
        reject(new Error('No listen port'));
        return;
      }
      resolve({ server, port });
    });
    server.on('error', reject);
  });
}

describe('traffic-toxic-flows HTTP routes', () => {
  let server;
  let baseUrl;

  before(async () => {
    const db = initDb(':memory:');
    const container = new DependencyContainer(db);
    const securityRoutes = createSecurityRoutes(container);
    const app = express();
    app.use(express.json());
    app.get('/api/security/traffic-toxic-flows', securityRoutes.getTrafficToxicFlows);
    app.post('/api/security/traffic-toxic-flows/replay', securityRoutes.replayTrafficToxicFlows);
    const { server: s, port } = await listen(app);
    server = s;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  it('GET /api/security/traffic-toxic-flows returns snapshot shape', async () => {
    const res = await fetch(`${baseUrl}/api/security/traffic-toxic-flows`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.toxicFlows));
    assert.ok(Array.isArray(body.servers));
    assert.strictEqual(typeof body.note, 'string');
  });

  it('POST /api/security/traffic-toxic-flows/replay returns snapshot and replay stats', async () => {
    const res = await fetch(`${baseUrl}/api/security/traffic-toxic-flows/replay`, {
      method: 'POST',
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.replay);
    assert.strictEqual(typeof body.replay.packetRows, 'number');
    assert.strictEqual(typeof body.replay.serverCount, 'number');
    assert.strictEqual(typeof body.replay.flowCount, 'number');
  });
});
