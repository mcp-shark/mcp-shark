/**
 * Local Analysis — traffic-derived toxic flow endpoints
 */

export const securityTrafficFlowsPaths = {
  '/api/security/traffic-toxic-flows': {
    get: {
      tags: ['Security'],
      summary: 'Get toxic flows from proxy traffic',
      description:
        'Returns the latest cross-server toxic-flow heuristics built from tools/list responses observed on the HTTP proxy. In-memory model; use replay to rebuild from the packet database.',
      responses: {
        200: {
          description: 'Snapshot with toxicFlows, servers, computedAt, note',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TrafficToxicFlowSnapshot' },
            },
          },
        },
        503: {
          description: 'Traffic toxic flow service unavailable',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/security/traffic-toxic-flows/replay': {
    post: {
      tags: ['Security'],
      summary: 'Replay toxic flows from stored packets',
      description:
        'Scans stored HTTP response packets for tools/list-style JSON-RPC results and rebuilds the toxic-flow registry.',
      responses: {
        200: {
          description: 'Snapshot plus replay stats (packetRows, serverCount, flowCount)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TrafficToxicFlowReplayResponse' },
            },
          },
        },
        503: {
          description: 'Traffic toxic flow service unavailable',
        },
      },
    },
  },
};
