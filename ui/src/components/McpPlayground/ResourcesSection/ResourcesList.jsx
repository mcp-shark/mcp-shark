import { colors } from '../../../theme';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';
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
      ) : error && error.includes('resources:') ? (
        <ErrorState message={`Error loading resources: ${error.replace('resources: ', '')}`} />
      ) : resources.length === 0 ? (
        <EmptyState message="No resources available." />
      ) : (
        resources.map((resource, idx) => (
          <ResourceItem
            key={idx}
            resource={resource}
            isSelected={selectedResource?.uri === resource.uri}
            onClick={() => onSelectResource(resource)}
          />
        ))
      )}
    </div>
  );
}
