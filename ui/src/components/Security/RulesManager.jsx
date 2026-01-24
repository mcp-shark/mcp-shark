import { IconCheck, IconDownload, IconRefresh, IconServer, IconX } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

function SourceCard({ source, onSync, syncing }) {
  const getStatusColor = () => {
    if (!source.last_sync_status) return colors.textMuted;
    if (source.last_sync_status === 'success') return colors.success;
    if (source.last_sync_status.startsWith('error')) return colors.error;
    return colors.warning;
  };

  return (
    <div
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconServer size={16} color={colors.accent} />
            <span style={{ fontWeight: 500, color: colors.text }}>{source.name}</span>
            {source.enabled ? (
              <IconCheck size={14} color={colors.success} />
            ) : (
              <IconX size={14} color={colors.textMuted} />
            )}
          </div>
          <div
            style={{
              fontSize: fonts.sizes.sm,
              color: colors.textMuted,
              marginTop: '4px',
              wordBreak: 'break-all',
            }}
          >
            {source.url}
          </div>
          <div style={{ fontSize: fonts.sizes.xs, color: colors.textMuted, marginTop: '4px' }}>
            Rules: {source.rule_count || 0} | Branch: {source.branch || 'main'}
          </div>
          {source.last_sync && (
            <div style={{ fontSize: fonts.sizes.xs, color: getStatusColor(), marginTop: '2px' }}>
              Last sync: {new Date(source.last_sync).toLocaleString()}
              {source.last_sync_status && source.last_sync_status !== 'success' && (
                <span> - {source.last_sync_status}</span>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onSync(source.name)}
          disabled={syncing}
          style={{
            background: colors.accent,
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 10px',
            cursor: syncing ? 'not-allowed' : 'pointer',
            opacity: syncing ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: fonts.sizes.sm,
          }}
        >
          <IconRefresh size={14} className={syncing ? 'spin' : ''} />
          Sync
        </button>
      </div>
    </div>
  );
}

function RuleRow({ rule, onToggle }) {
  const getSeverityColor = (severity) => {
    const severityColors = {
      critical: colors.error,
      high: '#f97316',
      medium: colors.warning,
      low: colors.success,
      info: colors.info,
    };
    return severityColors[severity] || colors.textMuted;
  };

  return (
    <tr
      style={{
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <td style={{ padding: '8px 12px' }}>
        <input
          type="checkbox"
          checked={rule.enabled === 1}
          onChange={() => onToggle(rule.rule_id, rule.enabled !== 1)}
          style={{ cursor: 'pointer' }}
        />
      </td>
      <td style={{ padding: '8px 12px' }}>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: fonts.sizes.xs,
            fontWeight: 500,
            color: '#fff',
            background: getSeverityColor(rule.severity),
          }}
        >
          {(rule.severity || 'unknown').toUpperCase()}
        </span>
      </td>
      <td style={{ padding: '8px 12px', color: colors.text }}>{rule.name}</td>
      <td style={{ padding: '8px 12px', color: colors.textMuted, fontSize: fonts.sizes.sm }}>
        {rule.source}
      </td>
      <td style={{ padding: '8px 12px', color: colors.accent, fontSize: fonts.sizes.sm }}>
        {rule.owasp_id || '-'}
      </td>
    </tr>
  );
}

export function RulesManager({
  ruleSources,
  communityRules,
  rulesSummary,
  syncing,
  engineStatus,
  onInitialize,
  onSyncAll,
  onSyncSource,
  onToggleRule,
}) {
  const hasRules = communityRules && communityRules.length > 0;
  const hasSources = ruleSources && ruleSources.length > 0;

  return (
    <div style={{ padding: '16px' }}>
      {/* Engine Status */}
      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '16px',
        }}
      >
        <div style={{ fontSize: fonts.sizes.sm, fontWeight: 500, marginBottom: '8px' }}>
          YARA Engine Status
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: fonts.sizes.sm }}>
          <span>
            Native:{' '}
            <span
              style={{ color: engineStatus?.nativeAvailable ? colors.success : colors.warning }}
            >
              {engineStatus?.nativeAvailable ? 'Available' : 'Using Fallback'}
            </span>
          </span>
          <span>
            Loaded Rules:{' '}
            <span style={{ color: colors.accent }}>{engineStatus?.loadedRulesCount || 0}</span>
          </span>
          <span>
            Compiled:{' '}
            <span style={{ color: colors.accent }}>{engineStatus?.compiledRulesCount || 0}</span>
          </span>
        </div>
        {engineStatus?.nativeError && (
          <div style={{ fontSize: fonts.sizes.xs, color: colors.textMuted, marginTop: '4px' }}>
            {engineStatus.nativeError}
          </div>
        )}
      </div>

      {/* Rule Sources */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <div style={{ fontSize: fonts.sizes.sm, fontWeight: 500 }}>Rule Sources</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!hasSources && (
              <button
                type="button"
                onClick={onInitialize}
                style={{
                  background: colors.accent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: fonts.sizes.sm,
                }}
              >
                <IconDownload size={14} />
                Initialize Sources
              </button>
            )}
            {hasSources && (
              <button
                type="button"
                onClick={onSyncAll}
                disabled={syncing}
                style={{
                  background: colors.accent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  cursor: syncing ? 'not-allowed' : 'pointer',
                  opacity: syncing ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: fonts.sizes.sm,
                }}
              >
                <IconRefresh size={14} className={syncing ? 'spin' : ''} />
                {syncing ? 'Syncing...' : 'Sync All'}
              </button>
            )}
          </div>
        </div>

        {hasSources ? (
          ruleSources.map((source) => (
            <SourceCard key={source.name} source={source} onSync={onSyncSource} syncing={syncing} />
          ))
        ) : (
          <div
            style={{
              textAlign: 'center',
              color: colors.textMuted,
              padding: '24px',
              background: colors.surface,
              borderRadius: '6px',
              border: `1px solid ${colors.border}`,
            }}
          >
            No rule sources configured. Click &quot;Initialize Sources&quot; to add default sources.
          </div>
        )}
      </div>

      {/* Rules Summary */}
      {rulesSummary && (
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '16px',
            fontSize: fonts.sizes.sm,
          }}
        >
          <span>
            Total: <strong>{rulesSummary.total}</strong>
          </span>
          <span>
            Enabled: <strong style={{ color: colors.success }}>{rulesSummary.enabled}</strong>
          </span>
          <span>
            Disabled: <strong style={{ color: colors.textMuted }}>{rulesSummary.disabled}</strong>
          </span>
        </div>
      )}

      {/* Rules Table */}
      {hasRules && (
        <div
          style={{
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: colors.surface }}>
                <th
                  style={{
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontSize: fonts.sizes.sm,
                    width: '40px',
                  }}
                >
                  On
                </th>
                <th
                  style={{
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontSize: fonts.sizes.sm,
                    width: '80px',
                  }}
                >
                  Severity
                </th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: fonts.sizes.sm }}>
                  Name
                </th>
                <th
                  style={{
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontSize: fonts.sizes.sm,
                    width: '120px',
                  }}
                >
                  Source
                </th>
                <th
                  style={{
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontSize: fonts.sizes.sm,
                    width: '80px',
                  }}
                >
                  OWASP
                </th>
              </tr>
            </thead>
            <tbody>
              {communityRules.slice(0, 50).map((rule) => (
                <RuleRow key={rule.rule_id} rule={rule} onToggle={onToggleRule} />
              ))}
            </tbody>
          </table>
          {communityRules.length > 50 && (
            <div
              style={{
                padding: '8px 12px',
                textAlign: 'center',
                fontSize: fonts.sizes.sm,
                color: colors.textMuted,
                background: colors.surface,
              }}
            >
              Showing 50 of {communityRules.length} rules
            </div>
          )}
        </div>
      )}
    </div>
  );
}
