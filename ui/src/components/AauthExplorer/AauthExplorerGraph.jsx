import ReactECharts from 'echarts-for-react';
import { useMemo, useRef } from 'react';
import { colors, fonts } from '../../theme.js';

const CATEGORY_PALETTE = {
  agent: { color: '#1a73e8', symbolSize: 38, label: 'Agent' },
  mission: { color: '#e8710a', symbolSize: 32, label: 'Mission' },
  resource: { color: '#137333', symbolSize: 38, label: 'Resource' },
  signing: { color: '#9334e6', symbolSize: 28, label: 'Signing' },
  access: { color: '#b06000', symbolSize: 28, label: 'Access' },
};

const KIND_TO_LABEL = {
  calls: 'calls',
  pursues: 'pursues',
  targets: 'targets',
  'signs-with': 'signs with',
  requires: 'requires',
};

/**
 * Force-directed AAuth knowledge graph.
 *
 * Backed by GET /api/aauth/graph; nodes are colored by category and sized by
 * observed packet count. Clicking a node bubbles up so the parent can show a
 * detail panel with the underlying packets.
 */
export default function AauthExplorerGraph({ graph, onNodeSelect, selectedNodeId }) {
  const chartRef = useRef(null);

  const option = useMemo(() => {
    const categories = (graph?.categories || []).map((c) => ({
      name: c.label,
      itemStyle: { color: CATEGORY_PALETTE[c.id]?.color || '#888' },
    }));
    const categoryIndex = Object.fromEntries((graph?.categories || []).map((c, i) => [c.id, i]));

    const maxPackets = (graph?.nodes || []).reduce((m, n) => Math.max(m, n.packet_count || 0), 1);

    const data = (graph?.nodes || []).map((n) => {
      const palette = CATEGORY_PALETTE[n.category] || { symbolSize: 24, color: '#888' };
      const sizeBoost = Math.min(20, Math.round((n.packet_count / maxPackets) * 18));
      return {
        id: n.id,
        name: n.name,
        category: categoryIndex[n.category] ?? 0,
        symbolSize: palette.symbolSize + sizeBoost,
        value: n.packet_count,
        label: {
          show: true,
          formatter: shortenLabel(n.name, n.category),
          fontSize: 11,
          fontFamily: fonts.body,
          color: colors.textPrimary,
        },
        itemStyle: {
          color: palette.color,
          borderColor: n.id === selectedNodeId ? colors.textPrimary : 'transparent',
          borderWidth: n.id === selectedNodeId ? 3 : 0,
          shadowBlur: n.id === selectedNodeId ? 12 : 0,
          shadowColor: palette.color,
        },
        _raw: n,
      };
    });

    const links = (graph?.edges || []).map((e) => ({
      source: e.source,
      target: e.target,
      value: e.weight,
      lineStyle: {
        width: Math.max(1, Math.min(6, e.weight)),
        color: 'source',
        opacity: 0.55,
        curveness: 0.12,
      },
      label: {
        show: false,
        formatter: KIND_TO_LABEL[e.kind] || e.kind,
        fontSize: 10,
        color: colors.textTertiary,
      },
      _kind: e.kind,
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#fff',
        borderColor: colors.borderLight,
        textStyle: { color: colors.textPrimary, fontFamily: fonts.body, fontSize: 12 },
        formatter: (params) => {
          if (params.dataType === 'edge') {
            return `<strong>${KIND_TO_LABEL[params.data._kind] || params.data._kind}</strong><br/>weight: ${params.data.value}`;
          }
          const raw = params.data._raw || {};
          const lines = [
            `<strong>${escapeHtml(raw.name)}</strong>`,
            `<span style="color:${colors.textSecondary}">${CATEGORY_PALETTE[raw.category]?.label || raw.category}</span>`,
            `${raw.packet_count} observation${raw.packet_count === 1 ? '' : 's'}`,
          ];
          return lines.join('<br/>');
        },
      },
      legend: [
        {
          data: categories.map((c) => c.name),
          orient: 'horizontal',
          top: 0,
          left: 'center',
          textStyle: { color: colors.textSecondary, fontFamily: fonts.body, fontSize: 11 },
          itemWidth: 10,
          itemHeight: 10,
        },
      ],
      animationDuration: 800,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          name: 'AAuth observations',
          type: 'graph',
          layout: 'force',
          legendHoverLink: true,
          roam: true,
          draggable: true,
          focusNodeAdjacency: true,
          categories,
          data,
          links,
          force: {
            repulsion: 220,
            edgeLength: [80, 180],
            gravity: 0.08,
            friction: 0.6,
          },
          emphasis: {
            focus: 'adjacency',
            label: { show: true, fontSize: 12, fontFamily: fonts.body },
            lineStyle: { width: 3 },
          },
          label: {
            position: 'right',
            color: colors.textPrimary,
          },
          lineStyle: { color: 'source', curveness: 0.1 },
        },
      ],
    };
  }, [graph, selectedNodeId]);

  if (!graph || (graph.nodes?.length || 0) === 0) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '12px',
          padding: '40px',
          color: colors.textSecondary,
          fontFamily: fonts.body,
        }}
      >
        <div style={{ fontSize: '32px' }}>·· · ··</div>
        <div style={{ fontSize: '13px', textAlign: 'center', maxWidth: 520, lineHeight: 1.5 }}>
          No AAuth signals have been observed yet. To preview this view with fake data, click{' '}
          <strong>Generate sample data</strong> in the header above. For real signals, capture
          AAuth-bearing traffic through the mcp-shark proxy (e.g. by exercising any AAuth-aware MCP
          from your IDE).
        </div>
      </div>
    );
  }

  return (
    <ReactECharts
      ref={chartRef}
      option={option}
      notMerge
      lazyUpdate
      style={{ height: '100%', width: '100%' }}
      onEvents={{
        click: (params) => {
          if (params.dataType === 'node' && typeof onNodeSelect === 'function') {
            const raw = params.data._raw || {};
            onNodeSelect({
              category: getCategoryIdFromIndex(graph, params.data.category),
              id: raw.name,
              nodeKey: params.data.id,
              raw,
            });
          }
        },
      }}
    />
  );
}

function getCategoryIdFromIndex(graph, index) {
  return graph?.categories?.[index]?.id || null;
}

function shortenLabel(name, category) {
  if (!name) {
    return '';
  }
  if (category === 'resource' && name.length > 22) {
    return `${name.slice(0, 20)}…`;
  }
  if (category === 'mission' && name.length > 28) {
    return `${name.slice(0, 26)}…`;
  }
  if (category === 'agent' && name.length > 28) {
    return `${name.slice(0, 26)}…`;
  }
  return name;
}

function escapeHtml(s) {
  if (typeof s !== 'string') {
    return '';
  }
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
