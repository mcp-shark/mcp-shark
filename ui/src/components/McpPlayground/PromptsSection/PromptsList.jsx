import { colors } from '../../../theme';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';
import PromptItem from './PromptItem';

export default function PromptsList({
  serverStatus,
  promptsLoading,
  promptsLoaded,
  error,
  prompts,
  selectedPrompt,
  onSelectPrompt,
}) {
  return (
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
            onClick={() => onSelectPrompt(prompt)}
          />
        ))
      )}
    </div>
  );
}
