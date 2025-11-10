import { colors, fonts } from '../theme';

function RawTab({ fullRequestText }) {
  return (
    <div style={{ fontFamily: fonts.mono, fontSize: '12px', padding: '16px' }}>
      <div
        style={{
          marginBottom: '8px',
          color: colors.textSecondary,
          fontFamily: fonts.body,
          fontWeight: '500',
        }}
      >
        Raw Request/Response Data (Headers + Body)
      </div>
      <pre
        style={{
          background: colors.bgSecondary,
          padding: '12px',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '12px',
          fontFamily: fonts.mono,
          color: colors.textPrimary,
          border: `1px solid ${colors.borderLight}`,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {fullRequestText || '(empty)'}
      </pre>
    </div>
  );
}

export default RawTab;
