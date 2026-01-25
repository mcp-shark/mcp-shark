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
 * Severity Distribution Pie Chart
 */
export function SeverityPieChart({ findings }) {
  const severityCounts = findings.reduce((acc, f) => {
    const sev = f.severity || 'info';
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(severityCounts)
    .filter(([, count]) => count > 0)
    .map(([severity, count]) => ({
      name: severity.charAt(0).toUpperCase() + severity.slice(1),
      value: count,
      itemStyle: { color: SEVERITY_COLORS[severity] },
    }));

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: colors.bgCard,
      borderColor: colors.borderLight,
      textStyle: {
        color: colors.textPrimary,
        fontFamily: fonts.body,
      },
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        color: colors.textSecondary,
        fontFamily: fonts.body,
        fontSize: 12,
      },
    },
    series: [
      {
        name: 'Severity',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: colors.bgCard,
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}',
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: fonts.body,
          color: '#fff',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
        data,
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
      <ReactECharts option={option} style={{ height: '200px' }} />
    </div>
  );
}

/**
 * Category Distribution Bar Chart
 */
export function CategoryBarChart({ findings }) {
  const categoryCounts = findings.reduce((acc, f) => {
    const cat = getCategory(f);
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryNames = {
    'owasp-mcp': 'OWASP MCP',
    'agentic-security': 'Agentic Security',
    'general-security': 'General Security',
  };

  const categories = ['owasp-mcp', 'agentic-security', 'general-security'];
  const data = categories.map((cat) => ({
    name: categoryNames[cat],
    value: categoryCounts[cat] || 0,
    itemStyle: { color: CATEGORY_COLORS[cat] },
  }));

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
      data: data.map((d) => d.name),
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
        data: data.map((d) => ({
          value: d.value,
          itemStyle: d.itemStyle,
        })),
        barWidth: '50%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          color: colors.textSecondary,
          fontFamily: fonts.body,
          fontSize: 12,
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
        By Category
      </h4>
      <ReactECharts option={option} style={{ height: '200px' }} />
    </div>
  );
}

/**
 * OWASP ID Breakdown Horizontal Bar Chart
 */
export function OwaspBreakdownChart({ findings }) {
  const owaspCounts = findings.reduce((acc, f) => {
    const owaspId = f.owasp_id || 'OTHER';
    acc[owaspId] = (acc[owaspId] || 0) + 1;
    return acc;
  }, {});

  // Sort by count descending, take top 10
  const sortedData = Object.entries(owaspCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const owaspIds = sortedData.map(([id]) => id);
  const counts = sortedData.map(([, count]) => count);

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
      right: '10%',
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
      data: owaspIds.reverse(),
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
        data: counts.reverse().map((count, idx) => ({
          value: count,
          itemStyle: { color: itemColors.reverse()[idx] },
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
        style={{ height: `${Math.max(200, sortedData.length * 30)}px` }}
      />
    </div>
  );
}

/**
 * Severity by Category Stacked Bar Chart
 */
export function SeverityByCategoryChart({ findings }) {
  const categoryNames = {
    'owasp-mcp': 'OWASP MCP',
    'agentic-security': 'Agentic',
    'general-security': 'General',
  };

  const categories = ['owasp-mcp', 'agentic-security', 'general-security'];
  const severities = ['critical', 'high', 'medium', 'low', 'info'];

  // Build data matrix
  const matrix = {};
  for (const cat of categories) {
    matrix[cat] = {};
    for (const sev of severities) {
      matrix[cat][sev] = 0;
    }
  }

  for (const f of findings) {
    const cat = getCategory(f);
    const sev = f.severity || 'info';
    if (matrix[cat] && matrix[cat][sev] !== undefined) {
      matrix[cat][sev]++;
    }
  }

  const series = severities.map((sev) => ({
    name: sev.charAt(0).toUpperCase() + sev.slice(1),
    type: 'bar',
    stack: 'total',
    emphasis: { focus: 'series' },
    itemStyle: { color: SEVERITY_COLORS[sev] },
    data: categories.map((cat) => matrix[cat][sev]),
  }));

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
    legend: {
      data: severities.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
      bottom: 0,
      textStyle: {
        color: colors.textSecondary,
        fontFamily: fonts.body,
        fontSize: 11,
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories.map((c) => categoryNames[c]),
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
    series,
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
        Severity by Category
      </h4>
      <ReactECharts option={option} style={{ height: '220px' }} />
    </div>
  );
}

/**
 * Target Type Radar Chart
 */
export function TargetTypeRadarChart({ findings }) {
  const targetTypes = ['tool', 'prompt', 'resource', 'server'];
  const targetCounts = findings.reduce((acc, f) => {
    const type = f.target_type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const maxValue = Math.max(...Object.values(targetCounts), 1);

  const option = {
    tooltip: {
      backgroundColor: colors.bgCard,
      borderColor: colors.borderLight,
      textStyle: {
        color: colors.textPrimary,
        fontFamily: fonts.body,
      },
    },
    radar: {
      indicator: targetTypes.map((type) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        max: maxValue,
      })),
      radius: '65%',
      axisName: {
        color: colors.textSecondary,
        fontFamily: fonts.body,
        fontSize: 11,
      },
      splitArea: {
        areaStyle: {
          color: [colors.bgSecondary, colors.bgCard],
        },
      },
      axisLine: { lineStyle: { color: colors.borderLight } },
      splitLine: { lineStyle: { color: colors.borderLight } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: targetTypes.map((type) => targetCounts[type] || 0),
            name: 'Findings',
            areaStyle: {
              color: `${colors.accent}30`,
            },
            lineStyle: {
              color: colors.accent,
              width: 2,
            },
            itemStyle: {
              color: colors.accent,
            },
          },
        ],
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
        By Target Type
      </h4>
      <ReactECharts option={option} style={{ height: '200px' }} />
    </div>
  );
}

/**
 * Main Security Dashboard with all charts
 */
export default function SecurityCharts({ findings }) {
  if (!findings || findings.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      <SeverityPieChart findings={findings} />
      <CategoryBarChart findings={findings} />
      <SeverityByCategoryChart findings={findings} />
      <TargetTypeRadarChart findings={findings} />
      <div style={{ gridColumn: 'span 2' }}>
        <OwaspBreakdownChart findings={findings} />
      </div>
    </div>
  );
}
