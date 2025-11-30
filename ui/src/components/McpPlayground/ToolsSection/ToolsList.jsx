import { colors } from '../../../theme';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';
import ToolItem from './ToolItem';

export default function ToolsList({
  serverStatus,
  toolsLoading,
  toolsLoaded,
  error,
  tools,
  selectedTool,
  onSelectTool,
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
      ) : toolsLoading || !toolsLoaded ? (
        <LoadingState message="Loading tools..." />
      ) : error && error.includes('tools:') ? (
        <ErrorState message={`Error loading tools: ${error.replace('tools: ', '')}`} />
      ) : tools.length === 0 ? (
        <EmptyState message="No tools available." />
      ) : (
        tools.map((tool, idx) => (
          <ToolItem
            key={idx}
            tool={tool}
            isSelected={selectedTool?.name === tool.name}
            onClick={() => onSelectTool(tool)}
          />
        ))
      )}
    </div>
  );
}
