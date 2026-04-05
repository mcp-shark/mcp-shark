import { IconDatabase, IconGitBranch, IconRefresh } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

function riskColor(risk) {
  const r = (risk || '').toUpperCase();
  if (r === 'HIGH') {
    return colors.error;
  }
  if (r === 'MEDIUM') {
    return colors.warning;
  }
  return colors.textSecondary;
}

export default function TrafficToxicFlowsPanel({ snapshot, loading, error, onRefresh, onReplay }) {
  const flows = snapshot?.toxicFlows ?? [];
  const servers = snapshot?.servers ?? [];
  const replay = snapshot?.replay;

  return (
    <div
      style={{
        marginBottom: '20px',
        padding: '14px 16px',
        background: colors.bgSecondary,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <IconGitBranch
            size={18}
            stroke={1.5}
            style={{ color: colors.textMuted, flexShrink: 0 }}
          />
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: colors.textPrimary,
                fontFamily: fonts.body,
              }}
            >
              Toxic flows (proxy traffic)
            </div>
            <div
              style={{
                fontSize: '11px',
                color: colors.textSecondary,
                fontFamily: fonts.body,
                marginTop: '2px',
                maxWidth: '720px',
                lineHeight: 1.45,
              }}
            >
              Heuristic cross-server pairs from <strong>tools/list</strong> responses seen through
              the HTTP proxy. Run MCP clients through mcp-shark, trigger tool discovery, then
              refresh or replay from the packet database. Clearing findings or all captured traffic
              resets this in-memory model.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            disabled={loading}
            onClick={() => onRefresh()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 500,
              fontFamily: fonts.body,
              background: colors.buttonSecondary,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '4px',
              cursor: loading ? 'wait' : 'pointer',
              color: colors.textPrimary,
            }}
          >
            <IconRefresh size={14} stroke={1.5} />
            Refresh
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onReplay()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 500,
              fontFamily: fonts.body,
              background: colors.buttonPrimary,
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'wait' : 'pointer',
              color: colors.textInverse,
            }}
          >
            <IconDatabase size={14} stroke={1.5} />
            Replay from DB
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            fontSize: '12px',
            color: colors.error,
            background: colors.errorBg,
            padding: '8px 10px',
            borderRadius: '4px',
            marginBottom: '10px',
            fontFamily: fonts.body,
          }}
        >
          {error}
        </div>
      )}

      {loading && !snapshot && !error && (
        <div style={{ fontSize: '12px', color: colors.textSecondary, fontFamily: fonts.body }}>
          Loading…
        </div>
      )}

      {snapshot && !error && (
        <div style={{ fontSize: '11px', color: colors.textSecondary, fontFamily: fonts.body }}>
          {servers.length > 0 ? (
            <span>
              <strong style={{ color: colors.textPrimary }}>{servers.length}</strong> server
              {servers.length !== 1 ? 's' : ''} with tool metadata
              {snapshot.computedAt
                ? ` · updated ${new Date(snapshot.computedAt).toLocaleString()}`
                : ''}
              {replay != null
                ? ` · replay scanned ${replay.packetRows} packet row${replay.packetRows !== 1 ? 's' : ''}`
                : ''}
            </span>
          ) : (
            <span>
              No <code style={{ fontFamily: fonts.mono }}>tools/list</code> traffic captured yet.
              Use the proxy, open a client that lists tools, then Refresh or Replay from DB.
            </span>
          )}
        </div>
      )}

      {flows.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            margin: '12px 0 0',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {flows.map((flow, idx) => (
            <li
              key={`${flow.source}-${flow.target}-${flow.title}-${idx}`}
              style={{
                padding: '10px 12px',
                background: colors.bgCard,
                border: `1px solid ${colors.borderLight}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: riskColor(flow.risk),
                    fontFamily: fonts.body,
                  }}
                >
                  {(flow.risk || '').toUpperCase()}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                  }}
                >
                  {flow.title}
                </span>
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: colors.accentBlue,
                  fontFamily: fonts.mono,
                  marginTop: '4px',
                }}
              >
                {flow.source} → {flow.target}
              </div>
              {flow.scenario && (
                <div
                  style={{
                    fontSize: '11px',
                    color: colors.textSecondary,
                    fontFamily: fonts.body,
                    marginTop: '6px',
                    lineHeight: 1.45,
                  }}
                >
                  {flow.scenario}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {snapshot && servers.length > 0 && (
        <div
          style={{
            marginTop: '12px',
            fontSize: '10px',
            color: colors.textTertiary,
            fontFamily: fonts.body,
            lineHeight: 1.4,
          }}
        >
          {snapshot.note}
        </div>
      )}
    </div>
  );
}
