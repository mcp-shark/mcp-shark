import { colors, fonts } from '../theme';

function ServerControl({ status, loading, onStart, onStop, canStart }) {
  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: `0 2px 4px ${colors.shadowSm}`,
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h3
          style={{
            fontSize: '15px',
            fontWeight: '600',
            marginBottom: '8px',
            color: colors.textPrimary,
            fontFamily: fonts.body,
          }}
        >
          Server Control
        </h3>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        {status.running ? (
          <button
            type="button"
            onClick={onStop}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: colors.buttonDanger,
              border: `1px solid ${colors.buttonDanger}`,
              color: colors.textInverse,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontFamily: fonts.body,
              fontWeight: '500',
              borderRadius: '8px',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s',
              boxShadow: `0 2px 4px ${colors.shadowSm}`,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = colors.buttonDangerHover;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.buttonDanger;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {loading ? 'Stopping...' : 'Stop MCP Shark'}
          </button>
        ) : (
          <button
            type="button"
            data-tour="start-button"
            onClick={onStart}
            disabled={loading || !canStart}
            style={{
              padding: '10px 20px',
              background: colors.buttonPrimary,
              border: `1px solid ${colors.buttonPrimary}`,
              color: colors.textInverse,
              cursor: loading || !canStart ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontFamily: fonts.body,
              fontWeight: '500',
              borderRadius: '8px',
              opacity: loading || !canStart ? 0.5 : 1,
              transition: 'all 0.2s',
              boxShadow: `0 2px 4px ${colors.shadowSm}`,
            }}
            onMouseEnter={(e) => {
              if (!loading && canStart) {
                e.currentTarget.style.background = colors.buttonPrimaryHover;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.buttonPrimary;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {loading ? 'Processing...' : 'Start MCP Shark'}
          </button>
        )}

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 16px',
            background: colors.bgPrimary,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: status.running ? colors.success : colors.textTertiary,
              boxShadow: status.running ? `0 0 8px ${colors.success}80` : 'none',
              transition: 'all 0.3s',
            }}
          />
          <span
            style={{
              color: colors.textPrimary,
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: fonts.body,
            }}
          >
            {status.running ? (status.pid ? `Running (PID: ${status.pid})` : 'Running') : 'Stopped'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ServerControl;
