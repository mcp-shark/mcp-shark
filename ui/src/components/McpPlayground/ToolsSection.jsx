import { colors, fonts } from '../../theme';
import ToolCallPanel from './ToolsSection/ToolCallPanel';
import ToolsList from './ToolsSection/ToolsList';

export default function ToolsSection({
  tools,
  selectedTool,
  onSelectTool,
  toolArgs,
  onToolArgsChange,
  toolResult,
  onCallTool,
  loading,
  toolsLoading,
  toolsLoaded,
  serverStatus,
  error,
  onRefresh,
}) {
  const handleSelectTool = (tool) => {
    onSelectTool(tool);
    const exampleArgs = tool.inputSchema?.properties
      ? Object.keys(tool.inputSchema.properties).reduce((acc, key) => {
          const prop = tool.inputSchema.properties[key];
          acc[key] = prop.default !== undefined ? prop.default : '';
          return acc;
        }, {})
      : {};
    onToolArgsChange(JSON.stringify(exampleArgs, null, 2));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading || toolsLoading}
          style={{
            padding: '8px 16px',
            background: colors.buttonPrimary,
            color: colors.textInverse,
            border: 'none',
            borderRadius: '6px',
            cursor: loading || toolsLoading ? 'not-allowed' : 'pointer',
            fontFamily: fonts.body,
            fontSize: '13px',
            fontWeight: '500',
            opacity: loading || toolsLoading ? 0.6 : 1,
          }}
        >
          {toolsLoading ? 'Loading...' : 'Refresh Tools'}
        </button>
        <span style={{ color: colors.textSecondary, fontSize: '13px' }}>
          {toolsLoading
            ? 'Loading tools...'
            : `${tools.length} tool${tools.length !== 1 ? 's' : ''} available`}
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
            Available Tools
          </div>
          <ToolsList
            serverStatus={serverStatus}
            toolsLoading={toolsLoading}
            toolsLoaded={toolsLoaded}
            error={error}
            tools={tools}
            selectedTool={selectedTool}
            onSelectTool={handleSelectTool}
          />
        </div>

        {selectedTool && (
          <ToolCallPanel
            tool={selectedTool}
            toolArgs={toolArgs}
            onToolArgsChange={onToolArgsChange}
            toolResult={toolResult}
            onCallTool={onCallTool}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
