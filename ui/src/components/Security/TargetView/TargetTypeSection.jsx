import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import { colors, fonts } from '../../../theme.js';
import { TargetGroup } from './TargetGroup.jsx';
import { TARGET_TYPE_CONFIG } from './constants.js';

export function TargetTypeSection({ targetType, targets, selectedFinding, onSelectFinding }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const typeConfig = TARGET_TYPE_CONFIG[targetType] || TARGET_TYPE_CONFIG.tool;
  const Icon = typeConfig.icon;

  const totalFindings = Object.values(targets).reduce((sum, arr) => sum + arr.length, 0);
  const targetCount = Object.keys(targets).length;

  return (
    <div style={{ marginBottom: '16px' }}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 14px',
          width: '100%',
          background: colors.bgCard,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '8px',
          cursor: 'pointer',
          textAlign: 'left',
          marginBottom: isExpanded ? '10px' : 0,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.bgTertiary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = colors.bgCard;
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: `${typeConfig.color}15`,
            border: `1px solid ${typeConfig.color}30`,
          }}
        >
          <Icon size={16} color={typeConfig.color} stroke={1.5} />
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: '500',
              color: colors.textPrimary,
              fontFamily: fonts.body,
            }}
          >
            {typeConfig.label}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: colors.textTertiary,
              fontFamily: fonts.body,
            }}
          >
            {targetCount} {targetCount === 1 ? 'target' : 'targets'} with issues
          </div>
        </div>

        <div style={{ textAlign: 'right', marginRight: '6px' }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: typeConfig.color,
              lineHeight: 1,
            }}
          >
            {totalFindings}
          </div>
          <div style={{ fontSize: '10px', color: colors.textTertiary }}>
            {totalFindings === 1 ? 'finding' : 'findings'}
          </div>
        </div>

        {isExpanded ? (
          <IconChevronDown size={16} color={colors.textTertiary} />
        ) : (
          <IconChevronRight size={16} color={colors.textTertiary} />
        )}
      </button>

      {isExpanded && (
        <div style={{ marginLeft: '10px' }}>
          {Object.entries(targets)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([targetName, findings]) => (
              <TargetGroup
                key={targetName}
                targetName={targetName}
                targetType={targetType}
                findings={findings}
                selectedFinding={selectedFinding}
                onSelectFinding={onSelectFinding}
              />
            ))}
        </div>
      )}
    </div>
  );
}
