import { Defaults } from '#core/constants/Defaults.js';
import { StatusCodes } from '#core/constants/StatusCodes.js';
import { RequestFilters } from '#core/models/RequestFilters.js';
import { buildAauthGraph } from '#core/services/security/aauthGraph.js';
import { parseAauthForPacket, summarizeAauth } from '#core/services/security/aauthParser.js';
import { detectHttpUpstreams, runAauthSelfTest } from '#core/services/security/aauthSelfTest.js';

/**
 * Controller for AAuth-visibility HTTP endpoints.
 *
 * Every response describes what was OBSERVED on the wire. Nothing is
 * cryptographically verified by mcp-shark.
 */
export class AauthController {
  constructor(requestService, auditService, logger) {
    this.requestService = requestService;
    this.auditService = auditService;
    this.logger = logger;
  }

  /**
   * GET /api/aauth/posture
   * Summary of AAuth posture across captured traffic.
   */
  getPosture(_req, res) {
    try {
      const filters = new RequestFilters({
        limit: Defaults.EXPORT_LIMIT,
        offset: Defaults.DEFAULT_OFFSET,
      });
      const packets = this.requestService.getRequests(filters);
      const summary = summarizeAauth(packets);
      const total = summary.total || 0;
      const signedRatio = total > 0 ? summary.counts.signed / total : 0;

      res.json({
        observed: true,
        verified: false,
        total_packets: total,
        counts: summary.counts,
        signed_ratio: signedRatio,
        unique_agents: summary.unique_agents,
        unique_missions: summary.unique_missions,
        note: 'mcp-shark records AAuth signals as observed only. No signature verification is performed.',
      });
    } catch (error) {
      this.logger.error({ error: error.message }, 'Error in AAuth posture');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to compute AAuth posture',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/aauth/missions
   * List unique mission IDs observed, with packet counts and time spans.
   */
  getMissions(_req, res) {
    try {
      const filters = new RequestFilters({
        limit: Defaults.EXPORT_LIMIT,
        offset: Defaults.DEFAULT_OFFSET,
      });
      const packets = this.requestService.getRequests(filters);
      const missions = new Map();

      for (const p of packets) {
        const mission = p?.aauth?.mission;
        if (!mission) {
          continue;
        }
        const existing = missions.get(mission) || {
          mission_id: mission,
          packet_count: 0,
          first_frame: p.frame_number,
          last_frame: p.frame_number,
          first_ts_iso: p.timestamp_iso,
          last_ts_iso: p.timestamp_iso,
          agents: new Set(),
          servers: new Set(),
        };
        existing.packet_count += 1;
        if (p.frame_number < existing.first_frame) {
          existing.first_frame = p.frame_number;
          existing.first_ts_iso = p.timestamp_iso;
        }
        if (p.frame_number > existing.last_frame) {
          existing.last_frame = p.frame_number;
          existing.last_ts_iso = p.timestamp_iso;
        }
        if (p.aauth?.agent) {
          existing.agents.add(p.aauth.agent);
        }
        if (p.remote_address) {
          existing.servers.add(p.remote_address);
        }
        missions.set(mission, existing);
      }

      const result = [...missions.values()].map((m) => ({
        ...m,
        agents: [...m.agents],
        servers: [...m.servers],
      }));

      res.json({ observed: true, verified: false, missions: result });
    } catch (error) {
      this.logger.error({ error: error.message }, 'Error in AAuth missions');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to compute AAuth missions',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/aauth/graph
   * Knowledge-graph of AAuth signals observed across captured traffic.
   *
   * Returns nodes (agents, missions, resources, signing algs, access modes)
   * and edges (calls, pursues, targets, signs-with, requires) plus a
   * categories list. Suitable for direct rendering in a force-layout.
   */
  getGraph(_req, res) {
    try {
      const filters = new RequestFilters({
        limit: Defaults.EXPORT_LIMIT,
        offset: Defaults.DEFAULT_OFFSET,
      });
      const packets = this.requestService.getRequests(filters);
      const graph = buildAauthGraph(packets);
      res.json({ observed: true, verified: false, ...graph });
    } catch (error) {
      this.logger.error({ error: error.message }, 'Error building AAuth graph');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to build AAuth graph',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/aauth/upstreams
   * Lists the HTTP MCP upstreams currently configured for mcp-shark — used by
   * the UI to show "we'll target N detected upstreams" before running a self
   * test.
   */
  getUpstreams(_req, res) {
    try {
      const upstreams = detectHttpUpstreams();
      res.json({ count: upstreams.length, upstreams });
    } catch (error) {
      this.logger.error({ error: error.message }, 'Error reading mcp-shark upstreams');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to read upstreams',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/aauth/node/:category/:id
   * Returns the recently observed packets backing a single graph node.
   * This is what powers the "node detail" side panel on the AAuth Explorer.
   */
  getNodePackets(req, res) {
    try {
      const { category, id } = req.params;
      if (!category || !id) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'category and id are required' });
        return;
      }
      const decodedId = decodeURIComponent(id);
      const filters = new RequestFilters({
        limit: Defaults.EXPORT_LIMIT,
        offset: Defaults.DEFAULT_OFFSET,
      });
      const packets = this.requestService.getRequests(filters);

      const matching = [];
      for (const p of packets) {
        const aauth = parseAauthForPacket(p);
        if (matchesNode(p, aauth, category, decodedId)) {
          matching.push({
            frame_number: p.frame_number,
            timestamp_iso: p.timestamp_iso,
            direction: p.direction,
            method: p.method,
            url: p.url,
            host: p.host,
            status_code: p.status_code,
            jsonrpc_method: p.jsonrpc_method,
            posture: aauth.posture,
            agent: aauth.agent,
            mission: aauth.mission,
            sig_alg: aauth.sig_alg,
            sig_keyid_short: aauth.sig_keyid_short,
            requirement: aauth.requirement,
          });
          if (matching.length >= 100) {
            break;
          }
        }
      }

      res.json({
        category,
        id: decodedId,
        packet_count: matching.length,
        packets: matching,
      });
    } catch (error) {
      this.logger.error({ error: error.message }, 'Error fetching node packets');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch node packets',
        details: error.message,
      });
    }
  }

  /**
   * POST /api/aauth/self-test
   * Generate synthetic AAuth-shaped traffic and write it through the audit
   * pipeline so it appears identically to live captured traffic. Auto-detects
   * configured HTTP upstreams; falls back to a placeholder triple. Body is
   * optional and accepts `{ rounds: number }`.
   */
  runSelfTest(req, res) {
    try {
      const result = runAauthSelfTest(
        { auditService: this.auditService, logger: this.logger },
        { rounds: req.body?.rounds }
      );
      res.json({ observed: true, verified: false, ...result });
    } catch (error) {
      this.logger.error({ error: error.message }, 'Error running AAuth self-test');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to run AAuth self-test',
        details: error.message,
      });
    }
  }
}

function matchesNode(packet, aauth, category, id) {
  switch (category) {
    case 'agent':
      return aauth.agent === id;
    case 'mission':
      return aauth.mission === id;
    case 'resource': {
      const host =
        packet?.host ||
        packet?.remote_address ||
        (typeof packet?.url === 'string'
          ? (() => {
              try {
                return new URL(packet.url).host;
              } catch {
                return null;
              }
            })()
          : null);
      return host === id;
    }
    case 'signing':
      return aauth.sig_alg === id;
    case 'access': {
      if (!aauth.requirement) {
        return false;
      }
      const m = aauth.requirement.match(/mode\s*=\s*"?([A-Za-z0-9_-]+)"?/i);
      return m && m[1] === id;
    }
    default:
      return false;
  }
}
