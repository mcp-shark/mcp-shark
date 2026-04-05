/**
 * Cross-server toxic-flow analysis from observed MCP traffic (tools/list responses).
 * Complements CLI static scan: same analyzeToxicFlows heuristics, fed by proxy captures.
 */
import { analyzeToxicFlows } from '#core/cli/ToxicFlowAnalyzer.js';
import {
  toolsFromJsonrpcResultString,
  toolsFromTrafficResponseBody,
} from './toolsListFromTrafficParser.js';

const TRAFFIC_IDE = 'Traffic';
const DEBOUNCE_MS = 400;

function serverKey(mcpServerName, sessionId) {
  if (mcpServerName && String(mcpServerName).trim()) {
    return String(mcpServerName).trim();
  }
  if (sessionId && String(sessionId).trim()) {
    return `session:${String(sessionId).trim()}`;
  }
  return null;
}

export class TrafficToxicFlowService {
  constructor(packetRepository, logger) {
    this.packetRepository = packetRepository;
    this.logger = logger;
    /** @type {Map<string, { tools: object[], updatedAt: number }>} */
    this._byServer = new Map();
    this._debounceTimer = null;
    this._lastFlows = [];
    this._lastComputedAt = null;
    this._lastReplayPacketCount = 0;
  }

  /**
   * Ingest a proxied JSON-RPC response (live path).
   * @param {{ mcpServerName?: string|null, sessionId?: string|null, body?: unknown }} packetData
   */
  ingestFromTrafficResponse(packetData) {
    const tools = toolsFromTrafficResponseBody(packetData?.body);
    if (!tools?.length) {
      return;
    }
    const key = serverKey(packetData?.mcpServerName, packetData?.sessionId);
    if (!key) {
      this.logger?.debug?.('Traffic toxic flow: skip tools/list — no server name or session');
      return;
    }
    this._byServer.set(key, { tools, updatedAt: Date.now() });
    this._scheduleRecompute();
  }

  _scheduleRecompute() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    this._debounceTimer = setTimeout(() => {
      this._debounceTimer = null;
      this._recomputeNow();
    }, DEBOUNCE_MS);
  }

  _serversForAnalyzer() {
    const servers = [];
    for (const [name, entry] of this._byServer.entries()) {
      servers.push({
        name,
        ide: TRAFFIC_IDE,
        config: {},
        tools: entry.tools,
      });
    }
    return servers;
  }

  _recomputeNow() {
    const servers = this._serversForAnalyzer();
    this._lastFlows = servers.length >= 2 ? analyzeToxicFlows(servers) : [];
    this._lastComputedAt = Date.now();
    this.logger?.debug?.(
      { serverCount: servers.length, flowCount: this._lastFlows.length },
      'Traffic toxic flows recomputed'
    );
  }

  /**
   * Batch replay: rebuild registry from sqlite packets, then recompute.
   * @returns {{ packetRows: number, serverCount: number, flowCount: number }}
   */
  rebuildFromDatabase() {
    if (!this.packetRepository?.listResponsesWithToolsList) {
      this.logger?.warn?.('Traffic toxic flow replay: packet repository unavailable');
      return { packetRows: 0, serverCount: 0, flowCount: 0 };
    }
    const rows = this.packetRepository.listResponsesWithToolsList();
    this._byServer.clear();
    this._lastReplayPacketCount = rows.length;

    for (const row of rows) {
      let tools = toolsFromJsonrpcResultString(row.jsonrpc_result);
      if (!tools?.length) {
        tools = toolsFromTrafficResponseBody(row.body_json || row.body_raw);
      }
      if (!tools?.length) {
        continue;
      }
      const key = serverKey(row.remote_address, row.session_id);
      if (!key) {
        continue;
      }
      this._byServer.set(key, { tools, updatedAt: Date.now() });
    }

    this._recomputeNow();
    return {
      packetRows: rows.length,
      serverCount: this._byServer.size,
      flowCount: this._lastFlows.length,
    };
  }

  getSnapshot() {
    const servers = [];
    for (const [name, entry] of this._byServer.entries()) {
      servers.push({
        name,
        toolCount: entry.tools.length,
        updatedAt: entry.updatedAt,
      });
    }
    return {
      success: true,
      toxicFlows: this._lastFlows,
      servers,
      computedAt: this._lastComputedAt,
      lastReplayPacketCount: this._lastReplayPacketCount,
      note:
        'Heuristic cross-server pairs from tools seen in tools/list traffic (HTTP proxy). ' +
        'Not runtime taint tracking. Requires at least two distinct server keys and overlapping capability rules.',
    };
  }

  clear() {
    this._byServer.clear();
    this._lastFlows = [];
    this._lastComputedAt = null;
    this._lastReplayPacketCount = 0;
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }
  }
}
