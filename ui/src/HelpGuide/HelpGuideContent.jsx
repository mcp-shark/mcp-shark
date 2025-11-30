import { colors, fonts } from '../theme';

export default function HelpGuideContent() {
  return (
    <div
      style={{
        color: colors.textPrimary,
        lineHeight: '1.6',
        fontSize: '14px',
        fontFamily: fonts.body,
      }}
    >
      <section style={{ marginBottom: '24px' }}>
        <h3
          style={{
            color: colors.accentBlue,
            marginTop: 0,
            marginBottom: '12px',
            fontSize: '16px',
            fontFamily: fonts.body,
          }}
        >
          What is MCP Shark?
        </h3>
        <p style={{ margin: 0, color: colors.textSecondary }}>
          MCP Shark is a powerful tool for monitoring, debugging, and analyzing Model Context
          Protocol (MCP) traffic. It captures all communication between MCP clients and servers,
          allowing you to inspect requests, responses, and understand the flow of data.
        </p>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h3
          style={{
            color: colors.accentBlue,
            marginTop: 0,
            marginBottom: '12px',
            fontSize: '16px',
            fontFamily: fonts.body,
          }}
        >
          Getting Started
        </h3>
        <ol style={{ margin: 0, paddingLeft: '20px', color: colors.textSecondary }}>
          <li style={{ marginBottom: '8px' }}>
            Go to the <strong>Setup</strong> tab to configure your MCP servers
          </li>
          <li style={{ marginBottom: '8px' }}>
            Start the MCP Shark server to begin capturing traffic
          </li>
          <li style={{ marginBottom: '8px' }}>
            Use your MCP client (Cursor, Claude Desktop, etc.) as normal
          </li>
          <li style={{ marginBottom: '8px' }}>
            View captured traffic in the <strong>Traffic Capture</strong> tab
          </li>
        </ol>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h3
          style={{
            color: colors.accentBlue,
            marginTop: 0,
            marginBottom: '12px',
            fontSize: '16px',
            fontFamily: fonts.body,
          }}
        >
          Traffic Capture Features
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: colors.textSecondary }}>
          <li style={{ marginBottom: '8px' }}>
            <strong>General List:</strong> View all requests in a flat chronological list
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>MCP Protocol View:</strong> Organize traffic by MCP protocol categories
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Filters:</strong> Use the search bar and filters to find specific requests,
            sessions, or servers
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Details:</strong> Click any request to view full headers, body, and metadata
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h3
          style={{
            color: colors.accentBlue,
            marginTop: 0,
            marginBottom: '12px',
            fontSize: '16px',
            fontFamily: fonts.body,
          }}
        >
          Tips
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: colors.textSecondary }}>
          <li style={{ marginBottom: '8px' }}>
            Use the search bar to find requests by method, URL, JSON-RPC method, or any text content
          </li>
          <li style={{ marginBottom: '8px' }}>
            Filter by session ID to track a specific conversation
          </li>
          <li style={{ marginBottom: '8px' }}>
            Filter by server name to see all traffic for a specific MCP server
          </li>
          <li style={{ marginBottom: '8px' }}>
            Click on request/response rows to see detailed packet information
          </li>
        </ul>
      </section>
    </div>
  );
}
