import React from 'react';
import { colors, fonts } from '../theme';
import GroupHeader from './GroupHeader';
import RequestRow from './RequestRow';

export default function GroupedByServerView({
  groupedData,
  expandedServersFirst,
  expandedSessionsInServer,
  onToggleServerFirst,
  onToggleSessionInServer,
  selected,
  firstRequestTime,
  onSelect,
}) {
  return (
    <tbody>
      {groupedData.map((serverGroup) => {
        const serverKey = serverGroup.serverName || '__UNKNOWN_SERVER__';
        const isServerExpanded = expandedServersFirst.has(serverKey);
        const totalRequests = serverGroup.sessions.reduce(
          (sum, session) => sum + session.requests.length,
          0
        );
        const requestCountText = totalRequests === 1 ? '1 request' : `${totalRequests} requests`;

        return (
          <React.Fragment key={serverKey}>
            <GroupHeader
              onClick={() => onToggleServerFirst(serverGroup.serverName)}
              isExpanded={isServerExpanded}
            >
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
            </GroupHeader>
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
                    <GroupHeader
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSessionInServer(serverGroup.serverName, session.sessionId);
                      }}
                      isExpanded={isSessionExpanded}
                      indent={1}
                    >
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
                    </GroupHeader>
                    {isSessionExpanded &&
                      session.requests.map((request) => (
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
