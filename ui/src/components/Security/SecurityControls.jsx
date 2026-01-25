import { IconHistory, IconLoader2, IconSearch, IconTrash } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

function SecurityControls({
  onScan,
  scanning,
  onClear,
  clearing,
  onToggleHistory,
  showHistory,
  historyCount,
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        type="button"
        onClick={onScan}
        disabled={scanning}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          background: scanning ? colors.buttonSecondary : colors.buttonPrimary,
          color: scanning ? colors.textTertiary : colors.textInverse,
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: fonts.body,
          fontWeight: '600',
          cursor: scanning ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (!scanning) {
            e.currentTarget.style.background = colors.buttonPrimaryHover;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!scanning) {
            e.currentTarget.style.background = colors.buttonPrimary;
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {scanning ? <IconLoader2 size={12} className="spin" /> : <IconSearch size={12} />}
        {scanning ? 'Analysing...' : 'Analyse'}
      </button>

      <button
        type="button"
        onClick={onToggleHistory}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          background: showHistory ? colors.accentGreen : colors.buttonSecondary,
          color: showHistory ? '#fff' : colors.textSecondary,
          border: `1px solid ${showHistory ? colors.accentGreen : colors.borderLight}`,
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: fonts.body,
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (!showHistory) {
            e.currentTarget.style.background = colors.buttonSecondaryHover;
            e.currentTarget.style.color = colors.textPrimary;
          }
        }}
        onMouseLeave={(e) => {
          if (!showHistory) {
            e.currentTarget.style.background = colors.buttonSecondary;
            e.currentTarget.style.color = colors.textSecondary;
          }
        }}
      >
        <IconHistory size={14} stroke={1.5} />
        History
        {historyCount > 0 && (
          <span
            style={{
              background: showHistory ? 'rgba(255,255,255,0.2)' : colors.bgTertiary,
              color: showHistory ? '#fff' : colors.textMuted,
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 600,
              fontFamily: fonts.mono,
            }}
          >
            {historyCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={onClear}
        disabled={clearing}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          background: colors.buttonSecondary,
          color: clearing ? colors.textTertiary : colors.textSecondary,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: fonts.body,
          fontWeight: '500',
          cursor: clearing ? 'not-allowed' : 'pointer',
          opacity: clearing ? 0.6 : 1,
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (!clearing) {
            e.currentTarget.style.background = colors.buttonSecondaryHover;
            e.currentTarget.style.color = colors.textPrimary;
          }
        }}
        onMouseLeave={(e) => {
          if (!clearing) {
            e.currentTarget.style.background = colors.buttonSecondary;
            e.currentTarget.style.color = colors.textSecondary;
          }
        }}
      >
        {clearing ? (
          <IconLoader2 size={14} className="spin" />
        ) : (
          <IconTrash size={14} stroke={1.5} />
        )}
        {clearing ? 'Clearing...' : 'Clear'}
      </button>
    </div>
  );
}

export default SecurityControls;
