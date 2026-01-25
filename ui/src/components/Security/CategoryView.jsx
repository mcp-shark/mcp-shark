import {
  IconChevronDown,
  IconChevronRight,
  IconRobot,
  IconShield,
  IconShieldLock,
} from '@tabler/icons-react';
import { useState } from 'react';
import { colors, fonts } from '../../theme';
import FindingCard from './FindingCard.jsx';

const CATEGORIES = {
  'owasp-mcp': {
    id: 'owasp-mcp',
    name: 'OWASP MCP Top 10',
    description: 'Model Context Protocol vulnerabilities',
    icon: IconShieldLock,
    color: colors.accentPurple,
  },
  'agentic-security': {
    id: 'agentic-security',
    name: 'Agentic Security',
    description: 'AI agent behavioral issues',
    icon: IconRobot,
    color: colors.accentBlue,
  },
  'general-security': {
    id: 'general-security',
    name: 'General Security',
    description: 'Common vulnerabilities',
    icon: IconShield,
    color: colors.accentGreen,
  },
};

const OWASP_CATEGORY_MAP = {
  MCP01: 'owasp-mcp',
  MCP02: 'owasp-mcp',
  MCP03: 'owasp-mcp',
  MCP04: 'owasp-mcp',
  MCP05: 'owasp-mcp',
  MCP06: 'owasp-mcp',
  MCP07: 'owasp-mcp',
  MCP08: 'owasp-mcp',
  MCP09: 'owasp-mcp',
  MCP10: 'owasp-mcp',
  ASI01: 'agentic-security',
  ASI02: 'agentic-security',
  ASI03: 'agentic-security',
  ASI04: 'agentic-security',
  ASI05: 'agentic-security',
  ASI06: 'agentic-security',
  ASI07: 'agentic-security',
  ASI08: 'agentic-security',
  ASI09: 'agentic-security',
  ASI10: 'agentic-security',
};

const OWASP_DESCRIPTIONS = {
  MCP01: 'Token Mismanagement',
  MCP02: 'Scope Creep',
  MCP03: 'Tool Poisoning',
  MCP04: 'Supply Chain',
  MCP05: 'Command Injection',
  MCP06: 'Prompt Injection',
  MCP07: 'Insufficient Auth',
  MCP08: 'Lack of Audit',
  MCP09: 'Shadow Servers',
  MCP10: 'Context Injection',
  ASI01: 'Goal Hijack',
  ASI02: 'Tool Misuse',
  ASI03: 'Identity Abuse',
  ASI04: 'Supply Chain',
  ASI05: 'Remote Code Execution',
  ASI06: 'Memory Poisoning',
  ASI07: 'Insecure Communication',
  ASI08: 'Cascading Failures',
  ASI09: 'Trust Exploitation',
  ASI10: 'Rogue Agent',
  SECRET: 'Hardcoded Secrets',
  'CMD-INJ': 'Command Injection',
  SHADOW: 'Cross-Server Shadowing',
  AMBIG: 'Tool Name Ambiguity',
};

const SEVERITY_COLORS = {
  critical: colors.error,
  high: '#ea580c',
  medium: '#b45309',
  low: colors.accentBlue,
  info: colors.textTertiary,
};

function getCategory(finding) {
  const owaspId = finding.owasp_id?.toUpperCase();
  if (owaspId && OWASP_CATEGORY_MAP[owaspId]) {
    return OWASP_CATEGORY_MAP[owaspId];
  }
  return 'general-security';
}

function OwaspGroup({ owaspId, findings, selectedFinding, onSelectFinding }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const description = OWASP_DESCRIPTIONS[owaspId] || owaspId;

  const severityCounts = findings.reduce((acc, f) => {
    acc[f.severity || 'info'] = (acc[f.severity || 'info'] || 0) + 1;
    return acc;
  }, {});

  const severities = ['critical', 'high', 'medium', 'low', 'info'];
  const highestSeverity = severities.find((s) => severityCounts[s] > 0) || 'info';

  return (
    <div
      style={{
        marginBottom: '6px',
        background: colors.bgCard,
        borderRadius: '6px',
        border: `1px solid ${colors.borderLight}`,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderLeft: `3px solid ${SEVERITY_COLORS[highestSeverity]}`,
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.bgTertiary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        {isExpanded ? (
          <IconChevronDown size={12} color={colors.textTertiary} />
        ) : (
          <IconChevronRight size={12} color={colors.textTertiary} />
        )}

        <span
          style={{
            padding: '2px 6px',
            background: colors.bgTertiary,
            color: colors.textSecondary,
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            fontFamily: fonts.mono,
          }}
        >
          {owaspId}
        </span>

        <span
          style={{
            flex: 1,
            fontSize: '12px',
            color: colors.textPrimary,
            fontFamily: fonts.body,
          }}
        >
          {description}
        </span>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {severities.map(
            (sev) =>
              severityCounts[sev] > 0 && (
                <span
                  key={sev}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    fontSize: '10px',
                    color: SEVERITY_COLORS[sev],
                    fontWeight: '500',
                  }}
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: SEVERITY_COLORS[sev],
                    }}
                  />
                  {severityCounts[sev]}
                </span>
              )
          )}
        </div>

        <span
          style={{
            padding: '2px 6px',
            background: colors.bgTertiary,
            borderRadius: '8px',
            fontSize: '10px',
            color: colors.textSecondary,
            fontWeight: '500',
          }}
        >
          {findings.length}
        </span>
      </button>

      {isExpanded && (
        <div
          style={{
            padding: '10px',
            paddingLeft: '24px',
            background: colors.bgTertiary,
            borderTop: `1px solid ${colors.borderLight}`,
          }}
        >
          {findings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              isExpanded={selectedFinding?.id === finding.id}
              onToggle={() => onSelectFinding(selectedFinding?.id === finding.id ? null : finding)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategorySection({ category, findings, selectedFinding, onSelectFinding }) {
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

function CategoryView({ findings, selectedFinding, onSelectFinding }) {
  const byCategory = findings.reduce((acc, finding) => {
    const cat = getCategory(finding);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(finding);
    return acc;
  }, {});

  const categoryOrder = ['owasp-mcp', 'agentic-security', 'general-security'];
  const sortedCategories = categoryOrder.filter((cat) => byCategory[cat]?.length > 0);

  if (sortedCategories.length === 0) {
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
      {sortedCategories.map((cat) => (
        <CategorySection
          key={cat}
          category={cat}
          findings={byCategory[cat]}
          selectedFinding={selectedFinding}
          onSelectFinding={onSelectFinding}
        />
      ))}
    </div>
  );
}

export default CategoryView;
