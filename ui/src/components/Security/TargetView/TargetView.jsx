import { colors, fonts } from '../../../theme.js';
import { TargetTypeSection } from './TargetTypeSection.jsx';

function TargetView({ findings, selectedFinding, onSelectFinding }) {
  const byType = {};

  for (const f of findings) {
    const targetType = f.target_type || 'tool';
    const targetName = f.target_name || 'Unknown';

    if (!byType[targetType]) byType[targetType] = {};
    if (!byType[targetType][targetName]) byType[targetType][targetName] = [];
    byType[targetType][targetName].push(f);
  }

  const typeOrder = ['tool', 'prompt', 'resource', 'server', 'packet'];
  const sortedTypes = typeOrder.filter((t) => byType[t] && Object.keys(byType[t]).length > 0);

  if (sortedTypes.length === 0) {
    return (
      <div
        style={{
          background: colors.bgCard,
          borderRadius: '8px',
          border: `1px solid ${colors.borderLight}`,
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '13px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
            margin: 0,
          }}
        >
          No findings yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      {sortedTypes.map((targetType) => (
        <TargetTypeSection
          key={targetType}
          targetType={targetType}
          targets={byType[targetType]}
          selectedFinding={selectedFinding}
          onSelectFinding={onSelectFinding}
        />
      ))}
    </div>
  );
}

export default TargetView;
