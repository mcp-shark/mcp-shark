import { IconFlask, IconKey, IconRefresh, IconShieldCheck } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { colors, fonts } from '../../theme.js';
import AauthExplorerGraph from './AauthExplorerGraph.jsx';
import NodeDetailPanel from './NodeDetailPanel.jsx';

const CATEGORY_META = {
  agent: { label: 'Agents', color: '#1a73e8' },
  mission: { label: 'Missions', color: '#e8710a' },
  resource: { label: 'Resources', color: '#137333' },
  signing: { label: 'Signing', color: '#9334e6' },
  access: { label: 'Access modes', color: '#b06000' },
};

const POLL_INTERVAL_MS = 5000;

/**
 * Top-level AAuth Explorer page.
 *
 * Pulls the live AAuth knowledge graph from /api/aauth/graph, renders it as a
 * force-directed view (AauthExplorerGraph), and shows a side panel of
 * underlying packets when a node is clicked.
 *
 * A "Generate sample data" button is included so a developer can populate
 * the view with FAKE traffic for demos / screenshots / first-time orientation
 * before any real AAuth-aware MCP exists in their stack. Synthetic packets
 * are deliberately tagged `user-agent: mcp-shark-self-test/1.0` so they are
 * trivially distinguishable from real captures.
 *
 * Inspired by https://mcp-shark.github.io/aauth-explorer/, but every node
 * here is grounded in observed packets rather than a static spec figure.
 */
export default function AauthExplorerView({ onOpenPacket }) {
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [selection, setSelection] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRun, setLastRun] = useState(null);
  const [upstreamCount, setUpstreamCount] = useState(0);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [gRes, uRes] = await Promise.all([
        fetch('/api/aauth/graph'),
        fetch('/api/aauth/upstreams'),
      ]);
      if (!gRes.ok) {
        throw new Error(`HTTP ${gRes.status}`);
      }
      const json = await gRes.json();
      setGraph(json);
      if (uRes.ok) {
        const u = await uRes.json();
        setUpstreamCount(u.count || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load AAuth graph');
    }
  }, []);

  const generateSampleTraffic = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch('/api/aauth/self-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rounds: 2 }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const result = await res.json();
      setLastRun(result);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to generate sample traffic');
    } finally {
      setRunning(false);
    }
  }, [load]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) {
      return undefined;
    }
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  const stats = graph?.stats || { observed_packets: 0, node_counts: {}, edge_count: 0 };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: colors.bgPrimary,
      }}
    >
      <Header
        running={running}
        loading={loading}
        upstreamCount={upstreamCount}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh((v) => !v)}
        onRefresh={() => {
          setLoading(true);
          load().finally(() => setLoading(false));
        }}
        onGenerateSample={generateSampleTraffic}
      />

      {lastRun && (
        <div
          style={{
            padding: '8px 16px',
            background: `${colors.warning}1A`,
            borderBottom: `1px solid ${colors.warning}55`,
            fontSize: '11px',
            fontFamily: fonts.body,
            color: colors.textSecondary,
          }}
        >
          <strong>Sample data inserted:</strong> {lastRun.inserted} fake packets across{' '}
          {lastRun.targets?.length || 0} upstream
          {(lastRun.targets?.length || 0) === 1 ? '' : 's'} (tagged{' '}
          <code style={{ fontFamily: fonts.mono }}>user-agent: mcp-shark-self-test/1.0</code>) ·{' '}
          {Object.entries(lastRun.by_posture || {})
            .map(([k, v]) => `${k}=${v}`)
            .join(' · ')}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '10px 16px',
            background: colors.errorBg,
            borderBottom: `1px solid ${colors.error}55`,
            fontSize: '12px',
            fontFamily: fonts.body,
            color: colors.error,
          }}
        >
          {error}
        </div>
      )}

      <StatsStrip stats={stats} />

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div
          style={{
            flex: 1,
            position: 'relative',
            minWidth: 0,
            background: colors.bgPrimary,
            borderTop: `1px solid ${colors.borderLight}`,
          }}
        >
          <AauthExplorerGraph
            graph={graph}
            onNodeSelect={(sel) => setSelection(sel)}
            selectedNodeId={selection?.nodeKey || null}
          />
          <DisclaimerBadge />
        </div>
        {selection && (
          <NodeDetailPanel
            selection={selection}
            onClose={() => setSelection(null)}
            onOpenPacket={onOpenPacket}
          />
        )}
      </div>
    </div>
  );
}

