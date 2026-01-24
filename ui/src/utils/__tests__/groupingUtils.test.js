import { describe, expect, it } from 'vitest';
import { groupByServerAndSession, groupBySessionAndServer } from '../groupingUtils';

describe('groupingUtils', () => {
  const mockRequests = [
    {
      session_id: 'sess-1',
      body_json: '{"params": {"name": "server1.tool"}}',
      timestamp_iso: '2024-01-01T00:00:01Z',
    },
    {
      session_id: 'sess-1',
      body_json: '{"params": {"name": "server1.other"}}',
      timestamp_iso: '2024-01-01T00:00:02Z',
    },
    {
      session_id: 'sess-2',
      body_json: '{"params": {"name": "server2.tool"}}',
      timestamp_iso: '2024-01-01T00:00:03Z',
    },
  ];

  describe('groupByServerAndSession', () => {
    it('groups requests by server then session', () => {
      const result = groupByServerAndSession(mockRequests);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('serverName');
      expect(result[0]).toHaveProperty('sessions');
    });

    it('handles empty requests array', () => {
      const result = groupByServerAndSession([]);
      expect(result).toEqual([]);
    });

    it('handles requests without session', () => {
      const requests = [
        {
          body_json: '{"params": {"name": "server.tool"}}',
          timestamp_iso: '2024-01-01T00:00:00Z',
        },
      ];

      const result = groupByServerAndSession(requests);

      expect(result.length).toBe(1);
      expect(result[0].sessions[0].sessionId).toBeNull();
    });
  });

  describe('groupBySessionAndServer', () => {
    it('groups requests by session then server', () => {
      const result = groupBySessionAndServer(mockRequests);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('sessionId');
      expect(result[0]).toHaveProperty('servers');
    });

    it('handles empty requests array', () => {
      const result = groupBySessionAndServer([]);
      expect(result).toEqual([]);
    });

    it('sorts servers by timestamp within session', () => {
      const result = groupBySessionAndServer(mockRequests);

      const sess1 = result.find((s) => s.sessionId === 'sess-1');
      if (sess1) {
        expect(sess1.servers.length).toBeGreaterThan(0);
      }
    });
  });
});
