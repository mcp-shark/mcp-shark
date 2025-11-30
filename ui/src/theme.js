// Gmail-inspired clean and minimal color theme
export const colors = {
  // Backgrounds - Gmail style
  bgPrimary: '#ffffff', // Pure white (Gmail main background)
  bgSecondary: '#f8f9fa', // Very light gray (Gmail sidebar/secondary areas)
  bgTertiary: '#f1f3f4', // Light gray (hover states)
  bgCard: '#ffffff', // Pure white for cards
  bgHover: '#f1f3f4', // Gmail hover color
  bgSelected: '#e8f0fe', // Gmail selected blue tint
  bgUnpaired: '#fef7e0', // Very light orange/yellow for unpaired requests/responses

  // Text - Gmail style
  textPrimary: '#202124', // Gmail primary text (almost black)
  textSecondary: '#5f6368', // Gmail secondary text (medium gray)
  textTertiary: '#80868b', // Gmail tertiary text (light gray)
  textInverse: '#ffffff', // White text

  // Borders - Gmail style
  borderLight: '#dadce0', // Gmail light border
  borderMedium: '#bdc1c6', // Gmail medium border
  borderDark: '#9aa0a6', // Gmail dark border

  // Accents - Gmail/Google Material colors
  accentBlue: '#1a73e8', // Gmail primary blue
  accentBlueHover: '#1557b0', // Darker blue on hover
  accentGreen: '#34a853', // Google green
  accentOrange: '#ea8600', // Google orange
  accentPink: '#d44638', // Gmail red (Jasper)
  accentPurple: '#9334e6', // Google purple

  // Status colors - Gmail style
  success: '#34a853', // Google green
  warning: '#fbbc04', // Google yellow
  error: '#ea4335', // Google red
  info: '#1a73e8', // Gmail blue

  // Interactive - Gmail style (lighter, less sharp)
  buttonPrimary: '#4285f4', // Lighter Google blue
  buttonPrimaryHover: '#3367d6',
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
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const fonts = {
  body: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'Roboto Mono', 'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
};
