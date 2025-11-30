import { colors, fonts } from '../theme';
import { IconList, IconNetwork } from '@tabler/icons-react';

function ViewModeTabs({ viewMode, onViewModeChange }) {
  return (
    <div
      data-tour="view-modes"
      style={{
        display: 'flex',
        borderBottom: `1px solid ${colors.borderLight}`,
        background: colors.bgSecondary,
        padding: '0 12px',
        boxShadow: `0 1px 3px ${colors.shadowSm}`,
        flexShrink: 0,
      }}
    >
      <button
        onClick={() => onViewModeChange('general')}
        style={{
          padding: '10px 18px',
          background: viewMode === 'general' ? colors.bgCard : 'transparent',
          fontFamily: fonts.body,
          border: 'none',
          borderBottom:
            viewMode === 'general' ? `2px solid ${colors.accentBlue}` : '2px solid transparent',
          color: viewMode === 'general' ? colors.textPrimary : colors.textSecondary,
          borderRadius: '8px 8px 0 0',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: viewMode === 'general' ? '500' : 'normal',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
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
        <IconList size={16} stroke={1.5} />
        General List
      </button>
      <button
        onClick={() => onViewModeChange('groupedByMcp')}
        style={{
          padding: '10px 18px',
          background: viewMode === 'groupedByMcp' ? colors.bgCard : 'transparent',
          fontFamily: fonts.body,
          border: 'none',
          borderBottom:
            viewMode === 'groupedByMcp'
              ? `2px solid ${colors.accentBlue}`
              : '2px solid transparent',
          color: viewMode === 'groupedByMcp' ? colors.textPrimary : colors.textSecondary,
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: viewMode === 'groupedByMcp' ? '500' : 'normal',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        onMouseEnter={(e) => {
          if (viewMode !== 'groupedByMcp') {
            e.currentTarget.style.background = colors.bgHover;
            e.currentTarget.style.color = colors.textPrimary;
          }
        }}
        onMouseLeave={(e) => {
          if (viewMode !== 'groupedByMcp') {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = colors.textSecondary;
          }
        }}
      >
        <IconNetwork size={16} stroke={1.5} />
        MCP Protocol View
      </button>
    </div>
  );
}

export default ViewModeTabs;
