import { colors } from '../../../theme';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';
import LoadingState from '../common/LoadingState';
import ResourceItem from './ResourceItem';

export default function ResourcesList({
  serverStatus,
  resourcesLoading,
  resourcesLoaded,
  error,
  resources,
  selectedResource,
  onSelectResource,
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
      ) : resourcesLoading || !resourcesLoaded ? (
        <LoadingState message="Loading resources..." />
      ) : error?.includes('resources:') ? (
        <ErrorState message={`Error loading resources: ${error.replace('resources: ', '')}`} />
      ) : resources.length === 0 ? (
        <EmptyState message="No resources available." />
      ) : (
        <div style={{ padding: '8px 0' }}>
          {resources.map((resource, idx) => (
            <ResourceItem
              key={resource.uri || `resource-${idx}`}
              resource={resource}
              isSelected={selectedResource?.uri === resource.uri}
              onClick={() => onSelectResource(resource)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
