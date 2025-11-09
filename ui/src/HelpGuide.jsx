import { useState, useEffect } from 'react';

// SVG Icon Components
const HelpIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CloseIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function HelpGuide({ onClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = async () => {
    if (dontShowAgain) {
      try {
        await fetch('/api/help/dismiss', { method: 'POST' });
      } catch (error) {
        console.error('Failed to save help state:', error);
      }
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: '#252526',
          border: '1px solid #3e3e42',
          borderRadius: '8px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #3e3e42',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: '#4ec9b0' }}>
              <HelpIcon size={24} />
            </div>
            <h2 style={{ margin: 0, color: '#d4d4d4', fontSize: '20px', fontWeight: '600' }}>
              Welcome to MCP Shark
            </h2>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#858585',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3e3e42';
              e.currentTarget.style.color = '#d4d4d4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#858585';
            }}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{ color: '#d4d4d4', lineHeight: '1.6', fontSize: '14px' }}>
            <section style={{ marginBottom: '24px' }}>
              <h3
                style={{ color: '#4ec9b0', marginTop: 0, marginBottom: '12px', fontSize: '16px' }}
              >
                What is MCP Shark?
              </h3>
              <p style={{ margin: 0, color: '#cccccc' }}>
                MCP Shark is a powerful tool for monitoring and analyzing Model Context Protocol
                (MCP) communications. It captures all HTTP requests and responses between your IDE
                and MCP servers, providing Wireshark-like forensic analysis capabilities.
              </p>
            </section>

            <section style={{ marginBottom: '24px' }}>
              <h3
                style={{ color: '#4ec9b0', marginTop: 0, marginBottom: '12px', fontSize: '16px' }}
              >
                Getting Started
              </h3>
              <ol style={{ margin: 0, paddingLeft: '20px', color: '#cccccc' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Setup Tab:</strong> Go to the "MCP Server Setup" tab to configure and
                  start the MCP Shark server
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Traffic Capture:</strong> Once running, all MCP traffic will be captured
                  and displayed in the "Traffic Capture" tab
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>View Logs:</strong> Check the "MCP Shark Logs" tab for server console
                  output and debug information
                </li>
              </ol>
            </section>

            <section style={{ marginBottom: '24px' }}>
              <h3
                style={{ color: '#4ec9b0', marginTop: 0, marginBottom: '12px', fontSize: '16px' }}
              >
                Traffic Capture Features
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#cccccc' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>General List:</strong> View all requests in a flat chronological list
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Grouped by Session & Server:</strong> Organize traffic by session ID, then
                  by downstream server
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Grouped by Server & Session:</strong> Organize traffic by server, then by
                  session ID
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Filters:</strong> Use the search bar and filters to find specific
                  requests, sessions, or servers
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Details:</strong> Click any request to view full headers, body, and
                  metadata
                </li>
              </ul>
            </section>

            <section style={{ marginBottom: '24px' }}>
              <h3
                style={{ color: '#4ec9b0', marginTop: 0, marginBottom: '12px', fontSize: '16px' }}
              >
                Tips
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#cccccc' }}>
                <li style={{ marginBottom: '8px' }}>
                  Use the search bar to find requests by method, URL, JSON-RPC method, or any text
                  content
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

          {/* Footer */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #3e3e42',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#858585',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Don't show this again
            </label>
            <button
              onClick={handleClose}
              style={{
                background: '#0e639c',
                border: 'none',
                color: '#ffffff',
                padding: '8px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1177bb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0e639c';
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpGuide;
