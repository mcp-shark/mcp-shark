import { colors } from '../theme';
import {
  IconShield,
  IconExternalLink,
  IconAlertTriangle,
  IconCheck,
  IconClock,
} from '@tabler/icons-react';

export const ShieldIcon = ({ size = 24, color = 'currentColor' }) => (
  <IconShield size={size} stroke={1.5} color={color} />
);

export const ExternalLinkIcon = ({ size = 16, color = 'currentColor' }) => (
  <IconExternalLink size={size} stroke={1.5} color={color} />
);

export const AlertIcon = ({ size = 16, color = 'currentColor' }) => (
  <IconAlertTriangle size={size} stroke={1.5} color={color} />
);

export const CheckIcon = ({ size = 16, color = 'currentColor' }) => (
  <IconCheck size={size} stroke={1.5} color={color} />
);

export const CacheIcon = ({ size = 16, color = 'currentColor' }) => (
  <IconClock size={size} stroke={1.5} color={color} />
);

export const LoadingSpinner = ({ size = 16, color = colors.accentBlue }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `2px solid ${colors.borderLight}`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }}
  />
);

export const EmptyStateIcon = () => (
  <svg
    width={64}
    height={64}
    viewBox="0 0 24 24"
    fill="none"
    stroke={colors.textTertiary}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity: 0.5 }}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
