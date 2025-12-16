import { colors, fonts } from '../../theme';
import ResourceCallPanel from './ResourcesSection/ResourceCallPanel';
import ResourcesList from './ResourcesSection/ResourcesList';

export default function ResourcesSection({
  resources,
  selectedResource,
  onSelectResource,
  resourceResult,
  onReadResource,
  loading,
  resourcesLoading,
  resourcesLoaded,
  serverStatus,
  error,
  onRefresh,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading || resourcesLoading}
          style={{
            padding: '8px 16px',
            background: colors.buttonPrimary,
            color: colors.textInverse,
            border: 'none',
            borderRadius: '6px',
            cursor: loading || resourcesLoading ? 'not-allowed' : 'pointer',
            fontFamily: fonts.body,
            fontSize: '13px',
            fontWeight: '500',
            opacity: loading || resourcesLoading ? 0.6 : 1,
          }}
        >
          {resourcesLoading ? 'Loading...' : 'Refresh Resources'}
        </button>
        <span style={{ color: colors.textSecondary, fontSize: '13px' }}>
          {resourcesLoading
            ? 'Loading resources...'
            : `${resources.length} resource${resources.length !== 1 ? 's' : ''} available`}
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
            Available Resources
          </div>
          <ResourcesList
            serverStatus={serverStatus}
            resourcesLoading={resourcesLoading}
            resourcesLoaded={resourcesLoaded}
            error={error}
            resources={resources}
            selectedResource={selectedResource}
            onSelectResource={onSelectResource}
          />
        </div>

        {selectedResource && (
          <ResourceCallPanel
            resource={selectedResource}
            resourceResult={resourceResult}
            onReadResource={onReadResource}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
