import { IconFlask, IconKey, IconRefresh } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { colors, fonts } from '../../theme';

const POSTURE_META = [
  { id: 'signed', label: 'Signed', dotColor: colors.success },
  { id: 'aauth-aware', label: 'AAuth-aware', dotColor: colors.accentBlue },
  { id: 'bearer', label: 'Bearer', dotColor: colors.warning },
  { id: 'none', label: 'No auth', dotColor: colors.textTertiary },
];

function formatPercent(part, total) {
  if (!total) {
    return '0%';
  }
  return `${Math.round((part / total) * 100)}%`;
}

/**
 * Captured-traffic AAuth posture panel.
 *
 * Read-only summary backed by GET /api/aauth/posture, plus a one-click
 * "Generate sample data" button (POST /api/aauth/self-test) that inserts
 * FAKE AAuth packets so a developer can preview the views before any
 * AAuth-aware MCP exists in their stack. Synthetic packets are tagged
 * `user-agent: mcp-shark-self-test/1.0` and treated everywhere else as
 * regular captured traffic.
 *
 * Always describes signals as observed; never implies cryptographic
 * verification.
 */
export default function AAuthPosturePanel({ onTrafficGenerated } = {}) {
  const [data, setData] = useState(null);
  const [_upstreams, setUpstreams] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [postureRes, upstreamsRes] = await Promise.all([
        fetch('/api/aauth/posture'),
        fetch('/api/aauth/upstreams'),
      ]);
      if (!postureRes.ok) {
        throw new Error(`HTTP ${postureRes.status}`);
      }
      const json = await postureRes.json();
      setData(json);
      if (upstreamsRes.ok) {
        const u = await upstreamsRes.json();
        setUpstreams(u.upstreams || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load AAuth posture');
    } finally {
      setLoading(false);
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
      if (typeof onTrafficGenerated === 'function') {
        onTrafficGenerated(result);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate sample traffic');
    } finally {
      setRunning(false);
    }
  }, [load, onTrafficGenerated]);

  useEffect(() => {
    load();
  }, [load]);

  if (error && !data) {
    return null;
  }
  // Render even with zero traffic so the self-test button is discoverable.
  if (!data) {
    return null;
  }

  return (
    <div
      style={{
        marginBottom: '16px',
        padding: '14px 16px',
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '8px',
        boxShadow: `0 1px 2px ${colors.shadowSm}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconKey size={16} stroke={1.5} style={{ color: colors.accentBlue }} />
          <span
            style={{
              fontSize: '13px',
              fontFamily: fonts.body,
              fontWeight: 600,
              color: colors.textPrimary,
            }}
          >
            AAuth Posture
          </span>
          <span
            style={{
              fontSize: '11px',
              fontFamily: fonts.body,
              color: colors.textTertiary,
            }}
          >
            {data.total_packets > 0
              ? `observed in ${data.total_packets} packet${data.total_packets === 1 ? '' : 's'} · not verified`
              : 'no AAuth signals observed yet'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={generateSampleTraffic}
            disabled={running}
            title="Inserts fake AAuth packets so you can see how mcp-shark visualizes them. Not real traffic — synthetic packets are tagged with user-agent mcp-shark-self-test/1.0."
            aria-label="Generate fake sample AAuth traffic for demo purposes"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: colors.warning,
              border: `1px solid ${colors.warning}`,
              borderRadius: '6px',
              color: '#fff',
              fontSize: '11px',
              fontFamily: fonts.body,
              fontWeight: 500,
              cursor: running ? 'wait' : 'pointer',
              opacity: running ? 0.7 : 1,
            }}
          >
            <IconFlask size={12} stroke={1.5} />
            {running ? 'Generating…' : 'Generate sample data'}
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            aria-label="Refresh AAuth posture"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'transparent',
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '6px',
              color: colors.textSecondary,
              fontSize: '11px',
              fontFamily: fonts.body,
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            <IconRefresh size={12} stroke={1.5} />
            Refresh
          </button>
        </div>
      </div>

      {data.total_packets === 0 && (
        <div
          style={{
            padding: '12px',
            marginBottom: '8px',
            background: colors.bgSecondary,
            border: `1px dashed ${colors.borderLight}`,
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: fonts.body,
            color: colors.textSecondary,
            lineHeight: 1.5,
          }}
        >
          mcp-shark hasn&rsquo;t observed any AAuth-bearing traffic yet. To see what this view looks
          like with data, click <strong>Generate sample data</strong> &mdash; it inserts fake AAuth
          packets (tagged{' '}
          <code style={{ fontFamily: fonts.mono }}>user-agent: mcp-shark-self-test/1.0</code>) for
          demo purposes only.
        </div>
      )}

      {lastRun && (
        <div
          style={{
            padding: '8px 10px',
            marginBottom: '8px',
            background: `${colors.warning}1A`,
            border: `1px solid ${colors.warning}55`,
            borderRadius: '6px',
            fontSize: '11px',
            fontFamily: fonts.body,
            color: colors.textSecondary,
          }}
        >
          <strong>Sample data inserted:</strong> {lastRun.inserted} fake packets across{' '}
          {lastRun.targets?.length || 0} upstream
          {(lastRun.targets?.length || 0) === 1 ? '' : 's'} · postures:{' '}
          {Object.entries(lastRun.by_posture || {})
            .map(([k, v]) => `${k}=${v}`)
            .join(', ')}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          marginBottom: '10px',
        }}
      >
        {POSTURE_META.map((p) => {
          const count = data.counts?.[p.id] || 0;
          const pct = formatPercent(count, data.total_packets);
          return (
            <div
              key={p.id}
              style={{
                padding: '10px 12px',
                background: colors.bgSecondary,
                borderRadius: '6px',
                border: `1px solid ${colors.borderLight}`,
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: p.dotColor,
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    color: colors.textSecondary,
                    fontFamily: fonts.body,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {p.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontFamily: fonts.body,
                  fontWeight: 600,
                  color: colors.textPrimary,
                  lineHeight: 1.1,
                }}
              >
                {count}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  fontFamily: fonts.mono,
                  color: colors.textTertiary,
                }}
              >
                {pct}
              </div>
            </div>
          );
        })}
      </div>

      {(data.unique_agents?.length > 0 || data.unique_missions?.length > 0) && (
        <div
          style={{
            paddingTop: '8px',
            borderTop: `1px dashed ${colors.borderLight}`,
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
            fontSize: '11px',
            fontFamily: fonts.body,
            color: colors.textSecondary,
          }}
        >
          {data.unique_agents?.length > 0 && (
            <span>
              <strong style={{ color: colors.textPrimary }}>{data.unique_agents.length}</strong>{' '}
              unique agent{data.unique_agents.length === 1 ? '' : 's'}
            </span>
          )}
          {data.unique_missions?.length > 0 && (
            <span>
              <strong style={{ color: colors.textPrimary }}>{data.unique_missions.length}</strong>{' '}
              mission{data.unique_missions.length === 1 ? '' : 's'} observed
            </span>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: '8px',
          fontSize: '11px',
          fontFamily: fonts.body,
          color: colors.textTertiary,
        }}
      >
        AAuth signals are recorded as observed only. Learn more at{' '}
        <a
          href="https://www.aauth.dev"
          target="_blank"
          rel="noreferrer noopener"
          style={{ color: colors.accentBlue }}
        >
          aauth.dev
        </a>
        .
      </div>
    </div>
  );
}
