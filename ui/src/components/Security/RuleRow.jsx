import { colors, fonts } from '../../theme';

function getSeverityColor(severity) {
  const severityColors = {
    critical: colors.error,
    high: '#f97316',
    medium: colors.warning,
    low: colors.success,
    info: colors.info,
  };
  return severityColors[severity] || colors.textSecondary;
}

function RuleRow({ rule, onToggle }) {
  return (
    <tr
      style={{
        borderBottom: `1px solid ${colors.borderLight}`,
      }}
    >
      <td style={{ padding: '10px 12px' }}>
        <input
          type="checkbox"
          checked={rule.enabled === 1}
          onChange={() => onToggle(rule.rule_id, rule.enabled !== 1)}
          style={{ cursor: 'pointer' }}
        />
      </td>
      <td style={{ padding: '10px 12px' }}>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 500,
            fontFamily: fonts.body,
            color: '#fff',
            background: getSeverityColor(rule.severity),
            textTransform: 'uppercase',
          }}
        >
          {rule.severity || 'unknown'}
        </span>
      </td>
      <td
        style={{
          padding: '10px 12px',
          color: colors.textPrimary,
          fontFamily: fonts.body,
          fontSize: '13px',
        }}
      >
        {rule.name}
      </td>
      <td
        style={{
          padding: '10px 12px',
          color: colors.textSecondary,
          fontFamily: fonts.body,
          fontSize: '12px',
        }}
      >
        {rule.source}
      </td>
      <td
        style={{
          padding: '10px 12px',
          color: colors.accentBlue,
          fontFamily: fonts.mono,
          fontSize: '11px',
        }}
      >
        {rule.owasp_id || '-'}
      </td>
    </tr>
  );
}

export default RuleRow;
