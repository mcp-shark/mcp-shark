import {
  IconAlertCircle,
  IconAlertTriangle,
  IconChevronDown,
  IconChevronRight,
  IconCode,
  IconInfoCircle,
  IconServer,
  IconTool,
} from '@tabler/icons-react';
import { useState } from 'react';
import { colors, fonts } from '../../theme';
import FindingCard from './FindingCard.jsx';

const SEVERITY_CONFIG = {
  critical: { color: '#dc2626', icon: IconAlertCircle },
  high: { color: '#ea580c', icon: IconAlertTriangle },
  medium: { color: '#ca8a04', icon: IconAlertTriangle },
  low: { color: '#2563eb', icon: IconInfoCircle },
  info: { color: '#6b7280', icon: IconInfoCircle },
};

const TARGET_TYPE_CONFIG = {
  tool: {
    icon: IconTool,
    color: '#8b5cf6',
    label: 'Tools',
  },
  prompt: {
    icon: IconCode,
    color: '#06b6d4',
    label: 'Prompts',
  },
  resource: {
    icon: IconServer,
    color: '#10b981',
    label: 'Resources',
  },
  server: {
    icon: IconServer,
    color: '#f59e0b',
    label: 'Servers',
  },
  packet: {
    icon: IconServer,
    color: '#ec4899',
    label: 'Network Traffic',
  },
};

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

function TargetGroup({ targetName, targetType, findings, selectedFinding, onSelectFinding }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const typeConfig = TARGET_TYPE_CONFIG[targetType] || TARGET_TYPE_CONFIG.tool;
  const Icon = typeConfig.icon;

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
      {/* Target Header */}
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

        {/* Target type icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: `${typeConfig.color}15`,
            flexShrink: 0,
          }}
        >
          <Icon size={14} color={typeConfig.color} />
        </div>

        {/* Target name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: colors.textPrimary,
              fontFamily: fonts.mono,
            }}
          >
            {targetName}
          </span>
          <span
            style={{
              marginLeft: '8px',
              fontSize: '11px',
              color: colors.textTertiary,
              fontFamily: fonts.body,
            }}
          >
            {targetType}
          </span>
        </div>

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
            paddingLeft: '52px',
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

function TargetTypeSection({ targetType, targets, selectedFinding, onSelectFinding }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const typeConfig = TARGET_TYPE_CONFIG[targetType] || TARGET_TYPE_CONFIG.tool;
  const Icon = typeConfig.icon;

  const totalFindings = Object.values(targets).reduce((sum, arr) => sum + arr.length, 0);
  const targetCount = Object.keys(targets).length;

  const ChevronIcon = isExpanded ? IconChevronDown : IconChevronRight;

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Type Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          background: `linear-gradient(135deg, ${typeConfig.color}15, ${typeConfig.color}08)`,
          border: `1px solid ${typeConfig.color}30`,
          borderRadius: '12px',
          cursor: 'pointer',
          marginBottom: isExpanded ? '12px' : 0,
          transition: 'all 0.2s ease',
          width: '100%',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${typeConfig.color}50`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = `${typeConfig.color}30`;
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
            background: `${typeConfig.color}20`,
            flexShrink: 0,
          }}
        >
          <Icon size={20} color={typeConfig.color} />
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
            {typeConfig.label}
          </h3>
          <p
            style={{
              fontSize: '12px',
              color: colors.textSecondary,
              fontFamily: fonts.body,
              margin: 0,
            }}
          >
            {targetCount} {targetCount === 1 ? 'target' : 'targets'} with issues
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: typeConfig.color,
              fontFamily: fonts.body,
              lineHeight: 1,
            }}
          >
            {totalFindings}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: colors.textSecondary,
              fontFamily: fonts.body,
            }}
          >
            {totalFindings === 1 ? 'finding' : 'findings'}
          </div>
        </div>

        <ChevronIcon size={20} color={colors.textSecondary} />
      </button>

      {/* Target groups */}
      {isExpanded && (
        <div style={{ marginLeft: '16px' }}>
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

function TargetView({ findings, selectedFinding, onSelectFinding }) {
  // Group findings by target type, then by target name
  const byType = {};

  for (const f of findings) {
    const targetType = f.target_type || 'tool';
    const targetName = f.target_name || 'Unknown';

    if (!byType[targetType]) {
      byType[targetType] = {};
    }
    if (!byType[targetType][targetName]) {
      byType[targetType][targetName] = [];
    }
    byType[targetType][targetName].push(f);
  }

  // Order: tools first, then prompts, resources, servers, packets
  const typeOrder = ['tool', 'prompt', 'resource', 'server', 'packet'];
  const sortedTypes = typeOrder.filter((t) => byType[t] && Object.keys(byType[t]).length > 0);

  if (sortedTypes.length === 0) {
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
