import { colors, fonts } from '../theme';
import LoadingModal from './McpPlayground/LoadingModal';
import PromptsSection from './McpPlayground/PromptsSection';
import ResourcesSection from './McpPlayground/ResourcesSection';
import ToolsSection from './McpPlayground/ToolsSection';
import { useMcpPlayground } from './McpPlayground/useMcpPlayground';

function McpPlayground() {
  const {
    activeSection,
    setActiveSection,
    tools,
    prompts,
    resources,
    loading,
    error,
    selectedTool,
    setSelectedTool,
    toolArgs,
    setToolArgs,
    toolResult,
    selectedPrompt,
    setSelectedPrompt,
    promptArgs,
    setPromptArgs,
    promptResult,
    selectedResource,
    setSelectedResource,
    resourceResult,
    serverStatus,
    showLoadingModal,
    toolsLoading,
    promptsLoading,
    resourcesLoading,
    toolsLoaded,
    promptsLoaded,
    resourcesLoaded,
    loadTools,
    loadPrompts,
    loadResources,
    handleCallTool,
    handleGetPrompt,
    handleReadResource,
    availableServers,
    selectedServer,
    setSelectedServer,
  } = useMcpPlayground();

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: colors.bgPrimary,
          padding: '20px',
          gap: '16px',
          position: 'relative',
        }}
      >
        <LoadingModal show={showLoadingModal} />

        {error && !error.includes(':') && (
          <div
            style={{
              padding: '12px 16px',
              background: colors.error,
              color: colors.textInverse,
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: fonts.body,
            }}
          >
            Error: {error}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {availableServers.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <label
                htmlFor="mcp-server-select"
                style={{
                  fontSize: '13px',
                  fontFamily: fonts.body,
                  color: colors.textSecondary,
                  fontWeight: '500',
                }}
              >
                Server:
              </label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {availableServers.map((server) => (
                  <button
                    key={server}
                    type="button"
                    onClick={() => setSelectedServer(server)}
                    style={{
                      padding: '10px 18px',
                      background:
                        selectedServer === server ? colors.accentBlue : colors.bgSecondary,
                      border:
                        selectedServer === server
                          ? `2px solid ${colors.accentBlue}`
                          : `1px solid ${colors.borderLight}`,
                      borderRadius: '8px',
                      color: selectedServer === server ? colors.textInverse : colors.textPrimary,
                      fontSize: '13px',
                      fontFamily: fonts.body,
                      fontWeight: selectedServer === server ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow:
                        selectedServer === server ? `0 2px 4px ${colors.shadowSm}` : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedServer !== server) {
                        e.currentTarget.style.background = colors.bgHover;
                        e.currentTarget.style.borderColor = colors.borderMedium;
                        e.currentTarget.style.boxShadow = `0 2px 4px ${colors.shadowSm}`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedServer !== server) {
                        e.currentTarget.style.background = colors.bgSecondary;
                        e.currentTarget.style.borderColor = colors.borderLight;
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {server}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              borderBottom: `1px solid ${colors.borderLight}`,
            }}
          >
            {['tools', 'prompts', 'resources'].map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setActiveSection(section)}
                style={{
                  padding: '10px 18px',
                  background: activeSection === section ? colors.bgSecondary : 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${activeSection === section ? colors.accentBlue : 'transparent'}`,
                  color: activeSection === section ? colors.textPrimary : colors.textSecondary,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: fonts.body,
                  fontWeight: activeSection === section ? '500' : '400',
                  textTransform: 'capitalize',
                  borderRadius: '6px 6px 0 0',
                  transition: 'all 0.2s',
                }}
              >
                {section}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {activeSection === 'tools' && (
            <ToolsSection
              tools={tools}
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
              toolArgs={toolArgs}
              onToolArgsChange={setToolArgs}
              toolResult={toolResult}
              onCallTool={handleCallTool}
              loading={loading}
              toolsLoading={toolsLoading}
              toolsLoaded={toolsLoaded}
              serverStatus={serverStatus}
              error={error}
              onRefresh={loadTools}
            />
          )}
          {activeSection === 'prompts' && (
            <PromptsSection
              prompts={prompts}
              selectedPrompt={selectedPrompt}
              onSelectPrompt={setSelectedPrompt}
              promptArgs={promptArgs}
              onPromptArgsChange={setPromptArgs}
              promptResult={promptResult}
              onGetPrompt={handleGetPrompt}
              loading={loading}
              promptsLoading={promptsLoading}
              promptsLoaded={promptsLoaded}
              serverStatus={serverStatus}
              error={error}
              onRefresh={loadPrompts}
            />
          )}
          {activeSection === 'resources' && (
            <ResourcesSection
              resources={resources}
              selectedResource={selectedResource}
              onSelectResource={setSelectedResource}
              resourceResult={resourceResult}
              onReadResource={handleReadResource}
              loading={loading}
              resourcesLoading={resourcesLoading}
              resourcesLoaded={resourcesLoaded}
              serverStatus={serverStatus}
              error={error}
              onRefresh={loadResources}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default McpPlayground;
