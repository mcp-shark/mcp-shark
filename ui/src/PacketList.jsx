import React, { useState, useEffect, useRef, useMemo } from 'react';
import { colors, fonts } from './theme';

// SVG Icon Components
const ChevronDown = ({ size = 12, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronRight = ({ size = 12, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

function RequestList({ requests, selected, onSelect, firstRequestTime }) {
  const tableRef = useRef(null);
  const [viewMode, setViewMode] = useState('general'); // 'general', 'groupedBySession', or 'groupedByServer'
  const [columnWidths, setColumnWidths] = useState({
    frame: 60,
    time: 120,
    datetime: 180,
    source: 120,
    destination: 120,
    protocol: 80,
    method: 80,
    status: 80,
    endpoint: 250,
    length: 80,
    info: 400,
  });
  const [expandedSessions, setExpandedSessions] = useState(new Set());
  const [expandedServers, setExpandedServers] = useState(new Map()); // Map<sessionId, Set<serverName>> for session-first view
  const [expandedServersFirst, setExpandedServersFirst] = useState(new Set()); // Set<serverName> for server-first view
  const [expandedSessionsInServer, setExpandedSessionsInServer] = useState(new Map()); // Map<serverName, Set<sessionId>> for server-first view

  // Extract server name from request body (JSON-RPC params)
  const extractServerName = (request) => {
    // Try to extract from body_json first
    if (request.body_json) {
      try {
        const body =
          typeof request.body_json === 'string' ? JSON.parse(request.body_json) : request.body_json;

        // Check for params.name in JSON-RPC format
        if (body.params && body.params.name) {
          const fullName = body.params.name;
          // Extract server name (part before the dot, if any)
          const serverName = fullName.includes('.') ? fullName.split('.')[0] : fullName;
          return serverName;
        }
      } catch (e) {
        // Failed to parse JSON, try body_raw
      }
    }

    // Try to extract from body_raw
    if (request.body_raw) {
      try {
        const body =
          typeof request.body_raw === 'string' ? JSON.parse(request.body_raw) : request.body_raw;

        if (body.params && body.params.name) {
          const fullName = body.params.name;
          const serverName = fullName.includes('.') ? fullName.split('.')[0] : fullName;
          return serverName;
        }
      } catch (e) {
        // Failed to parse
      }
    }

    // Fall back to host field
    if (request.host) {
      return request.host;
    }

    // Last resort: unknown
    return '__UNKNOWN_SERVER__';
  };

  // Group requests by server name, then by session ID
  const groupedByServerAndSession = useMemo(() => {
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

    // Convert to array structure
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
        // Sort servers by their first request timestamp (most recent first)
        const aTime = a.sessions[0]?.requests[0]?.timestamp_iso || '';
        const bTime = b.sessions[0]?.requests[0]?.timestamp_iso || '';
        return new Date(bTime) - new Date(aTime);
      });
  }, [requests]);

  // Group requests by session ID, then by server name
  const groupedBySessionAndServer = useMemo(() => {
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

    // Convert to array structure
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
        // Sort sessions by their first request timestamp (most recent first)
        const aTime = a.servers[0]?.requests[0]?.timestamp_iso || '';
        const bTime = b.servers[0]?.requests[0]?.timestamp_iso || '';
        return new Date(bTime) - new Date(aTime);
      });
  }, [requests]);

  // Initialize all groups as expanded by default
  useEffect(() => {
    if (viewMode === 'groupedBySession') {
      const allSessionIds = new Set(
        groupedBySessionAndServer.map((g) => g.sessionId || '__NO_SESSION__')
      );
      setExpandedSessions((prev) => {
        const updated = new Set(prev);
        allSessionIds.forEach((id) => updated.add(id));
        return updated;
      });

      // Initialize expanded servers for each session
      setExpandedServers((prev) => {
        const updated = new Map(prev);
        groupedBySessionAndServer.forEach((sessionGroup) => {
          const sessionKey = sessionGroup.sessionId || '__NO_SESSION__';
          if (!updated.has(sessionKey)) {
            updated.set(sessionKey, new Set());
          }
          const serverSet = updated.get(sessionKey);
          sessionGroup.servers.forEach((server) => {
            const serverKey = server.serverName || '__UNKNOWN_SERVER__';
            serverSet.add(serverKey);
          });
        });
        return updated;
      });
    } else if (viewMode === 'groupedByServer') {
      const allServerNames = new Set(
        groupedByServerAndSession.map((g) => g.serverName || '__UNKNOWN_SERVER__')
      );
      setExpandedServersFirst((prev) => {
        const updated = new Set(prev);
        allServerNames.forEach((name) => updated.add(name));
        return updated;
      });

      // Initialize expanded sessions for each server
      setExpandedSessionsInServer((prev) => {
        const updated = new Map(prev);
        groupedByServerAndSession.forEach((serverGroup) => {
          const serverKey = serverGroup.serverName || '__UNKNOWN_SERVER__';
          if (!updated.has(serverKey)) {
            updated.set(serverKey, new Set());
          }
          const sessionSet = updated.get(serverKey);
          serverGroup.sessions.forEach((session) => {
            const sessionKey = session.sessionId || '__NO_SESSION__';
            sessionSet.add(sessionKey);
          });
        });
        return updated;
      });
    }
  }, [groupedBySessionAndServer, groupedByServerAndSession, viewMode]);

  const toggleSession = (sessionId) => {
    const key = sessionId || '__NO_SESSION__';
    setExpandedSessions((prev) => {
      const updated = new Set(prev);
      if (updated.has(key)) {
        updated.delete(key);
      } else {
        updated.add(key);
      }
      return updated;
    });
  };

  const toggleServer = (sessionId, serverName) => {
    const sessionKey = sessionId || '__NO_SESSION__';
    const serverKey = serverName || '__UNKNOWN_SERVER__';
    setExpandedServers((prev) => {
      const updated = new Map(prev);
      if (!updated.has(sessionKey)) {
        updated.set(sessionKey, new Set());
      }
      const serverSet = updated.get(sessionKey);
      if (serverSet.has(serverKey)) {
        serverSet.delete(serverKey);
      } else {
        serverSet.add(serverKey);
      }
      return updated;
    });
  };

  const toggleServerFirst = (serverName) => {
    const serverKey = serverName || '__UNKNOWN_SERVER__';
    setExpandedServersFirst((prev) => {
      const updated = new Set(prev);
      if (updated.has(serverKey)) {
        updated.delete(serverKey);
      } else {
        updated.add(serverKey);
      }
      return updated;
    });
  };

  const toggleSessionInServer = (serverName, sessionId) => {
    const serverKey = serverName || '__UNKNOWN_SERVER__';
    const sessionKey = sessionId || '__NO_SESSION__';
    setExpandedSessionsInServer((prev) => {
      const updated = new Map(prev);
      if (!updated.has(serverKey)) {
        updated.set(serverKey, new Set());
      }
      const sessionSet = updated.get(serverKey);
      if (sessionSet.has(sessionKey)) {
        sessionSet.delete(sessionKey);
      } else {
        sessionSet.add(sessionKey);
      }
      return updated;
    });
  };

  const getRequestColor = (request) => {
    if (request.direction === 'request') {
      return colors.bgCard; // White for requests
    } else {
      if (request.status_code >= 400) {
        return '#fef0f0'; // Soft red background for errors
      } else if (request.status_code >= 300) {
        return '#fff8e8'; // Soft yellow background for redirects
      } else {
        return '#f0f8f0'; // Soft green background for success
      }
    }
  };

  const formatRelativeTime = (timestampISO, firstTime) => {
    if (!firstTime) return '0.000000';
    const diff = new Date(timestampISO) - new Date(firstTime);
    return (diff / 1000).toFixed(6);
  };

  const formatDateTime = (timestampISO) => {
    if (!timestampISO) return '-';
    try {
      const date = new Date(timestampISO);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch (e) {
      return timestampISO;
    }
  };

  const getSourceDest = (request) => {
    if (request.direction === 'request') {
      return {
        source: request.remote_address || 'Client',
        dest: request.host || 'Server',
      };
    } else {
      return {
        source: request.host || 'Server',
        dest: request.remote_address || 'Client',
      };
    }
  };

  const getEndpoint = (request) => {
    if (request.direction === 'request') {
      // Extract endpoint from JSON-RPC body (format: {"method": "prompts/list", "jsonrpc": "2.0", "id": 8})
      // Try to extract from body_json first
      if (request.body_json) {
        try {
          const body =
            typeof request.body_json === 'string'
              ? JSON.parse(request.body_json)
              : request.body_json;
          if (body && typeof body === 'object' && body.method) {
            return body.method;
          }
        } catch (e) {
          // Failed to parse JSON, try body_raw
        }
      }
      // Try to extract from body_raw
      if (request.body_raw) {
        try {
          const body =
            typeof request.body_raw === 'string' ? JSON.parse(request.body_raw) : request.body_raw;
          if (body && typeof body === 'object' && body.method) {
            return body.method;
          }
        } catch (e) {
          // Failed to parse
        }
      }
      // Fallback to jsonrpc_method field if available
      if (request.jsonrpc_method) {
        return request.jsonrpc_method;
      }
      // Fallback to URL if nothing else is available
      if (request.url) {
        try {
          const url = new URL(request.url);
          return url.pathname + (url.search || '');
        } catch (e) {
          const url = request.url;
          const match = url.match(/^https?:\/\/[^\/]+(\/.*)$/);
          return match ? match[1] : url;
        }
      }
    }
    return '-';
  };

  const getInfo = (request) => {
    if (request.direction === 'request') {
      const method = request.method || 'HTTP';
      const url = request.url || '';
      const rpc = request.jsonrpc_method ? ` ${request.jsonrpc_method}` : '';
      return `${method} ${url}${rpc}`;
    } else {
      const status = request.status_code || '';
      const rpc = request.jsonrpc_method ? ` ${request.jsonrpc_method}` : '';
      return `${status}${rpc}`;
    }
  };

  const renderRequestRow = (request) => {
    const isSelected = selected?.frame_number === request.frame_number;
    const color = getRequestColor(request);
    const { source, dest } = getSourceDest(request);
    const relativeTime = formatRelativeTime(request.timestamp_iso, firstRequestTime);

    return (
      <tr
        key={request.frame_number}
        onClick={() => onSelect(request)}
        style={{
          cursor: 'pointer',
          background: isSelected ? `${colors.accentBlue}20` : color,
          borderBottom: `1px solid ${colors.borderLight}`,
          fontFamily: fonts.body,
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = `${colors.accentBlue}15`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = color;
          }
        }}
      >
        <td
          style={{
            padding: '8px 12px',
            borderRight: `1px solid ${colors.borderLight}`,
            color: colors.textPrimary,
            textAlign: 'right',
            fontFamily: fonts.mono,
            fontSize: '12px',
          }}
        >
          {request.frame_number}
        </td>
        <td
          style={{
            padding: '8px 12px',
            borderRight: `1px solid ${colors.borderLight}`,
            color: colors.textPrimary,
            fontFamily: fonts.mono,
            fontSize: '12px',
          }}
        >
          {relativeTime}
        </td>
        <td
          style={{
            padding: '8px 12px',
            borderRight: `1px solid ${colors.borderLight}`,
            color: colors.textPrimary,
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          {formatDateTime(request.timestamp_iso)}
        </td>
        <td
          style={{
            padding: '8px 12px',
            borderRight: `1px solid ${colors.borderLight}`,
            color: request.direction === 'request' ? colors.accentBlue : colors.accentGreen,
            fontFamily: fonts.mono,
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          {source}
        </td>
        <td
          style={{
            padding: '8px 12px',
            borderRight: `1px solid ${colors.borderLight}`,
            color: request.direction === 'request' ? colors.accentBlue : colors.accentGreen,
            fontFamily: fonts.mono,
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          {dest}
        </td>
        <td
          style={{
            padding: '8px 12px',
            borderRight: `1px solid ${colors.borderLight}`,
            color: colors.textPrimary,
            fontFamily: fonts.mono,
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          {request.protocol || 'HTTP'}
        </td>
        <td
          style={{
            padding: '8px 12px',
            borderRight: `1px solid ${colors.borderLight}`,
            color: request.direction === 'request' ? colors.accentBlue : colors.textSecondary,
            fontFamily: fonts.mono,
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          {request.direction === 'request' ? request.method || '-' : '-'}
        </td>
        <td
          style={{
            padding: '8px 12px',
            borderRight: `1px solid ${colors.borderLight}`,
            color:
              request.direction === 'response'
                ? request.status_code >= 400
                  ? colors.error
                  : request.status_code >= 300
                    ? colors.warning
                    : colors.success
                : colors.textSecondary,
            fontFamily: fonts.mono,
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          {request.direction === 'response' ? request.status_code || '-' : '-'}
        </td>
        <td
          style={{
            padding: '8px 12px',
            borderRight: `1px solid ${colors.borderLight}`,
            color: colors.textPrimary,
            fontFamily: fonts.mono,
            fontSize: '12px',
          }}
        >
          {getEndpoint(request)}
        </td>
        <td
          style={{
            padding: '8px 12px',
            borderRight: `1px solid ${colors.borderLight}`,
            color: colors.textPrimary,
            textAlign: 'right',
            fontFamily: fonts.mono,
            fontSize: '12px',
          }}
        >
          {request.length}
        </td>
        <td
          style={{
            padding: '8px 12px',
            color: colors.textPrimary,
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          {getInfo(request)}
        </td>
      </tr>
    );
  };

  const renderTableHeader = () => (
    <thead
      style={{
        position: 'sticky',
        top: 0,
        background: colors.bgCard,
        zIndex: 10,
        boxShadow: `0 2px 4px ${colors.shadowSm}`,
      }}
    >
      <tr>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.frame}px`,
            minWidth: `${columnWidths.frame}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          No.
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.time}px`,
            minWidth: `${columnWidths.time}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Time
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.datetime}px`,
            minWidth: `${columnWidths.datetime}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Date/Time
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.source}px`,
            minWidth: `${columnWidths.source}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Source
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.destination}px`,
            minWidth: `${columnWidths.destination}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Destination
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.protocol}px`,
            minWidth: `${columnWidths.protocol}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Protocol
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.method}px`,
            minWidth: `${columnWidths.method}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Method
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.status}px`,
            minWidth: `${columnWidths.status}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Status
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.endpoint}px`,
            minWidth: `${columnWidths.endpoint}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Endpoint
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'right',
            borderBottom: `2px solid ${colors.borderMedium}`,
            borderRight: `1px solid ${colors.borderLight}`,
            width: `${columnWidths.length}px`,
            minWidth: `${columnWidths.length}px`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Length
        </th>
        <th
          style={{
            padding: '4px 8px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.borderMedium}`,
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
            fontSize: '12px',
          }}
        >
          Info
        </th>
      </tr>
    </thead>
  );

  const renderGeneralView = () => (
    <tbody>{requests.map((request) => renderRequestRow(request))}</tbody>
  );

  const renderGroupedByServerView = () => (
    <tbody>
      {groupedByServerAndSession.map((serverGroup) => {
        const serverKey = serverGroup.serverName || '__UNKNOWN_SERVER__';
        const isServerExpanded = expandedServersFirst.has(serverKey);
        const totalRequests = serverGroup.sessions.reduce(
          (sum, session) => sum + session.requests.length,
          0
        );
        const requestCountText = totalRequests === 1 ? '1 request' : `${totalRequests} requests`;

        return (
          <React.Fragment key={serverKey}>
            {/* Server Group Header */}
            <tr
              onClick={() => toggleServerFirst(serverGroup.serverName)}
              style={{
                cursor: 'pointer',
                background: colors.bgSecondary,
                borderBottom: `2px solid ${colors.borderMedium}`,
                borderTop: `2px solid ${colors.borderMedium}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.bgSecondary;
              }}
            >
              <td
                colSpan={11}
                style={{
                  padding: '6px 12px',
                  color: colors.textPrimary,
                  fontFamily: fonts.body,
                  fontWeight: '600',
                  fontSize: '11px',
                }}
              >
                <span
                  style={{
                    marginRight: '8px',
                    userSelect: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {isServerExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </span>
                <span style={{ color: colors.textSecondary, fontFamily: fonts.body }}>Server:</span>{' '}
                {serverGroup.serverName ? (
                  <span
                    style={{ color: colors.accentBlue, fontFamily: fonts.mono, fontWeight: '500' }}
                  >
                    {serverGroup.serverName}
                  </span>
                ) : (
                  <span
                    style={{
                      color: colors.textSecondary,
                      fontStyle: 'italic',
                      fontFamily: fonts.body,
                    }}
                  >
                    (Unknown Server)
                  </span>
                )}
                <span
                  style={{
                    marginLeft: '12px',
                    color: colors.textSecondary,
                    fontWeight: '400',
                    fontFamily: fonts.body,
                  }}
                >
                  ({requestCountText})
                </span>
              </td>
            </tr>
            {/* Session Groups within Server */}
            {isServerExpanded &&
              serverGroup.sessions.map((session) => {
                const sessionKey = session.sessionId || '__NO_SESSION__';
                const sessionSet = expandedSessionsInServer.get(serverKey) || new Set();
                const isSessionExpanded = sessionSet.has(sessionKey);
                const sessionRequestCount = session.requests.length;
                const sessionRequestCountText =
                  sessionRequestCount === 1 ? '1 request' : `${sessionRequestCount} requests`;

                return (
                  <React.Fragment key={`${serverKey}-${sessionKey}`}>
                    {/* Session Group Header */}
                    <tr
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSessionInServer(serverGroup.serverName, session.sessionId);
                      }}
                      style={{
                        cursor: 'pointer',
                        background: colors.bgCard,
                        borderBottom: `1px solid ${colors.borderLight}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.bgHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.bgCard;
                      }}
                    >
                      <td
                        colSpan={11}
                        style={{
                          padding: '6px 12px 6px 32px',
                          color: colors.textPrimary,
                          fontFamily: fonts.body,
                          fontWeight: '600',
                          fontSize: '10px',
                        }}
                      >
                        <span
                          style={{
                            marginRight: '8px',
                            userSelect: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          {isSessionExpanded ? (
                            <ChevronDown size={12} />
                          ) : (
                            <ChevronRight size={12} />
                          )}
                        </span>
                        <span style={{ color: colors.textSecondary, fontFamily: fonts.body }}>
                          Session:
                        </span>{' '}
                        {session.sessionId ? (
                          <span
                            style={{
                              color: colors.accentGreen,
                              fontFamily: fonts.mono,
                              fontWeight: '500',
                            }}
                          >
                            {session.sessionId}
                          </span>
                        ) : (
                          <span
                            style={{
                              color: colors.textSecondary,
                              fontStyle: 'italic',
                              fontFamily: fonts.body,
                            }}
                          >
                            (No Session ID)
                          </span>
                        )}
                        <span
                          style={{
                            marginLeft: '12px',
                            color: colors.textSecondary,
                            fontWeight: '400',
                            fontFamily: fonts.body,
                          }}
                        >
                          ({sessionRequestCountText})
                        </span>
                      </td>
                    </tr>
                    {/* Session Requests */}
                    {isSessionExpanded &&
                      session.requests.map((request) => renderRequestRow(request))}
                  </React.Fragment>
                );
              })}
          </React.Fragment>
        );
      })}
    </tbody>
  );

  const renderGroupedView = () => (
    <tbody>
      {groupedBySessionAndServer.map((sessionGroup) => {
        const sessionKey = sessionGroup.sessionId || '__NO_SESSION__';
        const isSessionExpanded = expandedSessions.has(sessionKey);
        const totalRequests = sessionGroup.servers.reduce(
          (sum, server) => sum + server.requests.length,
          0
        );
        const requestCountText = totalRequests === 1 ? '1 request' : `${totalRequests} requests`;

        return (
          <React.Fragment key={sessionKey}>
            {/* Session Group Header */}
            <tr
              onClick={() => toggleSession(sessionGroup.sessionId)}
              style={{
                cursor: 'pointer',
                background: colors.bgSecondary,
                borderBottom: `2px solid ${colors.borderMedium}`,
                borderTop: `2px solid ${colors.borderMedium}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.bgSecondary;
              }}
            >
              <td
                colSpan={11}
                style={{
                  padding: '6px 12px',
                  color: colors.textPrimary,
                  fontFamily: fonts.body,
                  fontWeight: '600',
                  fontSize: '11px',
                }}
              >
                <span
                  style={{
                    marginRight: '8px',
                    userSelect: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {isSessionExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </span>
                <span style={{ color: colors.textSecondary, fontFamily: fonts.body }}>
                  Session:
                </span>{' '}
                {sessionGroup.sessionId ? (
                  <span
                    style={{ color: colors.accentBlue, fontFamily: fonts.mono, fontWeight: '500' }}
                  >
                    {sessionGroup.sessionId}
                  </span>
                ) : (
                  <span
                    style={{
                      color: colors.textSecondary,
                      fontStyle: 'italic',
                      fontFamily: fonts.body,
                    }}
                  >
                    (No Session ID)
                  </span>
                )}
                <span
                  style={{
                    marginLeft: '12px',
                    color: colors.textSecondary,
                    fontWeight: '400',
                    fontFamily: fonts.body,
                  }}
                >
                  ({requestCountText})
                </span>
              </td>
            </tr>
            {/* Server Groups within Session */}
            {isSessionExpanded &&
              sessionGroup.servers.map((server) => {
                const serverKey = server.serverName || '__UNKNOWN_SERVER__';
                const serverSet = expandedServers.get(sessionKey) || new Set();
                const isServerExpanded = serverSet.has(serverKey);
                const serverRequestCount = server.requests.length;
                const serverRequestCountText =
                  serverRequestCount === 1 ? '1 request' : `${serverRequestCount} requests`;

                return (
                  <React.Fragment key={`${sessionKey}-${serverKey}`}>
                    {/* Server Group Header */}
                    <tr
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleServer(sessionGroup.sessionId, server.serverName);
                      }}
                      style={{
                        cursor: 'pointer',
                        background: colors.bgCard,
                        borderBottom: `1px solid ${colors.borderLight}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.bgHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.bgCard;
                      }}
                    >
                      <td
                        colSpan={11}
                        style={{
                          padding: '6px 12px 6px 32px',
                          color: colors.textPrimary,
                          fontFamily: fonts.body,
                          fontWeight: '600',
                          fontSize: '10px',
                        }}
                      >
                        <span
                          style={{
                            marginRight: '8px',
                            userSelect: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          {isServerExpanded ? (
                            <ChevronDown size={12} />
                          ) : (
                            <ChevronRight size={12} />
                          )}
                        </span>
                        <span style={{ color: colors.textSecondary, fontFamily: fonts.body }}>
                          Server:
                        </span>{' '}
                        {server.serverName ? (
                          <span
                            style={{
                              color: colors.accentGreen,
                              fontFamily: fonts.mono,
                              fontWeight: '500',
                            }}
                          >
                            {server.serverName}
                          </span>
                        ) : (
                          <span
                            style={{
                              color: colors.textSecondary,
                              fontStyle: 'italic',
                              fontFamily: fonts.body,
                            }}
                          >
                            (Unknown Server)
                          </span>
                        )}
                        <span
                          style={{ marginLeft: '12px', color: '#858585', fontWeight: 'normal' }}
                        >
                          ({serverRequestCountText})
                        </span>
                      </td>
                    </tr>
                    {/* Server Requests */}
                    {isServerExpanded &&
                      server.requests.map((request) => renderRequestRow(request))}
                  </React.Fragment>
                );
              })}
          </React.Fragment>
        );
      })}
    </tbody>
  );

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: colors.bgPrimary,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* View Mode Tabs */}
      <div
        data-tour="view-modes"
        style={{
          display: 'flex',
          borderBottom: `1px solid ${colors.borderLight}`,
          background: colors.bgCard,
          padding: '0 12px',
          boxShadow: `0 1px 3px ${colors.shadowSm}`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setViewMode('general')}
          style={{
            padding: '10px 18px',
            background: viewMode === 'general' ? colors.bgSecondary : 'transparent',
            fontFamily: fonts.body,
            border: 'none',
            borderBottom:
              viewMode === 'general' ? `2px solid ${colors.accentBlue}` : '2px solid transparent',
            color: viewMode === 'general' ? colors.textPrimary : colors.textSecondary,
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: viewMode === 'general' ? '500' : 'normal',
          }}
          onMouseEnter={(e) => {
            if (viewMode !== 'general') {
              e.currentTarget.style.background = colors.bgHover;
              e.currentTarget.style.color = colors.textPrimary;
            }
          }}
          onMouseLeave={(e) => {
            if (viewMode !== 'general') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.textSecondary;
            }
          }}
        >
          General List
        </button>
        <button
          onClick={() => setViewMode('groupedBySession')}
          style={{
            padding: '10px 18px',
            background: viewMode === 'groupedBySession' ? colors.bgSecondary : 'transparent',
            fontFamily: fonts.body,
            border: 'none',
            borderBottom:
              viewMode === 'groupedBySession'
                ? `2px solid ${colors.accentBlue}`
                : '2px solid transparent',
            color: viewMode === 'groupedBySession' ? colors.textPrimary : colors.textSecondary,
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: viewMode === 'groupedBySession' ? '500' : 'normal',
            borderRadius: '6px 6px 0 0',
          }}
          onMouseEnter={(e) => {
            if (viewMode !== 'groupedBySession') {
              e.currentTarget.style.background = colors.bgHover;
              e.currentTarget.style.color = colors.textPrimary;
            }
          }}
          onMouseLeave={(e) => {
            if (viewMode !== 'groupedBySession') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.textSecondary;
            }
          }}
        >
          Grouped by Session & Server
        </button>
        <button
          onClick={() => setViewMode('groupedByServer')}
          style={{
            padding: '10px 18px',
            background: viewMode === 'groupedByServer' ? colors.bgSecondary : 'transparent',
            fontFamily: fonts.body,
            border: 'none',
            borderBottom:
              viewMode === 'groupedByServer'
                ? `2px solid ${colors.accentBlue}`
                : '2px solid transparent',
            color: viewMode === 'groupedByServer' ? colors.textPrimary : colors.textSecondary,
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: viewMode === 'groupedByServer' ? '500' : 'normal',
            borderRadius: '6px 6px 0 0',
          }}
          onMouseEnter={(e) => {
            if (viewMode !== 'groupedByServer') {
              e.currentTarget.style.background = colors.bgHover;
              e.currentTarget.style.color = colors.textPrimary;
            }
          }}
          onMouseLeave={(e) => {
            if (viewMode !== 'groupedByServer') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.textSecondary;
            }
          }}
        >
          Grouped by Server & Session
        </button>
      </div>

      {/* Table */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'auto',
          minHeight: 0,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <table
          ref={tableRef}
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px',
            fontFamily: fonts.mono,
          }}
        >
          {renderTableHeader()}
          {viewMode === 'general'
            ? renderGeneralView()
            : viewMode === 'groupedBySession'
              ? renderGroupedView()
              : renderGroupedByServerView()}
        </table>
      </div>
    </div>
  );
}

export default RequestList;
