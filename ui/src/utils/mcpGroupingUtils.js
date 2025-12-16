import {
  IconBell,
  IconDatabase,
  IconMessage,
  IconPackage,
  IconRefresh,
  IconTool,
  IconUser,
} from '@tabler/icons-react';
import { pairRequestsWithResponses } from './requestUtils.js';

/**
 * MCP Method Categories based on the protocol specification
 * Reference: https://modelcontextprotocol.io/docs/learn/architecture
 */
export const MCP_METHOD_CATEGORIES = {
  LIFECYCLE: 'lifecycle',
  TOOLS: 'tools',
  RESOURCES: 'resources',
  PROMPTS: 'prompts',
  NOTIFICATIONS: 'notifications',
  CLIENT_FEATURES: 'client-features',
  OTHER: 'other',
};

/**
 * Categorize an MCP method into its protocol category
 */
export function categorizeMcpMethod(method) {
  if (!method) {
    return MCP_METHOD_CATEGORIES.OTHER;
  }

  // Lifecycle methods
  if (method === 'initialize' || method === 'notifications/initialized') {
    return MCP_METHOD_CATEGORIES.LIFECYCLE;
  }

  // Tools methods
  if (method.startsWith('tools/')) {
    return MCP_METHOD_CATEGORIES.TOOLS;
  }

  // Resources methods
  if (method.startsWith('resources/')) {
    return MCP_METHOD_CATEGORIES.RESOURCES;
  }

  // Prompts methods
  if (method.startsWith('prompts/')) {
    return MCP_METHOD_CATEGORIES.PROMPTS;
  }

  // Notifications (no response expected)
  if (method.startsWith('notifications/')) {
    return MCP_METHOD_CATEGORIES.NOTIFICATIONS;
  }

  // Client features
  if (
    method.startsWith('elicitation/') ||
    method.startsWith('sampling/') ||
    method.startsWith('logging/')
  ) {
    return MCP_METHOD_CATEGORIES.CLIENT_FEATURES;
  }

  return MCP_METHOD_CATEGORIES.OTHER;
}

/**
 * Get a human-readable label for an MCP method category
 */
export function getCategoryLabel(category) {
  const labels = {
    [MCP_METHOD_CATEGORIES.LIFECYCLE]: 'Lifecycle',
    [MCP_METHOD_CATEGORIES.TOOLS]: 'Tools',
    [MCP_METHOD_CATEGORIES.RESOURCES]: 'Resources',
    [MCP_METHOD_CATEGORIES.PROMPTS]: 'Prompts',
    [MCP_METHOD_CATEGORIES.NOTIFICATIONS]: 'Notifications',
    [MCP_METHOD_CATEGORIES.CLIENT_FEATURES]: 'Client Features',
    [MCP_METHOD_CATEGORIES.OTHER]: 'Other',
  };
  return labels[category] || 'Unknown';
}

/**
 * Get Tabler icon component for category (for visual grouping)
 */
export function getCategoryIconComponent(category) {
  const iconMap = {
    [MCP_METHOD_CATEGORIES.LIFECYCLE]: IconRefresh,
    [MCP_METHOD_CATEGORIES.TOOLS]: IconTool,
    [MCP_METHOD_CATEGORIES.RESOURCES]: IconDatabase,
    [MCP_METHOD_CATEGORIES.PROMPTS]: IconMessage,
    [MCP_METHOD_CATEGORIES.NOTIFICATIONS]: IconBell,
    [MCP_METHOD_CATEGORIES.CLIENT_FEATURES]: IconUser,
    [MCP_METHOD_CATEGORIES.OTHER]: IconPackage,
  };

  return iconMap[category] || IconPackage;
}

// Import getJsonRpcMethod from requestUtils instead of duplicating
import { getJsonRpcMethod } from './requestUtils.js';

/**
 * Group requests by MCP session and method category
 * This provides a view that shows the flow of MCP operations organized by protocol category
 */
