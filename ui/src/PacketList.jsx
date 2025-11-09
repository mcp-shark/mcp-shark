import React, { useState, useEffect, useRef, useMemo } from 'react';

function RequestList({ requests, selected, onSelect, firstRequestTime }) {
  const tableRef = useRef(null);
  const [columnWidths, setColumnWidths] = useState({
    frame: 60,
    time: 120,
    source: 120,
    destination: 120,
    protocol: 80,
    length: 80,
    info: 400,
  });
  const [expandedSessions, setExpandedSessions] = useState(new Set());

  // Group requests by session_id
  const groupedRequests = useMemo(() => {
    const groups = new Map();

    requests.forEach((request) => {
      const sessionId = request.session_id || '__NO_SESSION__';
      if (!groups.has(sessionId)) {
        groups.set(sessionId, []);
      }
      groups.get(sessionId).push(request);
    });

    // Convert to array and sort by first request timestamp in each group
    return Array.from(groups.entries())
      .map(([sessionId, groupRequests]) => ({
        sessionId: sessionId === '__NO_SESSION__' ? null : sessionId,
        requests: groupRequests.sort(
          (a, b) => new Date(a.timestamp_iso) - new Date(b.timestamp_iso)
        ),
      }))
      .sort((a, b) => {
        // Sort groups by their first request timestamp (most recent first)
        const aTime = a.requests[0]?.timestamp_iso || '';
        const bTime = b.requests[0]?.timestamp_iso || '';
        return new Date(bTime) - new Date(aTime);
      });
  }, [requests]);

  // Initialize all groups as expanded by default
  useEffect(() => {
    const allSessionIds = new Set(groupedRequests.map((g) => g.sessionId || '__NO_SESSION__'));
    setExpandedSessions((prev) => {
      const updated = new Set(prev);
      allSessionIds.forEach((id) => updated.add(id));
      return updated;
    });
  }, [groupedRequests]);

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

  const getRequestColor = (request) => {
    if (request.direction === 'request') {
      return '#1e3a5f'; // Blue for requests
    } else {
      if (request.status_code >= 400) {
        return '#5f1e1e'; // Dark red for errors
      } else if (request.status_code >= 300) {
        return '#5f4f1e'; // Dark yellow for redirects
      } else {
        return '#1e5f3a'; // Dark green for success
      }
    }
  };

  const formatRelativeTime = (timestampISO, firstTime) => {
    if (!firstTime) return '0.000000';
    const diff = new Date(timestampISO) - new Date(firstTime);
    return (diff / 1000).toFixed(6);
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
          background: isSelected ? '#264f78' : color,
          borderBottom: '1px solid #2d2d30',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = isSelected ? '#264f78' : '#2a2d2e';
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
            padding: '2px 8px',
            borderRight: '1px solid #2d2d30',
            color: '#d4d4d4',
            textAlign: 'right',
          }}
        >
          {request.frame_number}
        </td>
        <td
          style={{
            padding: '2px 8px',
            borderRight: '1px solid #2d2d30',
            color: '#d4d4d4',
          }}
        >
          {relativeTime}
        </td>
        <td
          style={{
            padding: '2px 8px',
            borderRight: '1px solid #2d2d30',
            color: request.direction === 'request' ? '#4ec9b0' : '#ce9178',
          }}
        >
          {source}
        </td>
        <td
          style={{
            padding: '2px 8px',
            borderRight: '1px solid #2d2d30',
            color: request.direction === 'request' ? '#4ec9b0' : '#ce9178',
          }}
        >
          {dest}
        </td>
        <td
          style={{
            padding: '2px 8px',
            borderRight: '1px solid #2d2d30',
            color: '#dcdcaa',
          }}
        >
          {request.protocol || 'HTTP'}
        </td>
        <td
          style={{
            padding: '2px 8px',
            borderRight: '1px solid #2d2d30',
            color: '#d4d4d4',
            textAlign: 'right',
          }}
        >
          {request.length}
        </td>
        <td
          style={{
            padding: '2px 8px',
            color: '#d4d4d4',
          }}
        >
          {getInfo(request)}
        </td>
      </tr>
    );
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', background: '#1e1e1e' }}>
      <table
        ref={tableRef}
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px',
          fontFamily: 'monospace',
        }}
      >
        <thead style={{ position: 'sticky', top: 0, background: '#252526', zIndex: 10 }}>
          <tr>
            <th
              style={{
                padding: '4px 8px',
                textAlign: 'left',
                borderBottom: '2px solid #3e3e42',
                borderRight: '1px solid #3e3e42',
                width: `${columnWidths.frame}px`,
                minWidth: `${columnWidths.frame}px`,
                color: '#cccccc',
                fontWeight: 'bold',
              }}
            >
              No.
            </th>
            <th
              style={{
                padding: '4px 8px',
                textAlign: 'left',
                borderBottom: '2px solid #3e3e42',
                borderRight: '1px solid #3e3e42',
                width: `${columnWidths.time}px`,
                minWidth: `${columnWidths.time}px`,
                color: '#cccccc',
                fontWeight: 'bold',
              }}
            >
              Time
            </th>
            <th
              style={{
                padding: '4px 8px',
                textAlign: 'left',
                borderBottom: '2px solid #3e3e42',
                borderRight: '1px solid #3e3e42',
                width: `${columnWidths.source}px`,
                minWidth: `${columnWidths.source}px`,
                color: '#cccccc',
                fontWeight: 'bold',
              }}
            >
              Source
            </th>
            <th
              style={{
                padding: '4px 8px',
                textAlign: 'left',
                borderBottom: '2px solid #3e3e42',
                borderRight: '1px solid #3e3e42',
                width: `${columnWidths.destination}px`,
                minWidth: `${columnWidths.destination}px`,
                color: '#cccccc',
                fontWeight: 'bold',
              }}
            >
              Destination
            </th>
            <th
              style={{
                padding: '4px 8px',
                textAlign: 'left',
                borderBottom: '2px solid #3e3e42',
                borderRight: '1px solid #3e3e42',
                width: `${columnWidths.protocol}px`,
                minWidth: `${columnWidths.protocol}px`,
                color: '#cccccc',
                fontWeight: 'bold',
              }}
            >
              Protocol
            </th>
            <th
              style={{
                padding: '4px 8px',
                textAlign: 'right',
                borderBottom: '2px solid #3e3e42',
                borderRight: '1px solid #3e3e42',
                width: `${columnWidths.length}px`,
                minWidth: `${columnWidths.length}px`,
                color: '#cccccc',
                fontWeight: 'bold',
              }}
            >
              Length
            </th>
            <th
              style={{
                padding: '4px 8px',
                textAlign: 'left',
                borderBottom: '2px solid #3e3e42',
                color: '#cccccc',
                fontWeight: 'bold',
              }}
            >
              Info
            </th>
          </tr>
        </thead>
        <tbody>
          {groupedRequests.map((group) => {
            const sessionKey = group.sessionId || '__NO_SESSION__';
            const isExpanded = expandedSessions.has(sessionKey);
            const requestCount = group.requests.length;
            const requestCountText = requestCount === 1 ? '1 request' : `${requestCount} requests`;

            return (
              <React.Fragment key={sessionKey}>
                {/* Session Group Header */}
                <tr
                  onClick={() => toggleSession(group.sessionId)}
                  style={{
                    cursor: 'pointer',
                    background: '#2d2d30',
                    borderBottom: '2px solid #3e3e42',
                    borderTop: '2px solid #3e3e42',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#3a3a3a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#2d2d30';
                  }}
                >
                  <td
                    colSpan={7}
                    style={{
                      padding: '6px 12px',
                      color: '#dcdcaa',
                      fontWeight: 'bold',
                      fontSize: '11px',
                    }}
                  >
                    <span style={{ marginRight: '8px', userSelect: 'none' }}>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <span style={{ color: '#858585' }}>Session:</span>{' '}
                    {group.sessionId ? (
                      <span style={{ color: '#4ec9b0', fontFamily: 'monospace' }}>
                        {group.sessionId}
                      </span>
                    ) : (
                      <span style={{ color: '#858585', fontStyle: 'italic' }}>(No Session ID)</span>
                    )}
                    <span style={{ marginLeft: '12px', color: '#858585', fontWeight: 'normal' }}>
                      ({requestCountText})
                    </span>
                  </td>
                </tr>
                {/* Session Requests */}
                {isExpanded && group.requests.map((request) => renderRequestRow(request))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default RequestList;
