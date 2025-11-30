import { colors, fonts } from '../theme';

function MessageDisplay({ message, error }) {
  if (!message && !error) {
    return null;
  }

  return (
    <div
      style={{
        marginBottom: '20px',
        padding: '12px 16px',
        background: message ? colors.info + '15' : colors.error + '15',
        border: `1px solid ${message ? colors.info : colors.error}`,
        borderRadius: '8px',
        color: message ? colors.textPrimary : colors.error,
        fontSize: '13px',
        lineHeight: '1.6',
        fontFamily: fonts.body,
        boxShadow: `0 2px 4px ${colors.shadowSm}`,
      }}
    >
      {message || error}
    </div>
  );
}

export default MessageDisplay;
