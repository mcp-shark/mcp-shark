import { colors, fonts } from '../../theme';

function EngineStatus({ engineStatus }) {
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
