import ReactECharts from 'echarts-for-react';
import { colors, fonts } from '../../theme';

// Severity configuration
const SEVERITY_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#2563eb',
  info: '#6b7280',
};

const CATEGORY_COLORS = {
  'owasp-mcp': '#7c3aed',
  'agentic-security': '#0891b2',
  'general-security': '#059669',
};

const CATEGORY_NAMES = {
  'owasp-mcp': 'OWASP MCP',
  'agentic-security': 'Agentic Security',
  'general-security': 'General Security',
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

function getCategory(finding) {
  const owaspId = finding.owasp_id?.toUpperCase();
  if (owaspId && OWASP_CATEGORY_MAP[owaspId]) {
    return OWASP_CATEGORY_MAP[owaspId];
  }
  return 'general-security';
}

/**
 * Severity Distribution - Vertical Bar Chart
 */
export function SeverityDistributionChart({ findings }) {
  const severityCounts = findings.reduce((acc, f) => {
    const sev = f.severity || 'info';
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {});

  const severities = ['critical', 'high', 'medium', 'low', 'info'];
  const severityLabels = ['Critical', 'High', 'Medium', 'Low', 'Info'];
  const severityData = severities.map((sev) => severityCounts[sev] || 0);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: colors.bgCard,
      borderColor: colors.borderLight,
      textStyle: {
        color: colors.textPrimary,
        fontFamily: fonts.body,
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: severityLabels,
      axisLabel: {
        color: colors.textSecondary,
        fontFamily: fonts.body,
        fontSize: 11,
      },
      axisLine: { lineStyle: { color: colors.borderLight } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: colors.textSecondary,
        fontFamily: fonts.body,
        fontSize: 11,
      },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: colors.borderLight, type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        data: severityData.map((count, idx) => ({
          value: count,
          itemStyle: { color: SEVERITY_COLORS[severities[idx]] },
        })),
        barWidth: '50%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          color: colors.textSecondary,
          fontFamily: fonts.body,
          fontSize: 12,
          fontWeight: 'bold',
          formatter: (params) => (params.value > 0 ? params.value : ''),
        },
      },
    ],
  };

  return (
    <div
      style={{
        background: colors.bgCard,
        borderRadius: '12px',
        border: `1px solid ${colors.borderLight}`,
        padding: '16px',
      }}
    >
      <h4
        style={{
          fontSize: '13px',
          fontWeight: '600',
          color: colors.textSecondary,
          fontFamily: fonts.body,
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Severity Distribution
      </h4>
      <ReactECharts option={option} style={{ height: '220px' }} />
    </div>
  );
}

/**
 * Top Vulnerability Types - Horizontal Bar Chart
 */
export function TopVulnerabilityTypesChart({ findings }) {
  const owaspCounts = findings.reduce((acc, f) => {
    const owaspId = f.owasp_id || 'OTHER';
    acc[owaspId] = (acc[owaspId] || 0) + 1;
    return acc;
  }, {});

  // Sort by count descending, take top 10
  const sortedData = Object.entries(owaspCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const owaspIds = sortedData.map(([id]) => id).reverse();
  const counts = sortedData.map(([, count]) => count).reverse();

  // Color by category
  const itemColors = owaspIds.map((id) => {
    const cat = OWASP_CATEGORY_MAP[id] || 'general-security';
    return CATEGORY_COLORS[cat];
  });

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: colors.bgCard,
      borderColor: colors.borderLight,
      textStyle: {
        color: colors.textPrimary,
        fontFamily: fonts.body,
      },
    },
    grid: {
      left: '3%',
      right: '12%',
      bottom: '3%',
      top: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: colors.textSecondary,
        fontFamily: fonts.body,
        fontSize: 11,
      },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: colors.borderLight, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: owaspIds,
      axisLabel: {
        color: colors.textSecondary,
        fontFamily: fonts.mono,
        fontSize: 11,
        fontWeight: 'bold',
      },
      axisLine: { lineStyle: { color: colors.borderLight } },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: counts.map((count, idx) => ({
          value: count,
          itemStyle: { color: itemColors[idx] },
        })),
        barWidth: '60%',
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: 'right',
          color: colors.textSecondary,
          fontFamily: fonts.body,
          fontSize: 11,
          fontWeight: 'bold',
        },
      },
    ],
  };

  return (
    <div
      style={{
        background: colors.bgCard,
        borderRadius: '12px',
        border: `1px solid ${colors.borderLight}`,
        padding: '16px',
      }}
    >
      <h4
        style={{
          fontSize: '13px',
          fontWeight: '600',
          color: colors.textSecondary,
          fontFamily: fonts.body,
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Top Vulnerability Types
      </h4>
      <ReactECharts
        option={option}
        style={{ height: `${Math.max(200, sortedData.length * 28)}px` }}
      />
    </div>
  );
}

/**
 * Sankey Diagram - Flow from Category → OWASP ID → Severity
 */
export function SankeyChart({ findings }) {
  // Build nodes and links for Sankey
  const nodes = [];
  const links = [];
  const nodeSet = new Set();

  // Collect unique categories, OWASP IDs, and severities
  const categoryToOwasp = {};
  const owaspToSeverity = {};

  for (const f of findings) {
    const category = getCategory(f);
    const owaspId = f.owasp_id || 'OTHER';
    const severity = f.severity || 'info';

    // Category -> OWASP
    const catOwaspKey = `${category}|${owaspId}`;
    categoryToOwasp[catOwaspKey] = (categoryToOwasp[catOwaspKey] || 0) + 1;

    // OWASP -> Severity
    const owaspSevKey = `${owaspId}|${severity}`;
    owaspToSeverity[owaspSevKey] = (owaspToSeverity[owaspSevKey] || 0) + 1;

    // Add nodes
    if (!nodeSet.has(category)) {
      nodeSet.add(category);
      nodes.push({
        name: CATEGORY_NAMES[category] || category,
        itemStyle: { color: CATEGORY_COLORS[category] },
      });
    }
    if (!nodeSet.has(owaspId)) {
      nodeSet.add(owaspId);
      const cat = OWASP_CATEGORY_MAP[owaspId] || 'general-security';
      nodes.push({
        name: owaspId,
        itemStyle: { color: `${CATEGORY_COLORS[cat]}99` },
      });
    }
    if (!nodeSet.has(severity)) {
      nodeSet.add(severity);
      nodes.push({
        name: severity.charAt(0).toUpperCase() + severity.slice(1),
        itemStyle: { color: SEVERITY_COLORS[severity] },
      });
    }
  }

  // Create links
  for (const [key, value] of Object.entries(categoryToOwasp)) {
    const [category, owaspId] = key.split('|');
    links.push({
      source: CATEGORY_NAMES[category] || category,
      target: owaspId,
      value,
    });
  }

  for (const [key, value] of Object.entries(owaspToSeverity)) {
    const [owaspId, severity] = key.split('|');
    links.push({
      source: owaspId,
      target: severity.charAt(0).toUpperCase() + severity.slice(1),
      value,
    });
  }

  const option = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      backgroundColor: colors.bgCard,
      borderColor: colors.borderLight,
      textStyle: {
        color: colors.textPrimary,
        fontFamily: fonts.body,
      },
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        emphasis: {
          focus: 'adjacency',
        },
        nodeAlign: 'left',
        data: nodes,
        links,
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
          opacity: 0.4,
        },
        label: {
          color: colors.textPrimary,
          fontFamily: fonts.body,
          fontSize: 11,
        },
        itemStyle: {
          borderWidth: 0,
        },
      },
    ],
  };

  return (
    <div
      style={{
        background: colors.bgCard,
        borderRadius: '12px',
        border: `1px solid ${colors.borderLight}`,
        padding: '16px',
      }}
    >
      <h4
        style={{
          fontSize: '13px',
          fontWeight: '600',
          color: colors.textSecondary,
          fontFamily: fonts.body,
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Findings Flow (Category → Type → Severity)
      </h4>
      <ReactECharts option={option} style={{ height: '280px' }} />
    </div>
  );
}

/**
 * Main Security Dashboard with selected charts
 */
export default function SecurityCharts({ findings }) {
  if (!findings || findings.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      <SeverityDistributionChart findings={findings} />
      <TopVulnerabilityTypesChart findings={findings} />
      <div style={{ gridColumn: 'span 2' }}>
        <SankeyChart findings={findings} />
      </div>
    </div>
  );
}
