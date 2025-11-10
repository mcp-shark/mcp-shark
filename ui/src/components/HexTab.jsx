import { colors, fonts } from '../theme';

function HexTab({ hexLines }) {
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '11px', padding: '16px' }}>
      <div
        style={{
          marginBottom: '8px',
          color: colors.textSecondary,
          fontFamily: fonts.body,
          fontWeight: '500',
        }}
      >
        Hex Dump (Offset | Hex | ASCII)
      </div>
      <div
        style={{
          background: colors.bgSecondary,
          padding: '12px',
          borderRadius: '6px',
          border: `1px solid ${colors.borderLight}`,
        }}
      >
        {hexLines.map((line, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '16px',
              padding: '4px 0',
              color: colors.textPrimary,
              fontFamily: fonts.mono,
              fontSize: '12px',
            }}
          >
            <span style={{ color: colors.textSecondary, minWidth: '80px' }}>{line.offset}</span>
            <span style={{ minWidth: '400px', color: colors.textPrimary }}>
              {line.hex.padEnd(48)}
            </span>
            <span style={{ color: colors.textPrimary }}>{line.ascii}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HexTab;
