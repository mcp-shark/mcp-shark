import { IconCheck, IconRefresh, IconServer, IconX } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';

function getStatusColor(lastSyncStatus) {
  if (!lastSyncStatus) {
    return colors.textSecondary;
  }
  if (lastSyncStatus === 'success') {
    return colors.success;
  }
  if (lastSyncStatus.startsWith('error')) {
    return colors.error;
  }
  return colors.warning;
}

function SourceCard({ source, onSync, syncing }) {
  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconServer size={16} color="#0d9488" />
            <span style={{ fontWeight: 600, color: colors.textPrimary, fontFamily: fonts.body }}>
              {source.name}
            </span>
            {source.enabled ? (
              <IconCheck size={14} color={colors.success} />
            ) : (
              <IconX size={14} color={colors.textSecondary} />
            )}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: colors.textSecondary,
              fontFamily: fonts.body,
              marginTop: '6px',
              wordBreak: 'break-all',
            }}
          >
            {source.url}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: colors.textSecondary,
              fontFamily: fonts.body,
              marginTop: '6px',
            }}
          >
            Rules: {source.rule_count || 0} | Branch: {source.branch || 'main'}
          </div>
          {source.last_sync && (
            <div
              style={{
                fontSize: '11px',
                color: getStatusColor(source.last_sync_status),
                fontFamily: fonts.body,
                marginTop: '4px',
              }}
            >
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
            background: colors.buttonSecondary,
            color: colors.textSecondary,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '6px',
            padding: '6px 12px',
            cursor: syncing ? 'not-allowed' : 'pointer',
            opacity: syncing ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontFamily: fonts.body,
            fontWeight: 500,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!syncing) {
              e.currentTarget.style.background = colors.buttonSecondaryHover;
              e.currentTarget.style.color = colors.textPrimary;
            }
          }}
          onMouseLeave={(e) => {
            if (!syncing) {
              e.currentTarget.style.background = colors.buttonSecondary;
              e.currentTarget.style.color = colors.textSecondary;
            }
          }}
        >
          <IconRefresh size={14} className={syncing ? 'spin' : ''} />
          Sync
        </button>
      </div>
    </div>
  );
}

export default SourceCard;
