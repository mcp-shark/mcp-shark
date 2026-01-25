// Gmail-inspired clean and minimal color theme
export const colors = {
  // Backgrounds - Gmail style
  bgPrimary: '#ffffff', // Pure white (Gmail main background)
  bgSecondary: '#f8f9fa', // Very light gray (Gmail sidebar/secondary areas)
  bgTertiary: '#f1f3f4', // Light gray (hover states)
  bgCard: '#ffffff', // Pure white for cards
  bgHover: '#f1f3f4', // Gmail hover color
  bgSelected: '#e8f0fe', // Gmail selected blue tint
  bgUnpaired: '#f5f5f4', // Light stone gray for unpaired requests/responses
  surface: '#f8f9fa', // Alias for bgSecondary

  // Text - Gmail style
  textPrimary: '#202124', // Gmail primary text (almost black)
  textSecondary: '#5f6368', // Gmail secondary text (medium gray)
  textTertiary: '#80868b', // Gmail tertiary text (light gray)
  textInverse: '#ffffff', // White text
  text: '#202124', // Alias for textPrimary
  textMuted: '#5f6368', // Alias for textSecondary

  // Borders - Gmail style
  borderLight: '#dadce0', // Gmail light border
  borderMedium: '#bdc1c6', // Gmail medium border
  borderDark: '#9aa0a6', // Gmail dark border

  // Accents - Clean, professional colors
  accent: '#4a5568', // Neutral gray-blue
  accentBlue: '#2d3748', // Dark slate (professional, not bright)
  accentBlueHover: '#1a202c', // Darker slate on hover
  accentGreen: '#38a169', // Balanced green
  accentOrange: '#78716c', // Warm stone gray (replaces orange)
  accentPink: '#c53030', // Deep red
  accentPurple: '#4a5568', // Replaced with slate gray

  // Status colors - Clean palette
  success: '#38a169', // Balanced green
  warning: '#d69e2e', // Warm yellow
  error: '#c53030', // Deep red
  errorBg: '#fef2f2', // Light red background for error messages
  info: '#4a5568', // Neutral slate

  // Interactive - Professional, subtle
  buttonPrimary: '#2d3748', // Dark slate
  buttonPrimaryHover: '#1a202c',
  buttonSecondary: '#f1f3f4', // Light gray
  buttonSecondaryHover: '#e8eaed',
  buttonDanger: '#ea4335', // Google red (lighter)
  buttonDangerHover: '#d33b2c',

  // Shadows - Gmail style (subtle)
  shadowSm: 'rgba(60, 64, 67, 0.08)', // Gmail subtle shadow
  shadowMd: 'rgba(60, 64, 67, 0.12)', // Gmail medium shadow
  shadowLg: 'rgba(60, 64, 67, 0.16)', // Gmail larger shadow
};

// Helper function to add opacity to hex colors
export function withOpacity(color, opacity) {
  // Remove # if present
  const hex = color.replace('#', '');
  // Convert to RGB
  const r = Number.parseInt(hex.substring(0, 2), 16);
  const g = Number.parseInt(hex.substring(2, 4), 16);
  const b = Number.parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const fonts = {
  body: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  heading: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'Roboto Mono', 'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  sizes: {
    xs: '11px',
    sm: '13px',
    md: '14px',
    lg: '16px',
    xl: '18px',
  },
};
