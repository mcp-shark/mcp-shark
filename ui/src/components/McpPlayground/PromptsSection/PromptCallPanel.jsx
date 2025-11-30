import { colors, fonts } from '../../../theme';

export default function PromptCallPanel({
  prompt,
  promptArgs,
  onPromptArgsChange,
  promptResult,
  onGetPrompt,
  loading,
}) {
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
        Get Prompt: {prompt.name}
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
            Arguments (JSON)
          </label>
          <textarea
            value={promptArgs}
            onChange={(e) => onPromptArgsChange(e.target.value)}
            style={{
              width: '100%',
              minHeight: '150px',
              padding: '10px',
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '6px',
              fontFamily: fonts.mono,
              fontSize: '12px',
              background: colors.bgCard,
              color: colors.textPrimary,
              resize: 'vertical',
            }}
          />
        </div>
        <button
          onClick={onGetPrompt}
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
          {loading ? 'Getting...' : 'Get Prompt'}
        </button>
        {promptResult && (
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
                color: promptResult.error ? colors.error : colors.textPrimary,
                overflow: 'auto',
                maxHeight: '300px',
                margin: 0,
              }}
            >
              {JSON.stringify(promptResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
