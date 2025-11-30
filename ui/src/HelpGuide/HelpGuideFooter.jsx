import { colors, fonts } from '../theme';

export default function HelpGuideFooter({ dontShowAgain, setDontShowAgain, onClose }) {
  return (
    <div
      style={{
        marginTop: '24px',
        paddingTop: '20px',
        borderTop: `1px solid ${colors.borderLight}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: colors.textTertiary,
          cursor: 'pointer',
          fontSize: '13px',
          fontFamily: fonts.body,
        }}
      >
        <input
          type="checkbox"
          checked={dontShowAgain}
          onChange={(e) => setDontShowAgain(e.target.checked)}
          style={{ cursor: 'pointer' }}
        />
        Don't show this again
      </label>
      <button
        onClick={onClose}
        style={{
          background: colors.buttonPrimary,
          border: 'none',
          color: colors.textInverse,
          padding: '8px 20px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: fonts.body,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.buttonPrimaryHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = colors.buttonPrimary;
        }}
      >
        Got it!
      </button>
    </div>
  );
}
