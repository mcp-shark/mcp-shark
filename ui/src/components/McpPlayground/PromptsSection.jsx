import { colors, fonts } from '../../theme';
import PromptCallPanel from './PromptsSection/PromptCallPanel';
import PromptsList from './PromptsSection/PromptsList';

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
          type="button"
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
          <PromptsList
            serverStatus={serverStatus}
            promptsLoading={promptsLoading}
            promptsLoaded={promptsLoaded}
            error={error}
            prompts={prompts}
            selectedPrompt={selectedPrompt}
            onSelectPrompt={handleSelectPrompt}
          />
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
