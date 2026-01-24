import { colors, fonts } from '../../theme';
import RuleRow from './RuleRow.jsx';

function RulesTable({ communityRules, onToggleRule }) {
  return (
    <div
      style={{
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '12px',
        overflow: 'hidden',
        background: colors.bgCard,
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: fonts.body }}>
        <thead>
          <tr
            style={{
              background: colors.bgSecondary,
              borderBottom: `1px solid ${colors.borderLight}`,
            }}
          >
            <th
              style={{
                padding: '12px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 600,
                color: colors.textSecondary,
                textTransform: 'uppercase',
                width: '40px',
              }}
            >
              On
            </th>
            <th
              style={{
                padding: '12px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 600,
                color: colors.textSecondary,
                textTransform: 'uppercase',
                width: '90px',
              }}
            >
              Severity
            </th>
            <th
              style={{
                padding: '12px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 600,
                color: colors.textSecondary,
                textTransform: 'uppercase',
              }}
            >
              Name
            </th>
            <th
              style={{
                padding: '12px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 600,
                color: colors.textSecondary,
                textTransform: 'uppercase',
                width: '120px',
              }}
            >
              Source
            </th>
            <th
              style={{
                padding: '12px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 600,
                color: colors.textSecondary,
                textTransform: 'uppercase',
                width: '80px',
              }}
            >
              OWASP
            </th>
          </tr>
        </thead>
        <tbody>
          {communityRules.slice(0, 50).map((rule) => (
            <RuleRow key={rule.rule_id} rule={rule} onToggle={onToggleRule} />
          ))}
        </tbody>
      </table>
      {communityRules.length > 50 && (
        <div
          style={{
            padding: '12px',
            textAlign: 'center',
            fontSize: '12px',
            color: colors.textSecondary,
            background: colors.bgSecondary,
            fontFamily: fonts.body,
          }}
        >
          Showing 50 of {communityRules.length} rules
        </div>
      )}
    </div>
  );
}

export default RulesTable;
