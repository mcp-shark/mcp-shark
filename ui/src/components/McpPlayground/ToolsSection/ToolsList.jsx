import { colors } from '../../../theme';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';
import LoadingState from '../common/LoadingState';
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
      ) : error?.includes('tools:') ? (
        <ErrorState message={`Error loading tools: ${error.replace('tools: ', '')}`} />
      ) : tools.length === 0 ? (
        <EmptyState message="No tools available." />
      ) : (
        <div style={{ padding: '8px 0' }}>
          {tools.map((tool, idx) => (
            <ToolItem
              key={tool.name || `tool-${idx}`}
              tool={tool}
              isSelected={selectedTool?.name === tool.name}
              onClick={() => onSelectTool(tool)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
