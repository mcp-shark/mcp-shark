import React from 'react';
import { colors, fonts } from '../theme';
import RequestRow from './RequestRow';
import GroupHeader from './GroupHeader';
import { getCategoryIconComponent, getMethodDescription } from '../utils/mcpGroupingUtils';
import { getJsonRpcMethod } from '../utils/requestUtils';

function GroupedByMcpView({
  groupedData,
  selected,
  firstRequestTime,
  onSelect,
  expandedSessions,
  expandedCategories,
  onToggleSession,
  onToggleCategory,
}) {
  return (
    <tbody>
      {groupedData.map((sessionGroup) => {
        const sessionKey = sessionGroup.sessionId || '__NO_SESSION__';
        const isSessionExpanded = expandedSessions.has(sessionKey);

        return (
          <React.Fragment key={sessionKey}>
            <GroupHeader
              onClick={() => onToggleSession(sessionKey)}
              isExpanded={isSessionExpanded}
              indent={0}
            >
              <span style={{ color: colors.accentBlue, marginRight: '8px' }}>
                Session: {sessionGroup.sessionId || 'No Session'}
              </span>
              <span style={{ color: colors.textTertiary, fontSize: '11px', fontWeight: '400' }}>
                ({sessionGroup.categories.reduce((sum, cat) => sum + cat.pairs.length, 0)}{' '}
                operations)
              </span>
            </GroupHeader>

            {isSessionExpanded &&
              sessionGroup.categories.map((categoryGroup) => {
                const categoryKey = `${sessionKey}::${categoryGroup.category}`;
                const isCategoryExpanded = expandedCategories.has(categoryKey);

                return (
                  <React.Fragment key={categoryKey}>
                    <GroupHeader
                      onClick={() => onToggleCategory(categoryKey)}
                      isExpanded={isCategoryExpanded}
                      indent={1}
                    >
                      <span
                        style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center' }}
                      >
                        {React.createElement(getCategoryIconComponent(categoryGroup.category), {
                          size: 16,
                          stroke: 1.5,
                          color: colors.accentBlue,
                        })}
                      </span>
                      <span style={{ color: colors.textPrimary }}>{categoryGroup.label}</span>
                      <span
                        style={{
                          color: colors.textTertiary,
                          fontSize: '11px',
                          fontWeight: '400',
                          marginLeft: '8px',
                        }}
                      >
                        ({categoryGroup.pairs.length}{' '}
                        {categoryGroup.pairs.length === 1 ? 'operation' : 'operations'})
                      </span>
                    </GroupHeader>

                    {isCategoryExpanded &&
                      categoryGroup.pairs.map((pair) => (
                        <RequestRow
                          key={pair.frame_number}
                          pair={pair}
                          selected={selected}
                          firstRequestTime={firstRequestTime}
                          onSelect={onSelect}
                          isExpanded={false}
                          onToggleExpand={() => {}}
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

export default GroupedByMcpView;
