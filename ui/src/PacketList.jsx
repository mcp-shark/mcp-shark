import { useState, useEffect, useMemo } from 'react';
import { colors, fonts } from './theme';
import RequestRow from './components/RequestRow';
import TableHeader from './components/TableHeader';
import ViewModeTabs from './components/ViewModeTabs';
import { GroupedBySessionView, GroupedByServerView } from './components/GroupedViews';
import { groupByServerAndSession, groupBySessionAndServer } from './utils/groupingUtils.js';

function RequestList({ requests, selected, onSelect, firstRequestTime }) {
  const [viewMode, setViewMode] = useState('general');
  const [columnWidths] = useState({
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
  const [expandedServers, setExpandedServers] = useState(new Map());
  const [expandedServersFirst, setExpandedServersFirst] = useState(new Set());
  const [expandedSessionsInServer, setExpandedSessionsInServer] = useState(new Map());

  const groupedByServerAndSession = useMemo(() => groupByServerAndSession(requests), [requests]);

  const groupedBySessionAndServer = useMemo(() => groupBySessionAndServer(requests), [requests]);

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

  const renderGeneralView = () => (
    <tbody>
      {requests.map((request) => (
        <RequestRow
          key={request.frame_number}
          request={request}
          selected={selected}
          firstRequestTime={firstRequestTime}
          onSelect={onSelect}
        />
      ))}
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
      <ViewModeTabs viewMode={viewMode} onViewModeChange={setViewMode} />

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
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px',
            fontFamily: fonts.mono,
          }}
        >
          <TableHeader columnWidths={columnWidths} />
          {viewMode === 'general' ? (
            renderGeneralView()
          ) : viewMode === 'groupedBySession' ? (
            <GroupedBySessionView
              groupedData={groupedBySessionAndServer}
              expandedSessions={expandedSessions}
              expandedServers={expandedServers}
              onToggleSession={toggleSession}
              onToggleServer={toggleServer}
              selected={selected}
              firstRequestTime={firstRequestTime}
              onSelect={onSelect}
            />
          ) : (
            <GroupedByServerView
              groupedData={groupedByServerAndSession}
              expandedServersFirst={expandedServersFirst}
              expandedSessionsInServer={expandedSessionsInServer}
              onToggleServerFirst={toggleServerFirst}
              onToggleSessionInServer={toggleSessionInServer}
              selected={selected}
              firstRequestTime={firstRequestTime}
              onSelect={onSelect}
            />
          )}
        </table>
      </div>
    </div>
  );
}

export default RequestList;
