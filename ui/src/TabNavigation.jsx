function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'traffic', label: 'Traffic Capture', icon: '📊', description: 'Wireshark-like HTTP request/response analysis for forensic investigation' },
    { id: 'logs', label: 'MCP Shark Logs', icon: '📝', description: 'View MCP Shark server console output and debug logs' },
    { id: 'setup', label: 'MCP Server Setup', icon: '⚙️', description: 'Configure and manage MCP Shark server' },
  ];

  return (
    <div
      style={{
        borderBottom: '1px solid #333',
        background: '#1e1e1e',
      }}
    >
      <div
        style={{
          display: 'flex',
          padding: '0 16px',
          gap: '4px',
        }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: '12px 20px',
              background: activeTab === tab.id ? '#252526' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #0e639c' : '2px solid transparent',
              color: activeTab === tab.id ? '#d4d4d4' : '#858585',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? '500' : 'normal',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2px',
              transition: 'all 0.2s',
              position: 'relative',
            }}
            onMouseEnter={e => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = '#252526';
                e.currentTarget.style.color = '#d4d4d4';
              }
            }}
            onMouseLeave={e => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#858585';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: activeTab === tab.id ? '#858585' : '#666',
                fontWeight: 'normal',
              }}
            >
              {tab.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default TabNavigation;

