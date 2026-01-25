import ReactECharts from 'echarts-for-react';
import { colors, fonts } from '../../../theme.js';
import { ChartCard } from './ChartCard.jsx';
import { SEVERITY_COLORS } from './constants.js';

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
