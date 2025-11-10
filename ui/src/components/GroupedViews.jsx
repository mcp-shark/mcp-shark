import React from 'react';
import { colors, fonts } from '../theme';
import RequestRow from './RequestRow';

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

function GroupHeader({ children, onClick, isExpanded, indent = 0 }) {
  return (
    <tr
      onClick={onClick}
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
          padding: indent > 0 ? '6px 12px 6px 32px' : '6px 12px',
          color: colors.textPrimary,
          fontFamily: fonts.body,
          fontWeight: '600',
          fontSize: indent > 0 ? '10px' : '11px',
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
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        {children}
      </td>
    </tr>
  );
}

export function GroupedBySessionView({
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

export function GroupedByServerView({
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
