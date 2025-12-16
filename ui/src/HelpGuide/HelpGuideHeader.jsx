import { IconHelp, IconX } from '@tabler/icons-react';
import { colors, fonts } from '../theme';

export default function HelpGuideHeader({ onClose }) {
  return (
    <div
      style={{
        padding: '20px 24px',
        borderBottom: `1px solid ${colors.borderLight}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ color: colors.accentBlue }}>
          <IconHelp size={24} stroke={1.5} />
        </div>
        <h2
          style={{
            margin: 0,
            color: colors.textPrimary,
            fontSize: '20px',
            fontWeight: '600',
            fontFamily: fonts.body,
          }}
        >
          Welcome to MCP Shark
        </h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: colors.textTertiary,
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '8px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.bgHover;
          e.currentTarget.style.color = colors.textPrimary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = colors.textTertiary;
        }}
      >
        <IconX size={20} stroke={1.5} />
      </button>
    </div>
  );
}
