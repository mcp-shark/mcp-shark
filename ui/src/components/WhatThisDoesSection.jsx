import { colors, fonts } from '../theme';

export default function WhatThisDoesSection({ filePath, updatePath }) {
  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '12px',
        padding: '24px',
        boxShadow: `0 2px 4px ${colors.shadowSm}`,
      }}
    >
      <h3
        style={{
          fontSize: '15px',
          fontWeight: '600',
          marginBottom: '12px',
          color: colors.textPrimary,
          fontFamily: fonts.body,
        }}
      >
        What This Does
      </h3>
      <ul
        style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '13px',
          color: colors.textSecondary,
          lineHeight: '1.8',
          fontFamily: fonts.body,
        }}
      >
        <li>
          Converts your MCP config (
          <code style={{ color: colors.accentOrange, fontFamily: fonts.mono }}>mcpServers</code>) to
          MCP Shark format (
          <code style={{ color: colors.accentOrange, fontFamily: fonts.mono }}>servers</code>)
        </li>
        <li>
          Starts the MCP Shark server on{' '}
          <code style={{ color: colors.accentBlue, fontFamily: fonts.mono }}>
            http://localhost:9851/mcp
          </code>
        </li>
        <li>
          {filePath || updatePath
            ? 'Updates your original config file to point to the MCP Shark server (creates a backup first)'
            : 'Note: Provide a file path to update your original config file automatically'}
        </li>
        {(filePath || updatePath) && (
          <li style={{ color: colors.success, marginTop: '4px', fontWeight: '500' }}>
            ✓ Original config will be automatically restored when you stop the server or close the
            UI
          </li>
        )}
      </ul>
    </div>
  );
}
