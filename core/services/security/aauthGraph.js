/**
 * AAuth knowledge-graph builder.
 *
 * Walks the captured packets, extracts AAuth signals via aauthParser, and
 * shapes a node/edge graph that mirrors the categories on
 * https://mcp-shark.github.io/aauth-explorer/ — but every node here is
 * grounded in observed traffic, not a static spec illustration.
 *
 * Categories (kept stable so the UI can color-code them):
 *   - agent     — observed AAuth-Agent values
 *   - mission   — observed AAuth-Mission values
 *   - resource  — destination host/server names
 *   - signing   — algorithms parsed from Signature-Input (`alg=...`)
 *   - access    — access modes parsed from AAuth-Requirement (`mode=...`)
 *
 * Edges are weighted by observed packet count so the force layout settles
 * naturally around the busiest nodes.
 */

import { parseAauthForPacket } from './aauthParser.js';

const ACCESS_MODE_REGEX = /mode\s*=\s*"?([A-Za-z0-9_-]+)"?/i;

function nodeKey(category, id) {
  return `${category}::${id}`;
}

function ensureNode(map, category, id, extra = {}) {
  const key = nodeKey(category, id);
  if (!map.has(key)) {
    map.set(key, {
      id: key,
      name: id,
      category,
      packet_count: 0,
      sample_frame_numbers: [],
      ...extra,
    });
  }
  return map.get(key);
}

function bumpNode(node, frameNumber) {
  node.packet_count += 1;
  if (frameNumber != null && node.sample_frame_numbers.length < 5) {
    node.sample_frame_numbers.push(frameNumber);
  }
}

function ensureEdge(map, sourceKey, targetKey, kind) {
  const key = `${sourceKey}->${targetKey}::${kind}`;
  if (!map.has(key)) {
    map.set(key, { id: key, source: sourceKey, target: targetKey, kind, weight: 0 });
  }
  return map.get(key);
}

function bumpEdge(edge) {
  edge.weight += 1;
}

function extractAccessMode(requirement) {
  if (!requirement || typeof requirement !== 'string') {
    return null;
  }
  const m = requirement.match(ACCESS_MODE_REGEX);
  return m ? m[1] : null;
}

function extractResource(packet) {
  const host = packet?.host || packet?.remote_address || null;
  if (host) {
    return host;
  }
  const url = packet?.url;
  if (typeof url === 'string') {
    try {
      return new URL(url).host;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Build an AAuth knowledge graph from a list of packets.
 *
 * @param {Array} packets - packets as returned by RequestService.getRequests
 * @returns {{
 *   categories: Array<{id:string,label:string}>,
 *   nodes: Array,
 *   edges: Array,
 *   stats: object,
 * }}
 */
export function buildAauthGraph(packets) {
  const nodes = new Map();
  const edges = new Map();

  let observedSignals = 0;

  for (const packet of packets || []) {
    const aauth = parseAauthForPacket(packet);
    const hasAnySignal =
      aauth.posture !== 'none' ||
      aauth.agent ||
      aauth.mission ||
      aauth.requirement ||
      aauth.sig_alg;
    if (!hasAnySignal) {
      continue;
    }
    observedSignals += 1;

    const resourceId = extractResource(packet);
    const frame = packet?.frame_number ?? null;

    const resourceNode = resourceId
      ? ensureNode(nodes, 'resource', resourceId, { url: packet?.url || null })
      : null;
    if (resourceNode) {
      bumpNode(resourceNode, frame);
    }

    let agentNode = null;
    if (aauth.agent) {
      agentNode = ensureNode(nodes, 'agent', aauth.agent, {
        last_keyid: aauth.sig_keyid,
        posture: aauth.posture,
      });
      bumpNode(agentNode, frame);
    }

    let missionNode = null;
    if (aauth.mission) {
      missionNode = ensureNode(nodes, 'mission', aauth.mission);
      bumpNode(missionNode, frame);
    }

    let signingNode = null;
    if (aauth.sig_alg) {
      signingNode = ensureNode(nodes, 'signing', aauth.sig_alg, {
        keyid: aauth.sig_keyid,
      });
      bumpNode(signingNode, frame);
    }

    const accessMode = extractAccessMode(aauth.requirement);
    let accessNode = null;
    if (accessMode) {
      accessNode = ensureNode(nodes, 'access', accessMode);
      bumpNode(accessNode, frame);
    }

    if (agentNode && resourceNode) {
      bumpEdge(ensureEdge(edges, agentNode.id, resourceNode.id, 'calls'));
    }
    if (agentNode && missionNode) {
      bumpEdge(ensureEdge(edges, agentNode.id, missionNode.id, 'pursues'));
    }
    if (missionNode && resourceNode) {
      bumpEdge(ensureEdge(edges, missionNode.id, resourceNode.id, 'targets'));
    }
    if (agentNode && signingNode) {
      bumpEdge(ensureEdge(edges, agentNode.id, signingNode.id, 'signs-with'));
    }
    if (resourceNode && accessNode) {
      bumpEdge(ensureEdge(edges, resourceNode.id, accessNode.id, 'requires'));
    }
  }

  const categories = [
    { id: 'agent', label: 'Agent' },
    { id: 'mission', label: 'Mission' },
    { id: 'resource', label: 'Resource' },
    { id: 'signing', label: 'Signing' },
    { id: 'access', label: 'Access' },
  ];

  return {
    categories,
    nodes: [...nodes.values()],
    edges: [...edges.values()],
    stats: {
      observed_packets: observedSignals,
      node_counts: countByCategory([...nodes.values()]),
      edge_count: edges.size,
    },
  };
}

function countByCategory(nodes) {
  const out = {};
  for (const n of nodes) {
    out[n.category] = (out[n.category] || 0) + 1;
  }
  return out;
}
