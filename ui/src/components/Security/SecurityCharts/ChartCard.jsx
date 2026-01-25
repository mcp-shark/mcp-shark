import { colors, fonts } from '../../../theme.js';

export function ChartCard({ title, children, height = '180px' }) {
  return (
    <div
      style={{
        background: colors.bgCard,
        borderRadius: '8px',
        border: `1px solid ${colors.borderLight}`,
        padding: '14px',
        boxShadow: `0 1px 3px ${colors.shadowSm}`,
      }}
    >
      <h4
        style={{
          fontSize: '10px',
          fontWeight: '600',
          color: colors.textTertiary,
          fontFamily: fonts.body,
          margin: '0 0 10px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </h4>
      <div style={{ height }}>{children}</div>
    </div>
  );
}
