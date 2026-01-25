import {
  IconAlertCircle,
  IconAlertTriangle,
  IconChevronDown,
  IconChevronRight,
  IconInfoCircle,
  IconRobot,
  IconShield,
  IconShieldLock,
} from '@tabler/icons-react';
import { useState } from 'react';
import { colors, fonts } from '../../theme';
import FindingCard from './FindingCard.jsx';

// Category definitions
const CATEGORIES = {
  'owasp-mcp': {
    id: 'owasp-mcp',
    name: 'OWASP MCP Top 10',
    description: 'Model Context Protocol security vulnerabilities',
    icon: IconShieldLock,
    color: '#7c3aed',
    prefix: 'MCP',
  },
  'agentic-security': {
    id: 'agentic-security',
    name: 'Agentic Security',
    description: 'AI agent behavioral security issues',
    icon: IconRobot,
    color: '#0891b2',
    prefix: 'ASI',
  },
  'general-security': {
    id: 'general-security',
    name: 'General Security',
    description: 'Common security vulnerabilities',
    icon: IconShield,
    color: '#059669',
    prefix: null,
  },
};

// OWASP ID to category mapping
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

// OWASP ID descriptions
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
  CMD_INJ: 'Command Injection',
  SHADOW: 'Cross-Server Shadowing',
  AMBIG: 'Tool Name Ambiguity',
};

const SEVERITY_CONFIG = {
  critical: { color: '#dc2626', icon: IconAlertCircle },
  high: { color: '#ea580c', icon: IconAlertTriangle },
  medium: { color: '#ca8a04', icon: IconAlertTriangle },
  low: { color: '#2563eb', icon: IconInfoCircle },
  info: { color: '#6b7280', icon: IconInfoCircle },
};

function getCategory(finding) {
  const owaspId = finding.owasp_id?.toUpperCase();
  if (owaspId && OWASP_CATEGORY_MAP[owaspId]) {
    return OWASP_CATEGORY_MAP[owaspId];
  }
  return 'general-security';
}

function SeverityDot({ severity }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  return (
    <span
      style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: config.color,
      }}
    />
  );
}

