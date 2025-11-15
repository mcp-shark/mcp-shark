import { colors, fonts } from '../../theme';

export default function PromptsSection({
  prompts,
  selectedPrompt,
  onSelectPrompt,
  promptArgs,
  onPromptArgsChange,
  promptResult,
  onGetPrompt,
  loading,
  promptsLoading,
  promptsLoaded,
  serverStatus,
  error,
  onRefresh,
}) {
  const handleSelectPrompt = (prompt) => {
    onSelectPrompt(prompt);
    const exampleArgs = prompt.arguments
      ? prompt.arguments.reduce((acc, arg) => {
          acc[arg.name] = arg.default !== undefined ? arg.default : '';
          return acc;
        }, {})
      : {};
    onPromptArgsChange(JSON.stringify(exampleArgs, null, 2));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={onRefresh}
          disabled={loading || promptsLoading}
          style={{
            padding: '8px 16px',
            background: colors.buttonPrimary,
            color: colors.textInverse,
            border: 'none',
            borderRadius: '6px',
            cursor: loading || promptsLoading ? 'not-allowed' : 'pointer',
            fontFamily: fonts.body,
            fontSize: '13px',
            fontWeight: '500',
            opacity: loading || promptsLoading ? 0.6 : 1,
          }}
        >
          {promptsLoading ? 'Loading...' : 'Refresh Prompts'}
        </button>
        <span style={{ color: colors.textSecondary, fontSize: '13px' }}>
          {promptsLoading
            ? 'Loading prompts...'
            : `${prompts.length} prompt${prompts.length !== 1 ? 's' : ''} available`}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
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
            Available Prompts
          </div>
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              background: colors.bgCard,
              position: 'relative',
            }}
          >
            {!serverStatus?.running ? (
              <LoadingState message="Waiting for MCP server to start..." />
            ) : promptsLoading || !promptsLoaded ? (
              <LoadingState message="Loading prompts..." />
            ) : error && error.includes('prompts:') ? (
              <ErrorState message={`Error loading prompts: ${error.replace('prompts: ', '')}`} />
            ) : prompts.length === 0 ? (
              <EmptyState message="No prompts available." />
            ) : (
              prompts.map((prompt, idx) => (
                <PromptItem
                  key={idx}
                  prompt={prompt}
                  isSelected={selectedPrompt?.name === prompt.name}
                  onClick={() => handleSelectPrompt(prompt)}
                />
              ))
            )}
          </div>
        </div>

        {selectedPrompt && (
          <PromptCallPanel
            prompt={selectedPrompt}
            promptArgs={promptArgs}
            onPromptArgsChange={onPromptArgsChange}
            promptResult={promptResult}
            onGetPrompt={onGetPrompt}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

function LoadingState({ message }) {
  return (
    <div
      style={{
        padding: '40px',
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: '13px',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          margin: '0 auto 16px',
          border: `3px solid ${colors.borderLight}`,
          borderTop: `3px solid ${colors.accentBlue}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      {message}
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div
      style={{
        padding: '24px',
        textAlign: 'center',
        color: colors.error,
        fontSize: '13px',
      }}
    >
      {message}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div
      style={{
        padding: '24px',
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: '13px',
      }}
    >
      {message}
    </div>
  );
}

function PromptItem({ prompt, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px',
        borderBottom: `1px solid ${colors.borderLight}`,
        cursor: 'pointer',
        background: isSelected ? colors.bgSecondary : colors.bgCard,
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = colors.bgHover;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = colors.bgCard;
        }
      }}
    >
      <div
        style={{
          fontWeight: '500',
          fontSize: '13px',
          color: colors.textPrimary,
          marginBottom: '4px',
        }}
      >
        {prompt.name}
      </div>
      {prompt.description && (
        <div
          style={{
            fontSize: '12px',
            color: colors.textSecondary,
            marginTop: '4px',
          }}
        >
          {prompt.description}
        </div>
      )}
    </div>
  );
}

function PromptCallPanel({
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