export function groupByMcpSessionAndCategory(requests) {
  const pairs = pairRequestsWithResponses(requests);
  const sessionGroups = new Map();

  pairs.forEach((pair) => {
    const request = pair.request || pair.response;
    if (!request) {
      return;
    }

    const sessionId = request.session_id || '__NO_SESSION__';
    const method = getJsonRpcMethod(request);
    const category = categorizeMcpMethod(method || '');

    if (!sessionGroups.has(sessionId)) {
      sessionGroups.set(sessionId, {
        sessionId: sessionId === '__NO_SESSION__' ? null : sessionId,
        categories: new Map(),
        firstTimestamp: request.timestamp_iso,
      });
    }

    const session = sessionGroups.get(sessionId);
    if (!session.categories.has(category)) {
      session.categories.set(category, []);
    }

    session.categories.get(category).push(pair);

    // Update first timestamp if earlier
    if (new Date(request.timestamp_iso) < new Date(session.firstTimestamp)) {
      session.firstTimestamp = request.timestamp_iso;
    }
  });

  return Array.from(sessionGroups.entries())
    .map(([_sessionId, session]) => ({
      sessionId: session.sessionId,
      firstTimestamp: session.firstTimestamp,
      categories: Array.from(session.categories.entries())
        .map(([category, pairs]) => ({
          category,
          label: getCategoryLabel(category),
          pairs: pairs.sort((a, b) => {
            const aTime = (a.request || a.response)?.timestamp_iso || '';
            const bTime = (b.request || b.response)?.timestamp_iso || '';
            return new Date(aTime) - new Date(bTime);
          }),
        }))
        .sort((a, b) => {
          // Order: lifecycle first, then tools, resources, prompts, notifications, client features, other
          const order = [
            MCP_METHOD_CATEGORIES.LIFECYCLE,
            MCP_METHOD_CATEGORIES.TOOLS,
            MCP_METHOD_CATEGORIES.RESOURCES,
            MCP_METHOD_CATEGORIES.PROMPTS,
            MCP_METHOD_CATEGORIES.NOTIFICATIONS,
            MCP_METHOD_CATEGORIES.CLIENT_FEATURES,
            MCP_METHOD_CATEGORIES.OTHER,
          ];
          const aIndex = order.indexOf(a.category);
          const bIndex = order.indexOf(b.category);
          return aIndex - bIndex;
        }),
    }))
    .sort((a, b) => new Date(b.firstTimestamp) - new Date(a.firstTimestamp));
}

/**
 * Group requests by MCP method category (across all sessions)
 * Useful for seeing all tool calls, all resource reads, etc.
 */
export function groupByMcpCategory(requests) {
  const pairs = pairRequestsWithResponses(requests);
  const categoryGroups = new Map();

  pairs.forEach((pair) => {
    const request = pair.request || pair.response;
    if (!request) {
      return;
    }

    const method = getJsonRpcMethod(request);
    const category = categorizeMcpMethod(method || '');

    if (!categoryGroups.has(category)) {
      categoryGroups.set(category, []);
    }

    categoryGroups.get(category).push(pair);
  });

  return Array.from(categoryGroups.entries())
    .map(([category, pairs]) => ({
      category,
      label: getCategoryLabel(category),
      pairs: pairs.sort((a, b) => {
        const aTime = (a.request || a.response)?.timestamp_iso || '';
        const bTime = (b.request || b.response)?.timestamp_iso || '';
        return new Date(bTime) - new Date(aTime);
      }),
    }))
    .sort((a, b) => {
      // Order: lifecycle first, then tools, resources, prompts, notifications, client features, other
      const order = [
        MCP_METHOD_CATEGORIES.LIFECYCLE,
        MCP_METHOD_CATEGORIES.TOOLS,
        MCP_METHOD_CATEGORIES.RESOURCES,
        MCP_METHOD_CATEGORIES.PROMPTS,
        MCP_METHOD_CATEGORIES.NOTIFICATIONS,
        MCP_METHOD_CATEGORIES.CLIENT_FEATURES,
        MCP_METHOD_CATEGORIES.OTHER,
      ];
      const aIndex = order.indexOf(a.category);
      const bIndex = order.indexOf(b.category);
      return aIndex - bIndex;
    });
}

/**
 * Get a short description of what an MCP method does
 * Based on the protocol specification
 */
export function getMethodDescription(method) {
  if (!method) {
    return 'Unknown operation';
  }

  const descriptions = {
    // Lifecycle
    initialize: 'Initialize MCP connection and negotiate capabilities',
    'notifications/initialized': 'Client ready notification after initialization',

    // Tools
    'tools/list': 'Discover available tools from server',
    'tools/call': 'Execute a tool with arguments',

    // Resources
    'resources/list': 'List available direct resources',
    'resources/templates/list': 'Discover resource templates',
    'resources/read': 'Retrieve resource contents',
    'resources/subscribe': 'Monitor resource changes',

    // Prompts
    'prompts/list': 'Discover available prompts',
    'prompts/get': 'Retrieve prompt details',

    // Notifications
    'notifications/tools/list_changed': 'Server notifies client that tool list changed',
    'notifications/resources/list_changed': 'Server notifies client that resource list changed',
    'notifications/prompts/list_changed': 'Server notifies client that prompt list changed',

    // Client features
    'elicitation/request': 'Server requests information from user',
    'sampling/complete': 'Server requests LLM completion from client',
    'logging/message': 'Server sends log message to client',
  };

  return descriptions[method] || `${method} operation`;
}
