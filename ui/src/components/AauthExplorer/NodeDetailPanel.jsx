import { IconExternalLink, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { colors, fonts } from '../../theme.js';

const CATEGORY_LABELS = {
  agent: 'Agent',
  mission: 'Mission',
  resource: 'Resource',
  signing: 'Signing algorithm',
  access: 'Access mode',
};

const POSTURE_COLORS = {
  signed: colors.success,
  'aauth-aware': '#1a73e8',
  bearer: colors.warning,
  none: colors.textTertiary,
};

/**
 * Side panel that lists the captured packets backing a single AAuth Explorer
 * node. Calls GET /api/aauth/node/:category/:id and renders a compact
 * scrollable list. Each row deep-links into the Traffic tab via the supplied
 * onOpenPacket callback (so the developer can pivot to the raw packet inspector).
 */
export default function NodeDetailPanel({ selection, onClose, onOpenPacket }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selection) {
      setData(null);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(
      `/api/aauth/node/${encodeURIComponent(selection.category)}/${encodeURIComponent(selection.id)}`
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load node packets');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selection]);

  if (!selection) {
    return null;
  }

  return (
    <div
      style={{
        width: '380px',
        minWidth: '320px',
        height: '100%',
        background: colors.bgCard,
        borderLeft: `1px solid ${colors.borderLight}`,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: `-2px 0 8px ${colors.shadowSm}`,
      }}
    >
      <div
        style={{
          padding: '14px 16px',
          borderBottom: `1px solid ${colors.borderLight}`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '11px',
              fontFamily: fonts.body,
              color: colors.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {CATEGORY_LABELS[selection.category] || selection.category}
          </div>
          <div
            style={{
              fontSize: '14px',
              fontFamily: fonts.body,
              fontWeight: 600,
              color: colors.textPrimary,
              marginTop: '2px',
              wordBreak: 'break-all',
            }}
          >
            {selection.id}
          </div>
          {selection.raw?.packet_count != null && (
            <div
              style={{
                fontSize: '11px',
                fontFamily: fonts.body,
                color: colors.textSecondary,
                marginTop: '4px',
              }}
            >
              {selection.raw.packet_count} observation
              {selection.raw.packet_count === 1 ? '' : 's'}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail panel"
          style={{
            padding: '4px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: colors.textSecondary,
          }}
        >
          <IconX size={16} stroke={1.5} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {loading && (
          <div
            style={{
              padding: '14px 16px',
              fontSize: '12px',
              fontFamily: fonts.body,
              color: colors.textSecondary,
            }}
          >
            Loading observations…
          </div>
        )}
        {error && (
          <div
            style={{
              padding: '14px 16px',
              fontSize: '12px',
              fontFamily: fonts.body,
              color: colors.error,
            }}
          >
            {error}
          </div>
        )}
        {data && data.packets?.length === 0 && !loading && (
          <div
            style={{
              padding: '14px 16px',
              fontSize: '12px',
              fontFamily: fonts.body,
              color: colors.textSecondary,
            }}
          >
            No matching packets are currently in the capture buffer.
          </div>
        )}
        {data?.packets?.map((p) => (
          <button
            key={p.frame_number}
            type="button"
            onClick={() => onOpenPacket?.(p.frame_number)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '10px 16px',
              borderTop: 'none',
              borderRight: 'none',
              borderLeft: `3px solid ${POSTURE_COLORS[p.posture] || colors.textTertiary}`,
              borderBottom: `1px solid ${colors.borderLight}`,
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: fonts.body,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '4px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: fonts.mono,
                  color: colors.textSecondary,
                }}
              >
                #{p.frame_number} · {p.direction}
                {p.method ? ` · ${p.method}` : ''}
                {p.status_code ? ` · ${p.status_code}` : ''}
              </span>
              <IconExternalLink size={11} stroke={1.5} style={{ color: colors.textTertiary }} />
            </div>
            <div
              style={{
                fontSize: '12px',
                color: colors.textPrimary,
                wordBreak: 'break-all',
              }}
            >
              {p.jsonrpc_method || p.url || p.host || '(no destination)'}
            </div>
            <div
              style={{
                fontSize: '10px',
                marginTop: '4px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                color: colors.textTertiary,
                fontFamily: fonts.mono,
              }}
            >
              <span style={{ color: POSTURE_COLORS[p.posture] || colors.textTertiary }}>
                {p.posture}
              </span>
              {p.agent && <span>agent={truncate(p.agent, 32)}</span>}
              {p.mission && <span>mission={truncate(p.mission, 28)}</span>}
              {p.sig_alg && <span>alg={p.sig_alg}</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function truncate(s, n) {
  if (!s || s.length <= n) {
    return s;
  }
  return `${s.slice(0, n - 1)}…`;
}
