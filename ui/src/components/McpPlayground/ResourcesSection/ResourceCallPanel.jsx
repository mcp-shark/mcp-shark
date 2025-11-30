import { colors, fonts } from '../../../theme';

export default function ResourceCallPanel({ resource, resourceResult, onReadResource, loading }) {
  return (
    <div
      style={{
        flex: 1,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '12px',
          background: colors.bgSecondary,
          borderBottom: `1px solid ${colors.borderLight}`,
          fontWeight: '500',
          fontSize: '14px',
          color: colors.textPrimary,
        }}
      >
        Read Resource: {resource.uri}
      </div>
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <button
          onClick={onReadResource}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: colors.buttonPrimary,
            color: colors.textInverse,
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: fonts.body,
            fontSize: '13px',
            fontWeight: '500',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Reading...' : 'Read Resource'}
        </button>
        {resourceResult && (
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: colors.textSecondary,
                marginBottom: '6px',
              }}
            >
              Result
            </label>
            <pre
              style={{
                padding: '12px',
                background: colors.bgSecondary,
                border: `1px solid ${colors.borderLight}`,
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: fonts.mono,
                color: resourceResult.error ? colors.error : colors.textPrimary,
                overflow: 'auto',
                maxHeight: '400px',
                margin: 0,
              }}
            >
              {JSON.stringify(resourceResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
