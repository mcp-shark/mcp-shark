import { useCallback } from 'react';
import { colors, fonts } from '../../../theme.js';
import { TargetTypeSection } from './TargetTypeSection.jsx';
import { TARGET_TYPE_CONFIG } from './constants.js';

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

  const scrollToType = useCallback((typeId) => {
    const element = document.getElementById(`target-type-${typeId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Count findings per type
  const getTypeCount = (type) => {
    if (!byType[type]) return 0;
    return Object.values(byType[type]).reduce((sum, arr) => sum + arr.length, 0);
  };

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
      {/* Quick Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        {sortedTypes.map((type) => {
          const config = TARGET_TYPE_CONFIG[type];
          const Icon = config.icon;
          return (
            <button
              key={type}
              type="button"
              onClick={() => scrollToType(type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: `${config.color}10`,
                border: `1px solid ${config.color}30`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: fonts.body,
                fontSize: '12px',
                color: config.color,
                fontWeight: 500,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${config.color}20`;
                e.currentTarget.style.borderColor = `${config.color}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${config.color}10`;
                e.currentTarget.style.borderColor = `${config.color}30`;
              }}
            >
              <Icon size={14} stroke={1.5} />
              {config.label}
              <span
                style={{
                  background: config.color,
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '10px',
                  fontWeight: 600,
                }}
              >
                {getTypeCount(type)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Target Type Sections */}
      {sortedTypes.map((targetType) => (
        <div key={targetType} id={`target-type-${targetType}`}>
          <TargetTypeSection
            targetType={targetType}
            targets={byType[targetType]}
            selectedFinding={selectedFinding}
            onSelectFinding={onSelectFinding}
          />
        </div>
      ))}
    </div>
  );
}

export default TargetView;
