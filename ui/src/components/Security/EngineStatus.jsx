import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import { colors, fonts } from '../../theme';

function EngineStatus({ engineStatus, rules = [] }) {
  const [expanded, setExpanded] = useState(true);

  const enabledRules = rules.filter((r) => r.enabled);

  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          fontSize: '14px',
          fontWeight: 600,
          fontFamily: fonts.body,
          color: colors.textPrimary,
          marginBottom: '12px',
        }}
      >
        YARA Engine Status
      </div>
      <div
        style={{
          display: 'flex',
          gap: '24px',
          fontSize: '12px',
          fontFamily: fonts.body,
          marginBottom: enabledRules.length > 0 ? '16px' : 0,
        }}
      >
        <span style={{ color: colors.textSecondary }}>
          Native:{' '}
          <span
            style={{
              color: engineStatus?.nativeAvailable ? colors.success : colors.warning,
              fontWeight: 500,
            }}
          >
            {engineStatus?.nativeAvailable ? 'Available' : 'Using Fallback'}
          </span>
        </span>
        <span style={{ color: colors.textSecondary }}>
          Loaded Rules:{' '}
          <span style={{ color: colors.accentBlue, fontWeight: 500 }}>
            {engineStatus?.loadedRulesCount || 0}
          </span>
        </span>
        <span style={{ color: colors.textSecondary }}>
          Compiled:{' '}
          <span style={{ color: colors.accentBlue, fontWeight: 500 }}>
            {engineStatus?.compiledRulesCount || 0}
          </span>
        </span>
      </div>

      {enabledRules.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontFamily: fonts.body,
              color: colors.textSecondary,
            }}
          >
            {expanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            Active Rules ({enabledRules.length})
          </button>

          {expanded && (
            <div
              style={{
                marginTop: '8px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {enabledRules.map((rule) => (
                <div
                  key={rule.rule_id}
                  style={{
                    background: colors.bgSecondary,
                    border: `1px solid ${colors.borderLight}`,
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontFamily: fonts.mono,
                    color: colors.textPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background:
                        rule.source === 'predefined' ? colors.accentBlue : colors.accentPurple,
                    }}
                  />
                  {rule.name}
                  {rule.severity && (
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '1px 4px',
                        borderRadius: '3px',
                        background: colors[`${rule.severity}Bg`] || colors.bgSecondary,
                        color: colors[rule.severity] || colors.textTertiary,
                        textTransform: 'uppercase',
                      }}
                    >
                      {rule.severity}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {engineStatus?.nativeError && (
        <div
          style={{
            fontSize: '11px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
            marginTop: '8px',
          }}
        >
          {engineStatus.nativeError}
        </div>
      )}
    </div>
  );
}

export default EngineStatus;
