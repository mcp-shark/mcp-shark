import { colors, fonts } from '../../theme';

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
              <ErrorState
                message={`Error loading resources: ${error.replace('resources: ', '')}`}
              />
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

function ResourceItem({ resource, isSelected, onClick }) {
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
        {resource.uri}
      </div>
      {resource.name && (
        <div
          style={{
            fontSize: '12px',
            color: colors.textSecondary,
            marginTop: '4px',
          }}
        >
          {resource.name}
        </div>
      )}
      {resource.description && (
        <div
          style={{
            fontSize: '12px',
            color: colors.textSecondary,
            marginTop: '4px',
          }}
        >
          {resource.description}
        </div>
      )}
    </div>
  );
}

function ResourceCallPanel({ resource, resourceResult, onReadResource, loading }) {
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
