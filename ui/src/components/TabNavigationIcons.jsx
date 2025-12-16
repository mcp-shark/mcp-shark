// Tabler Icons for Tab Navigation
// Using @tabler/icons-react - install with: npm install @tabler/icons-react
import {
  IconBrandStackoverflow,
  IconChevronDown,
  IconFileText,
  IconMenu2,
  IconNetwork,
  IconSettings,
  IconShield,
} from '@tabler/icons-react';

// Wrapper components to match existing API
export const NetworkIcon = ({ size = 16, color = 'currentColor' }) => (
  <IconNetwork size={size} stroke={1.5} color={color} />
);

export const LogsIcon = ({ size = 16, color = 'currentColor' }) => (
  <IconFileText size={size} stroke={1.5} color={color} />
);

export const SettingsIcon = ({ size = 16, color = 'currentColor' }) => (
  <IconSettings size={size} stroke={1.5} color={color} />
);

export const PlaygroundIcon = ({ size = 16, color = 'currentColor' }) => (
  <IconBrandStackoverflow size={size} stroke={1.5} color={color} />
);

export const ShieldIcon = ({ size = 16, color = 'currentColor' }) => (
  <IconShield size={size} stroke={1.5} color={color} />
);

export const MenuIcon = ({ size = 16, color = 'currentColor' }) => (
  <IconMenu2 size={size} stroke={1.5} color={color} />
);

export const ChevronDownIcon = ({ size = 16, color = 'currentColor' }) => (
  <IconChevronDown size={size} stroke={1.5} color={color} />
);
