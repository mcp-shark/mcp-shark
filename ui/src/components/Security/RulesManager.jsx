import { colors } from '../../theme';
import EngineStatus from './EngineStatus.jsx';
import { YaraEditor } from './YaraEditor.jsx';

export function RulesManager({
  communityRules,
  engineStatus,
  onToggleRule,
  onSaveRule,
  onDeleteRule,
  onResetDefaults,
}) {
  return (
    <div
      style={{
        padding: '24px',
        flex: 1,
        overflow: 'auto',
        background: colors.bgPrimary,
      }}
    >
      <EngineStatus engineStatus={engineStatus} rules={communityRules} />

      <YaraEditor
        rules={communityRules}
        onSave={onSaveRule}
        onDelete={onDeleteRule}
        onToggle={onToggleRule}
        onResetDefaults={onResetDefaults}
      />
    </div>
  );
}
