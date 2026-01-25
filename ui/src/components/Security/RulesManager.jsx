import { IconDownload, IconRefresh } from '@tabler/icons-react';
import { colors, fonts } from '../../theme';
import EngineStatus from './EngineStatus.jsx';
import RulesTable from './RulesTable.jsx';
import SourceCard from './SourceCard.jsx';
import { YaraEditor } from './YaraEditor.jsx';

function RulesSummary({ rulesSummary }) {
  if (!rulesSummary) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '24px',
        marginBottom: '16px',
        fontSize: '12px',
        fontFamily: fonts.body,
      }}
    >
      <span style={{ color: colors.textSecondary }}>
        Total: <strong style={{ color: colors.textPrimary }}>{rulesSummary.total}</strong>
      </span>
      <span style={{ color: colors.textSecondary }}>
        Enabled: <strong style={{ color: colors.success }}>{rulesSummary.enabled}</strong>
      </span>
      <span style={{ color: colors.textSecondary }}>
        Disabled: <strong style={{ color: colors.textSecondary }}>{rulesSummary.disabled}</strong>
      </span>
    </div>
  );
}

function SourcesHeader({ hasSources, syncing, onInitialize, onSyncAll }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}
    >
      <h3
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: colors.textSecondary,
          fontFamily: fonts.body,
          textTransform: 'uppercase',
          margin: 0,
        }}
      >
        Rule Sources
      </h3>
      <div style={{ display: 'flex', gap: '8px' }}>
        {!hasSources && (
          <button
            type="button"
            onClick={onInitialize}
            style={{
              background: colors.buttonPrimary,
              color: colors.textInverse,
              border: 'none',
              borderRadius: '6px',
              padding: '8px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontFamily: fonts.body,
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.buttonPrimaryHover;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.buttonPrimary;
              e.currentTarget.style.transform = 'translateY(0)';
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
              background: syncing ? colors.buttonSecondary : colors.buttonPrimary,
              color: syncing ? colors.textTertiary : colors.textInverse,
              border: 'none',
              borderRadius: '6px',
              padding: '8px 14px',
              cursor: syncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontFamily: fonts.body,
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!syncing) {
                e.currentTarget.style.background = colors.buttonPrimaryHover;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!syncing) {
                e.currentTarget.style.background = colors.buttonPrimary;
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <IconRefresh size={14} className={syncing ? 'spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync All'}
          </button>
        )}
      </div>
    </div>
  );
}

function EmptySourcesMessage() {
  return (
    <div
      style={{
        textAlign: 'center',
        color: colors.textSecondary,
        padding: '32px',
        background: colors.bgCard,
        borderRadius: '12px',
        border: `1px solid ${colors.borderLight}`,
        fontFamily: fonts.body,
        fontSize: '13px',
      }}
    >
      No rule sources configured. Click &quot;Initialize Sources&quot; to add default sources.
    </div>
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
  onSaveRule,
  onDeleteRule,
}) {
  const hasRules = communityRules && communityRules.length > 0;
  const hasSources = ruleSources && ruleSources.length > 0;

  return (
    <div style={{ padding: '24px' }}>
      <EngineStatus engineStatus={engineStatus} />

      <div style={{ marginBottom: '24px' }}>
        <SourcesHeader
          hasSources={hasSources}
          syncing={syncing}
          onInitialize={onInitialize}
          onSyncAll={onSyncAll}
        />

        {hasSources ? (
          ruleSources.map((source) => (
            <SourceCard key={source.name} source={source} onSync={onSyncSource} syncing={syncing} />
          ))
        ) : (
          <EmptySourcesMessage />
        )}
      </div>

      <RulesSummary rulesSummary={rulesSummary} />

      {hasRules && <RulesTable communityRules={communityRules} onToggleRule={onToggleRule} />}

      <YaraEditor
        rules={communityRules}
        onSave={onSaveRule}
        onDelete={onDeleteRule}
        onToggle={onToggleRule}
      />
    </div>
  );
}
