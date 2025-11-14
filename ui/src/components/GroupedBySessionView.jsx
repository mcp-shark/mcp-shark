import React from 'react';
import { colors, fonts } from '../theme';
import RequestRow from './RequestRow';
import GroupHeader from './GroupHeader';

export default function GroupedBySessionView({
  groupedData,
  expandedSessions,
  expandedServers,
  onToggleSession,
  onToggleServer,
  selected,
  firstRequestTime,
  onSelect,
}) {
  return (
    <tbody>
      {groupedData.map((sessionGroup) => {
        const sessionKey = sessionGroup.sessionId || '__NO_SESSION__';
        const isSessionExpanded = expandedSessions.has(sessionKey);
        const totalRequests = sessionGroup.servers.reduce(
          (sum, server) => sum + server.requests.length,
          0
        );
        const requestCountText = totalRequests === 1 ? '1 request' : `${totalRequests} requests`;

        return (
          <React.Fragment key={sessionKey}>
            <GroupHeader
              onClick={() => onToggleSession(sessionGroup.sessionId)}
              isExpanded={isSessionExpanded}
            >
              <span style={{ color: colors.textSecondary, fontFamily: fonts.body }}>Session:</span>{' '}
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
            </GroupHeader>
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
                    <GroupHeader
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleServer(sessionGroup.sessionId, server.serverName);
                      }}
                      isExpanded={isServerExpanded}
                      indent={1}
                    >
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
                      <span style={{ marginLeft: '12px', color: '#858585', fontWeight: 'normal' }}>
                        ({serverRequestCountText})
                      </span>
                    </GroupHeader>
                    {isServerExpanded &&
                      server.requests.map((request) => (
                        <RequestRow
                          key={request.frame_number}
                          request={request}
                          selected={selected}
                          firstRequestTime={firstRequestTime}
                          onSelect={onSelect}
                        />
                      ))}
                  </React.Fragment>
                );
              })}
          </React.Fragment>
        );
      })}
    </tbody>
  );
}
