import { extractServerName } from './requestUtils.js';

export function groupByServerAndSession(requests) {
  const serverGroups = new Map();

  requests.forEach((request) => {
    const sessionId = request.session_id || '__NO_SESSION__';
    const serverName = extractServerName(request);

    if (!serverGroups.has(serverName)) {
      serverGroups.set(serverName, new Map());
    }

    const sessionGroups = serverGroups.get(serverName);
    if (!sessionGroups.has(sessionId)) {
      sessionGroups.set(sessionId, []);
    }

    sessionGroups.get(sessionId).push(request);
  });

  return Array.from(serverGroups.entries())
    .map(([serverName, sessionGroups]) => {
      const sessions = Array.from(sessionGroups.entries())
        .map(([sessionId, groupRequests]) => ({
          sessionId: sessionId === '__NO_SESSION__' ? null : sessionId,
          requests: groupRequests.sort(
            (a, b) => new Date(a.timestamp_iso) - new Date(b.timestamp_iso)
          ),
        }))
        .sort((a, b) => {
          const aTime = a.requests[0]?.timestamp_iso || '';
          const bTime = b.requests[0]?.timestamp_iso || '';
          return new Date(aTime) - new Date(bTime);
        });

      return {
        serverName: serverName === '__UNKNOWN_SERVER__' ? null : serverName,
        sessions,
      };
    })
    .sort((a, b) => {
      const aTime = a.sessions[0]?.requests[0]?.timestamp_iso || '';
      const bTime = b.sessions[0]?.requests[0]?.timestamp_iso || '';
      return new Date(bTime) - new Date(aTime);
    });
}

export function groupBySessionAndServer(requests) {
  const sessionGroups = new Map();

  requests.forEach((request) => {
    const sessionId = request.session_id || '__NO_SESSION__';
    const serverName = extractServerName(request);

    if (!sessionGroups.has(sessionId)) {
      sessionGroups.set(sessionId, new Map());
    }

    const serverGroups = sessionGroups.get(sessionId);
    if (!serverGroups.has(serverName)) {
      serverGroups.set(serverName, []);
    }

    serverGroups.get(serverName).push(request);
  });

  return Array.from(sessionGroups.entries())
    .map(([sessionId, serverGroups]) => {
      const servers = Array.from(serverGroups.entries())
        .map(([serverName, groupRequests]) => ({
          serverName: serverName === '__UNKNOWN_SERVER__' ? null : serverName,
          requests: groupRequests.sort(
            (a, b) => new Date(a.timestamp_iso) - new Date(b.timestamp_iso)
          ),
        }))
        .sort((a, b) => {
          const aTime = a.requests[0]?.timestamp_iso || '';
          const bTime = b.requests[0]?.timestamp_iso || '';
          return new Date(aTime) - new Date(bTime);
        });

      return {
        sessionId: sessionId === '__NO_SESSION__' ? null : sessionId,
        servers,
      };
    })
    .sort((a, b) => {
      const aTime = a.servers[0]?.requests[0]?.timestamp_iso || '';
      const bTime = b.servers[0]?.requests[0]?.timestamp_iso || '';
      return new Date(bTime) - new Date(aTime);
    });
}
