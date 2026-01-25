import ReactECharts from 'echarts-for-react';
import { colors, fonts } from '../../theme';

// Consistent color palette matching theme
const SEVERITY_COLORS = {
  critical: colors.error,
  high: '#ea580c',
  medium: '#b45309',
  low: colors.accentBlue,
  info: colors.textTertiary,
};

const CATEGORY_COLORS = {
  'owasp-mcp': colors.accentPurple,
  'agentic-security': colors.accentBlue,
  'general-security': colors.accentGreen,
};

const CATEGORY_NAMES = {
  'owasp-mcp': 'OWASP MCP',
  'agentic-security': 'Agentic',
  'general-security': 'General',
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

function ChartCard({ title, children, height = '180px' }) {
  return (
    <div
      style={{
        background: colors.bgCard,
        borderRadius: '8px',
        border: `1px solid ${colors.borderLight}`,
        padding: '14px',
        boxShadow: `0 1px 3px ${colors.shadowSm}`,
      }}
    >
      <h4
        style={{
          fontSize: '10px',
          fontWeight: '600',
          color: colors.textTertiary,
          fontFamily: fonts.body,
          margin: '0 0 10px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </h4>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

/**
 * Severity Distribution Bar Chart
 */
export function SeverityDistributionChart({ findings }) {
  const severityCounts = findings.reduce((acc, f) => {
    const sev = f.severity || 'info';
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {});

  const severities = ['critical', 'high', 'medium', 'low', 'info'];
  const labels = ['Critical', 'High', 'Medium', 'Low', 'Info'];
  const data = severities.map((sev) => severityCounts[sev] || 0);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: colors.bgCard,
      borderColor: colors.borderLight,
      textStyle: { color: colors.textPrimary, fontFamily: fonts.body, fontSize: 11 },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { color: colors.textSecondary, fontFamily: fonts.body, fontSize: 10 },
      axisLine: { lineStyle: { color: colors.borderLight } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: colors.textTertiary, fontFamily: fonts.body, fontSize: 10 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: colors.borderLight, type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        data: data.map((count, idx) => ({
          value: count,
          itemStyle: { color: SEVERITY_COLORS[severities[idx]] },
        })),
        barWidth: '50%',
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        label: {
          show: true,
          position: 'top',
          color: colors.textTertiary,
          fontFamily: fonts.body,
          fontSize: 10,
          formatter: (params) => (params.value > 0 ? params.value : ''),
        },
      },
    ],
  };

  return (
    <ChartCard title="Severity Distribution">
      <ReactECharts option={option} style={{ height: '100%' }} />
    </ChartCard>
  );
}

/**
 * Top Vulnerability Types Chart
 */
export function TopVulnerabilityTypesChart({ findings }) {
  const owaspCounts = findings.reduce((acc, f) => {
    const owaspId = f.owasp_id || 'OTHER';
    acc[owaspId] = (acc[owaspId] || 0) + 1;
    return acc;
  }, {});

  const sortedData = Object.entries(owaspCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const owaspIds = sortedData.map(([id]) => id).reverse();
  const counts = sortedData.map(([, count]) => count).reverse();
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
      textStyle: { color: colors.textPrimary, fontFamily: fonts.body, fontSize: 11 },
    },
    grid: { left: '3%', right: '12%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: colors.textTertiary, fontFamily: fonts.body, fontSize: 10 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: colors.borderLight, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: owaspIds,
      axisLabel: { color: colors.textSecondary, fontFamily: fonts.mono, fontSize: 10 },
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
        itemStyle: { borderRadius: [0, 3, 3, 0] },
        label: {
          show: true,
          position: 'right',
          color: colors.textTertiary,
          fontFamily: fonts.body,
          fontSize: 10,
        },
      },
    ],
  };

  const chartHeight = Math.max(160, sortedData.length * 22);

  return (
    <ChartCard title="Top Vulnerability Types" height={`${chartHeight}px`}>
      <ReactECharts option={option} style={{ height: '100%' }} />
    </ChartCard>
  );
}

/**
 * Sankey Flow Chart
 */
export function SankeyChart({ findings }) {
  const nodes = [];
  const links = [];
  const nodeSet = new Set();

  const categoryToOwasp = {};
  const owaspToSeverity = {};

  for (const f of findings) {
    const category = getCategory(f);
    const owaspId = f.owasp_id || 'OTHER';
    const severity = f.severity || 'info';

    const catOwaspKey = `${category}|${owaspId}`;
    categoryToOwasp[catOwaspKey] = (categoryToOwasp[catOwaspKey] || 0) + 1;

    const owaspSevKey = `${owaspId}|${severity}`;
    owaspToSeverity[owaspSevKey] = (owaspToSeverity[owaspSevKey] || 0) + 1;

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
        itemStyle: { color: CATEGORY_COLORS[cat] },
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
      textStyle: { color: colors.textPrimary, fontFamily: fonts.body, fontSize: 11 },
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        emphasis: { focus: 'adjacency' },
        nodeAlign: 'left',
        data: nodes,
        links,
        lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.25 },
        label: { color: colors.textSecondary, fontFamily: fonts.body, fontSize: 10 },
        itemStyle: { borderWidth: 0 },
      },
    ],
  };

  return (
    <ChartCard title="Findings Flow" height="200px">
      <ReactECharts option={option} style={{ height: '100%' }} />
    </ChartCard>
  );
}

/**
 * Main Dashboard
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
        gap: '12px',
        marginBottom: '16px',
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
