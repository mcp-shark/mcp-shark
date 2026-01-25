import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import { colors, fonts } from '../../../theme.js';
import { OwaspGroup } from './OwaspGroup.jsx';
import { CATEGORIES } from './constants.js';

export function CategorySection({ category, findings, selectedFinding, onSelectFinding }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const categoryInfo = CATEGORIES[category];
  const Icon = categoryInfo.icon;

  const byOwaspId = findings.reduce((acc, finding) => {
    const owaspId = finding.owasp_id || 'OTHER';
    if (!acc[owaspId]) acc[owaspId] = [];
    acc[owaspId].push(finding);
    return acc;
  }, {});

  const sortedOwaspIds = Object.keys(byOwaspId).sort((a, b) => {
    const aNum = Number.parseInt(a.replace(/\D/g, ''), 10) || 999;
    const bNum = Number.parseInt(b.replace(/\D/g, ''), 10) || 999;
    return aNum - bNum;
  });

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
            background: `${categoryInfo.color}15`,
            border: `1px solid ${categoryInfo.color}30`,
          }}
        >
          <Icon size={16} color={categoryInfo.color} stroke={1.5} />
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
            {categoryInfo.name}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: colors.textTertiary,
              fontFamily: fonts.body,
            }}
          >
            {categoryInfo.description}
          </div>
        </div>

        <div style={{ textAlign: 'right', marginRight: '6px' }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: categoryInfo.color,
              lineHeight: 1,
            }}
          >
            {findings.length}
          </div>
          <div style={{ fontSize: '10px', color: colors.textTertiary }}>
            {findings.length === 1 ? 'finding' : 'findings'}
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
          {sortedOwaspIds.map((owaspId) => (
            <OwaspGroup
              key={owaspId}
              owaspId={owaspId}
              findings={byOwaspId[owaspId]}
              selectedFinding={selectedFinding}
              onSelectFinding={onSelectFinding}
            />
          ))}
        </div>
      )}
    </div>
  );
}
