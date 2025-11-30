import { colors, fonts } from '../theme';

function ViewModeTabs({ viewMode, onViewModeChange }) {
  return (
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
        onClick={() => onViewModeChange('general')}
        style={{
          padding: '10px 18px',
          background: viewMode === 'general' ? colors.bgSecondary : 'transparent',
          fontFamily: fonts.body,
          border: 'none',
          borderBottom:
            viewMode === 'general' ? `2px solid ${colors.accentBlue}` : '2px solid transparent',
          color: viewMode === 'general' ? colors.textPrimary : colors.textSecondary,
          borderRadius: '8px 8px 0 0',
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
        onClick={() => onViewModeChange('groupedBySession')}
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
          borderRadius: '8px 8px 0 0',
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
        onClick={() => onViewModeChange('groupedByServer')}
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
          borderRadius: '8px 8px 0 0',
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
  );
}

export default ViewModeTabs;
