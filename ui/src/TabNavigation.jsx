import { colors, fonts } from './theme';
import { SharkLogo } from './components/SharkLogo';

// SVG Icon Components
const NetworkIcon = ({ size = 16, color = 'currentColor' }) => (
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
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="M17.5 6.5c-2.5 2.5-6.5 6.5-11 11" />
    <path d="M6.5 17.5c2.5-2.5 6.5-6.5 11-11" />
    <path d="M17.5 17.5c-2.5-2.5-6.5-6.5-11-11" />
    <path d="M6.5 6.5c2.5 2.5 6.5 6.5 11 11" />
  </svg>
);

const LogsIcon = ({ size = 16, color = 'currentColor' }) => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const SettingsIcon = ({ size = 16, color = 'currentColor' }) => (
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
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
  </svg>
);

function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: 'traffic',
      label: 'Traffic Capture',
      icon: NetworkIcon,
      description: 'Wireshark-like HTTP request/response analysis for forensic investigation',
    },
    {
      id: 'logs',
      label: 'MCP Shark Logs',
      icon: LogsIcon,
      description: 'View MCP Shark server console output and debug logs',
    },
    {
      id: 'setup',
      label: 'MCP Server Setup',
      icon: SettingsIcon,
      description: 'Configure and manage MCP Shark server',
    },
  ];

  return (
    <div
      style={{
        borderBottom: `1px solid ${colors.borderLight}`,
        background: colors.bgCard,
        boxShadow: `0 1px 3px ${colors.shadowSm}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingRight: '12px',
            borderRight: `1px solid ${colors.borderLight}`,
          }}
        >
          <SharkLogo size={24} />
          <span
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              fontFamily: fonts.body,
            }}
          >
            MCP Shark
          </span>
        </div>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tour={
              tab.id === 'traffic' ? 'traffic-tab' : tab.id === 'logs' ? 'logs-tab' : 'setup-tab'
            }
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: '14px 24px',
              background: activeTab === tab.id ? colors.bgSecondary : 'transparent',
              border: 'none',
              borderBottom:
                activeTab === tab.id ? `3px solid ${colors.accentBlue}` : '3px solid transparent',
              color: activeTab === tab.id ? colors.textPrimary : colors.textSecondary,
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: fonts.body,
              fontWeight: activeTab === tab.id ? '600' : '400',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
              transition: 'all 0.2s',
              position: 'relative',
              borderRadius: '8px 8px 0 0',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = colors.bgHover;
                e.currentTarget.style.color = colors.textPrimary;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = colors.textSecondary;
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', color: 'currentColor' }}>
                <tab.icon size={16} />
              </div>
              <span>{tab.label}</span>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: activeTab === tab.id ? colors.textSecondary : colors.textTertiary,
                fontWeight: '400',
                fontFamily: fonts.body,
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
