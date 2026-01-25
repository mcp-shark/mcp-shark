import ReactECharts from 'echarts-for-react';
import { colors, fonts } from '../../../theme.js';
import { ChartCard } from './ChartCard.jsx';
import {
  CATEGORY_COLORS,
  CATEGORY_NAMES,
  OWASP_CATEGORY_MAP,
  SEVERITY_COLORS,
  getCategory,
} from './constants.js';

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