function Header({
  running,
  loading,
  upstreamCount,
  autoRefresh,
  onToggleAutoRefresh,
  onRefresh,
  onGenerateSample,
}) {
  return (
    <div
      style={{
        padding: '16px 20px',
        background: colors.bgCard,
        borderBottom: `1px solid ${colors.borderLight}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <IconKey size={22} stroke={1.5} style={{ color: '#1a73e8' }} />
        <div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 600,
              fontFamily: fonts.body,
              color: colors.textPrimary,
              lineHeight: 1.1,
            }}
          >
            AAuth Explorer
          </div>
          <div
            style={{
              fontSize: '11px',
              color: colors.textSecondary,
              fontFamily: fonts.body,
              marginTop: '2px',
            }}
          >
            Auto-detected from captured traffic ·{' '}
            {upstreamCount > 0
              ? `${upstreamCount} HTTP upstream${upstreamCount === 1 ? '' : 's'} configured`
              : 'no HTTP upstreams configured'}{' '}
            · observation only, no verification
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontFamily: fonts.body,
            color: colors.textSecondary,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={onToggleAutoRefresh}
            style={{ cursor: 'pointer' }}
          />
          Live refresh
        </label>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh AAuth graph"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'transparent',
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '6px',
            color: colors.textSecondary,
            fontSize: '12px',
            fontFamily: fonts.body,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          <IconRefresh size={13} stroke={1.5} />
          Refresh
        </button>
        <button
          type="button"
          onClick={onGenerateSample}
          disabled={running}
          title="Inserts fake AAuth packets so you can see how the visualization works. Not real traffic — synthetic packets are tagged with user-agent mcp-shark-self-test/1.0."
          aria-label="Generate fake sample AAuth traffic for demo purposes"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            background: colors.warning,
            border: `1px solid ${colors.warning}`,
            borderRadius: '6px',
            color: '#fff',
            fontSize: '12px',
            fontFamily: fonts.body,
            fontWeight: 500,
            cursor: running ? 'wait' : 'pointer',
            opacity: running ? 0.7 : 1,
          }}
        >
          <IconFlask size={13} stroke={1.5} />
          {running ? 'Generating…' : 'Generate sample data'}
        </button>
      </div>
    </div>
  );
}

function StatsStrip({ stats }) {
  const counts = stats.node_counts || {};
  return (
    <div
      style={{
        display: 'flex',
        gap: '24px',
        padding: '10px 20px',
        background: colors.bgSecondary,
        borderBottom: `1px solid ${colors.borderLight}`,
        fontFamily: fonts.body,
        fontSize: '11px',
        color: colors.textSecondary,
        flexWrap: 'wrap',
      }}
    >
      {Object.entries(CATEGORY_META).map(([id, meta]) => (
        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            aria-hidden="true"
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: meta.color,
              display: 'inline-block',
            }}
          />
          <span>{meta.label}</span>
          <strong style={{ color: colors.textPrimary, fontFamily: fonts.mono }}>
            {counts[id] || 0}
          </strong>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
        <span>Edges</span>
        <strong style={{ color: colors.textPrimary, fontFamily: fonts.mono }}>
          {stats.edge_count || 0}
        </strong>
        <span style={{ marginLeft: '12px' }}>Observed packets</span>
        <strong style={{ color: colors.textPrimary, fontFamily: fonts.mono }}>
          {stats.observed_packets || 0}
        </strong>
      </div>
    </div>
  );
}

function DisclaimerBadge() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        padding: '6px 10px',
        background: `${colors.bgCard}E6`,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '6px',
        fontSize: '10px',
        fontFamily: fonts.body,
        color: colors.textSecondary,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: `0 1px 2px ${colors.shadowSm}`,
      }}
    >
      <IconShieldCheck size={11} stroke={1.5} />
      Observation only · no signature verification is performed
    </div>
  );
}
