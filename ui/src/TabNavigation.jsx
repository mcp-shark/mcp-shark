import { useEffect, useRef, useState } from 'react';
import { SharkLogo } from './components/SharkLogo';
import DesktopTabs from './components/TabNavigation/DesktopTabs';
import MobileDropdown from './components/TabNavigation/MobileDropdown';
import {
  LogsIcon,
  NetworkIcon,
  PlaygroundIcon,
  SettingsIcon,
  ShieldIcon,
} from './components/TabNavigationIcons';
import { colors, fonts } from './theme';

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
    {
      id: 'playground',
      label: 'MCP Playground',
      icon: PlaygroundIcon,
      description: 'Test and interact with MCP tools, prompts, and resources',
    },
    {
      id: 'smart-scan',
      label: 'Smart Scan',
      icon: ShieldIcon,
      description: 'AI-powered security analysis for MCP servers',
    },
  ];

  const tabRefs = useRef({});
  const indicatorRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Check window size and handle resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1200);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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
        {isMobile ? (
          <MobileDropdown
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            dropdownRef={dropdownRef}
          />
        ) : (
          <DesktopTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
            tabRefs={tabRefs}
            indicatorRef={indicatorRef}
          />
        )}
      </div>
    </div>
  );
}

export default TabNavigation;
