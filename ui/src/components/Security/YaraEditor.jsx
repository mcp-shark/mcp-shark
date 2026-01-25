import { useCallback, useState } from 'react';
import { colors, fonts } from '../../theme';
import { YaraEditorHeader } from './YaraEditorHeader.jsx';
import { YaraRuleCard } from './YaraRuleCard.jsx';
import { YaraRuleEditor } from './YaraRuleEditor.jsx';

const SAMPLE_RULE = `rule custom_mcp_security_rule : security
{
    meta:
        description = "Custom MCP security rule"
        author = "Your Name"
        severity = "medium"
        owasp_id = "MCP01"
    
    strings:
        $suspicious = "suspicious_pattern" nocase
        $secret = /sk-[a-zA-Z0-9]{40,}/
    
    condition:
        any of them
}`;

function EmptyState() {
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
      No custom rules defined. Click &quot;New Rule&quot; to create one.
    </div>
  );
}

export function YaraEditor({ rules = [], onSave, onDelete, onToggle, onResetDefaults }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [content, setContent] = useState('');
  const [validation, setValidation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleNew = useCallback(() => {
    setContent(SAMPLE_RULE);
    setEditingRule(null);
    setValidation(null);
    setIsEditing(true);
  }, []);

  const handleEdit = useCallback((rule) => {
    setContent(rule.content);
    setEditingRule(rule);
    setValidation(null);
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setContent('');
    setEditingRule(null);
    setValidation(null);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const result = await onSave({
        rule_id: editingRule?.rule_id,
        content,
        enabled: editingRule?.enabled !== false,
      });

      if (result.success) {
        handleCancel();
      } else {
        setValidation({ errors: result.errors });
      }
    } catch (error) {
      setValidation({ errors: [error.message] });
    } finally {
      setSaving(false);
    }
  }, [content, editingRule, onSave, handleCancel]);

  const handleResetDefaults = useCallback(async () => {
    if (!onResetDefaults) return;
    setResetting(true);
    try {
      await onResetDefaults();
    } finally {
      setResetting(false);
    }
  }, [onResetDefaults]);

  // Separate rules by source
  const predefinedRules = rules.filter((r) => r.source === 'predefined');
  const customRules = rules.filter((r) => r.source === 'custom');

  return (
    <div style={{ marginTop: '24px' }}>
      <YaraEditorHeader
        isEditing={isEditing}
        onNew={handleNew}
        onCancel={handleCancel}
        onResetDefaults={handleResetDefaults}
        resetting={resetting}
        hasPredefined={predefinedRules.length > 0 || customRules.length > 0}
      />

      {isEditing && (
        <YaraRuleEditor
          content={content}
          onChange={setContent}
          onSave={handleSave}
          onCancel={handleCancel}
          validation={validation}
          saving={saving}
        />
      )}

      {!isEditing && rules.length === 0 && <EmptyState />}

      {!isEditing && predefinedRules.length > 0 && (
        <RulesSection
          title="Predefined Rules"
          rules={predefinedRules}
          handlers={{ handleEdit, onDelete, onToggle }}
        />
      )}

      {!isEditing && customRules.length > 0 && (
        <RulesSection
          title="Custom Rules"
          rules={customRules}
          handlers={{ handleEdit, onDelete, onToggle }}
        />
      )}
    </div>
  );
}

function RulesSection({ title, rules, handlers }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h4
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: colors.textSecondary,
          fontFamily: fonts.body,
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}
      >
        {title} ({rules.length})
      </h4>
      {rules.map((rule) => (
        <YaraRuleCard
          key={rule.rule_id}
          rule={rule}
          onEdit={handlers.handleEdit}
          onDelete={handlers.onDelete}
          onToggle={handlers.onToggle}
        />
      ))}
    </div>
  );
}
