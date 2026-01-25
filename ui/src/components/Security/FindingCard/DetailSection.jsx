import { colors, fonts } from '../../../theme.js';

export function DetailSection({ label, icon: Icon, children, variant }) {
  const isHighlight = variant === 'highlight';

  return (
    <div
      style={{
        marginBottom: '12px',
        background: isHighlight ? `${colors.error}08` : 'transparent',
        border: isHighlight ? `1px solid ${colors.error}25` : 'none',
        borderRadius: isHighlight ? '6px' : 0,
        padding: isHighlight ? '10px 12px' : 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '10px',
          fontWeight: '600',
          color: isHighlight ? colors.error : colors.textTertiary,
          fontFamily: fonts.body,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '6px',
        }}
      >
        {Icon && <Icon size={12} stroke={1.5} />}
        {label}
      </div>
      {children}
    </div>
  );
}

export function DetectedPatternsDisplay({ patterns }) {
  if (!patterns || patterns.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {patterns.map((pattern, idx) => (
        <code
          key={`pattern-${idx}-${pattern.substring(0, 20)}`}
          style={{
            display: 'inline-block',
            padding: '4px 8px',
            background: colors.bgCard,
            border: `1px solid ${colors.error}30`,
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: fonts.mono,
            color: colors.error,
            fontWeight: '500',
          }}
        >
          {pattern}
        </code>
      ))}
    </div>
  );
}
