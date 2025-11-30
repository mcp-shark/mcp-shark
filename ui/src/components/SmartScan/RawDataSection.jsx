import { colors, fonts } from '../../theme';

export default function RawDataSection({ scan }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3
        style={{
          fontSize: '13px',
          fontWeight: '600',
          color: colors.textPrimary,
          fontFamily: fonts.body,
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: `1px solid ${colors.borderLight}`,
        }}
      >
        Raw Data
      </h3>
      <details>
        <summary
          style={{
            cursor: 'pointer',
            padding: '8px',
            background: colors.bgTertiary,
            borderRadius: '4px',
            fontSize: '11px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
            marginBottom: '8px',
          }}
        >
          Click to view raw JSON data
        </summary>
        <pre
          style={{
            padding: '12px',
            background: colors.bgTertiary,
            borderRadius: '6px',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: colors.textPrimary,
            overflow: 'auto',
            maxHeight: '400px',
            margin: 0,
          }}
        >
          {JSON.stringify(scan, null, 2)}
        </pre>
      </details>
    </div>
  );
}
