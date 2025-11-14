import { colors } from '../theme';

export default function WhatThisDoesSection({ filePath, updatePath }) {
  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '6px',
        padding: '20px',
      }}
    >
      <h3 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: '#d4d4d4' }}>
        What This Does
      </h3>
      <ul
        style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '13px',
          color: colors.textSecondary,
          lineHeight: '1.8',
        }}
      >
        <li>
          Converts your MCP config (<code style={{ color: '#dcdcaa' }}>mcpServers</code>) to MCP
          Shark format (<code style={{ color: '#dcdcaa' }}>servers</code>)
        </li>
        <li>
          Starts the MCP Shark server on{' '}
          <code style={{ color: '#4ec9b0' }}>http://localhost:9851/mcp</code>
        </li>
        <li>
          {filePath || updatePath
            ? 'Updates your original config file to point to the MCP Shark server (creates a backup first)'
            : 'Note: Provide a file path to update your original config file automatically'}
        </li>
        {(filePath || updatePath) && (
          <li style={{ color: '#89d185', marginTop: '4px' }}>
            ✓ Original config will be automatically restored when you stop the server or close the
            UI
          </li>
        )}
      </ul>
    </div>
  );
}