function OwaspGroup({ owaspId, findings, selectedFinding, onSelectFinding }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const description = OWASP_DESCRIPTIONS[owaspId] || owaspId;

  // Count by severity
  const severityCounts = findings.reduce((acc, f) => {
    const sev = f.severity || 'info';
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {});

  // Get highest severity
  const severities = ['critical', 'high', 'medium', 'low', 'info'];
  const highestSeverity = severities.find((s) => severityCounts[s] > 0) || 'info';
  const severityConfig = SEVERITY_CONFIG[highestSeverity];

  const ChevronIcon = isExpanded ? IconChevronDown : IconChevronRight;

  return (
    <div
      style={{
        marginBottom: '8px',
        background: colors.bgCard,
        borderRadius: '10px',
        border: `1px solid ${colors.borderLight}`,
        overflow: 'hidden',
      }}
    >
      {/* OWASP Group Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          cursor: 'pointer',
          borderLeft: `3px solid ${severityConfig.color}`,
          transition: 'background 0.15s ease',
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderLeftWidth: '3px',
          borderLeftStyle: 'solid',
          borderLeftColor: severityConfig.color,
          textAlign: 'left',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.bgSecondary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <ChevronIcon size={16} color={colors.textSecondary} />

        {/* OWASP ID Badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 8px',
            background: `${severityConfig.color}15`,
            color: severityConfig.color,
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            fontFamily: fonts.mono,
          }}
        >
          {owaspId}
        </span>

        {/* Description */}
        <span
          style={{
            flex: 1,
            fontSize: '13px',
            fontWeight: '500',
            color: colors.textPrimary,
            fontFamily: fonts.body,
          }}
        >
          {description}
        </span>

        {/* Severity counts */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {severities.map(
            (sev) =>
              severityCounts[sev] > 0 && (
                <span
                  key={sev}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: SEVERITY_CONFIG[sev].color,
                    fontWeight: '600',
                    fontFamily: fonts.body,
                  }}
                >
                  <SeverityDot severity={sev} />
                  {severityCounts[sev]}
                </span>
              )
          )}
        </div>

        {/* Total count */}
        <span
          style={{
            padding: '2px 8px',
            background: colors.bgSecondary,
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: '600',
            color: colors.textSecondary,
            fontFamily: fonts.body,
          }}
        >
          {findings.length}
        </span>
      </button>

      {/* Expanded findings */}
      {isExpanded && (
        <div
          style={{
            padding: '12px 16px',
            paddingLeft: '28px',
            background: colors.bgSecondary,
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

  // Group findings by OWASP ID
  const byOwaspId = findings.reduce((acc, finding) => {
    const owaspId = finding.owasp_id || 'OTHER';
    if (!acc[owaspId]) acc[owaspId] = [];
    acc[owaspId].push(finding);
    return acc;
  }, {});

  // Sort OWASP IDs
  const sortedOwaspIds = Object.keys(byOwaspId).sort((a, b) => {
    // Sort by prefix first, then by number
    const aNum = Number.parseInt(a.replace(/\D/g, ''), 10) || 999;
    const bNum = Number.parseInt(b.replace(/\D/g, ''), 10) || 999;
    return aNum - bNum;
  });

  const ChevronIcon = isExpanded ? IconChevronDown : IconChevronRight;

  return (
    <div
      style={{
        marginBottom: '24px',
      }}
    >
      {/* Category Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          background: `linear-gradient(135deg, ${categoryInfo.color}15, ${categoryInfo.color}08)`,
          border: `1px solid ${categoryInfo.color}30`,
          borderRadius: '12px',
          cursor: 'pointer',
          marginBottom: isExpanded ? '12px' : 0,
          transition: 'all 0.2s ease',
          width: '100%',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${categoryInfo.color}50`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = `${categoryInfo.color}30`;
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `${categoryInfo.color}20`,
            flexShrink: 0,
          }}
        >
          <Icon size={20} color={categoryInfo.color} />
        </div>

        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: '600',
              color: colors.textPrimary,
              fontFamily: fonts.body,
              margin: 0,
            }}
          >
            {categoryInfo.name}
          </h3>
          <p
            style={{
              fontSize: '12px',
              color: colors.textSecondary,
              fontFamily: fonts.body,
              margin: 0,
            }}
          >
            {categoryInfo.description}
          </p>
        </div>

        {/* Issue type count */}
        <div
          style={{
            textAlign: 'right',
          }}
        >
          <div
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: categoryInfo.color,
              fontFamily: fonts.body,
              lineHeight: 1,
            }}
          >
            {findings.length}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: colors.textSecondary,
              fontFamily: fonts.body,
            }}
          >
            {findings.length === 1 ? 'finding' : 'findings'}
          </div>
        </div>

        <ChevronIcon size={20} color={colors.textSecondary} />
      </button>

      {/* OWASP Groups */}
      {isExpanded && (
        <div style={{ marginLeft: '16px' }}>
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
  // Group findings by category
  const byCategory = findings.reduce((acc, finding) => {
    const cat = getCategory(finding);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(finding);
    return acc;
  }, {});

  // Determine category order (those with findings first, then by priority)
  const categoryOrder = ['owasp-mcp', 'agentic-security', 'general-security'];
  const sortedCategories = categoryOrder.filter((cat) => byCategory[cat]?.length > 0);

  if (sortedCategories.length === 0) {
    return (
      <div
        style={{
          background: colors.bgCard,
          borderRadius: '12px',
          border: `1px solid ${colors.borderLight}`,
          padding: '48px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '16px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
          }}
        >
          No findings yet. Run a scan to detect vulnerabilities.
        </div>
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
