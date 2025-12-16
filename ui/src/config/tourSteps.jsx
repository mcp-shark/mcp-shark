export const tourSteps = [
  {
    target: '[data-tour="tabs"]',
    title: 'Welcome to MCP Shark!',
    content: (
      <div>
        <p style={{ margin: '0 0 12px 0' }}>
          MCP Shark is a powerful tool for monitoring and analyzing Model Context Protocol (MCP)
          communications. Let's get you started!
        </p>
        <p style={{ margin: 0 }}>
          First, you'll need to set up the MCP Shark server. Click on the{' '}
          <strong>MCP Server Setup</strong> tab to begin.
        </p>
      </div>
    ),
    position: 'bottom',
  },
  {
    target: '[data-tour="setup-tab"]',
    title: 'Step 1: Open MCP Server Setup',
    content: (
      <div>
        <p style={{ margin: '0 0 8px 0' }}>
          Click on the <strong>MCP Server Setup</strong> tab to configure and start the MCP Shark
          server.
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#858585' }}>
          This is where you'll configure your MCP servers and start monitoring.
        </p>
      </div>
    ),
    position: 'bottom',
  },
  {
    target: '[data-tour="detected-editors"]',
    title: 'Step 2: Select Your Configuration',
    content: (
      <div>
        <p style={{ margin: '0 0 8px 0' }}>
          MCP Shark automatically detects your IDE's MCP configuration files. You have two options:
        </p>
        <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px', fontSize: '13px' }}>
          <li>
            Click on any <strong>detected editor</strong> (like Cursor or Windsurf) to use its
            config
          </li>
          <li>
            Or click <strong>"Select File"</strong> to upload your own config file
          </li>
        </ul>
        <p style={{ margin: 0, fontSize: '12px', color: '#858585' }}>
          When you click a detected editor, the file path will automatically populate in the text
          box.
        </p>
      </div>
    ),
    position: 'bottom',
  },
  {
    target: '[data-tour="select-file"]',
    title: 'Alternative: Upload Your Config',
    content: (
      <div>
        <p style={{ margin: '0 0 8px 0' }}>
          If you prefer, you can click <strong>"Select File"</strong> to upload your MCP
          configuration file directly.
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#858585' }}>
          Or manually enter the file path in the text box next to it.
        </p>
      </div>
    ),
    position: 'bottom',
  },
  {
    target: '[data-tour="start-button"]',
    title: 'Step 3: Start MCP Shark',
    content: (
      <div>
        <p style={{ margin: '0 0 8px 0' }}>
          Once you've selected a configuration file (either from detected editors or uploaded),
          click <strong>"Start MCP Shark"</strong> to begin monitoring.
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#858585' }}>
          The server will start and begin capturing all MCP traffic between your IDE and servers.
        </p>
      </div>
    ),
    position: 'top',
  },
  {
    target: '[data-tour="traffic-tab"]',
    title: 'View Your Traffic',
    content: (
      <div>
        <p style={{ margin: '0 0 8px 0' }}>
          After starting the server, switch to the <strong>Traffic Capture</strong> tab to see all
          HTTP requests and responses in real-time.
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#858585' }}>
          You can view traffic as a flat list, grouped by session, or grouped by server.
        </p>
      </div>
    ),
    position: 'bottom',
  },
  {
    target: '[data-tour="smart-scan-tab"]',
    title: 'Smart Scan - Security Analysis',
    content: (
      <div>
        <p style={{ margin: '0 0 8px 0' }}>
          The <strong>Smart Scan</strong> tab provides AI-powered security analysis for your MCP
          servers. Discover servers, run security scans, and get detailed vulnerability reports.
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#858585' }}>
          Scan results are cached automatically, so you won't waste API calls on unchanged servers.
        </p>
      </div>
    ),
    position: 'bottom',
  },
  {
    target: '[data-tour="help-button"]',
    title: 'Need Help?',
    content: (
      <div>
        <p style={{ margin: '0 0 8px 0' }}>
          Click the <strong>Start Tour</strong> button anytime to restart this guide or get help.
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#858585' }}>
          You're all set! Start by configuring your MCP server, then watch the traffic flow.
        </p>
      </div>
    ),
    position: 'left',
  },
];
