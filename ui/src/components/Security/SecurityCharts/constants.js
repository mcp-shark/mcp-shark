import { colors } from '../../../theme.js';

export const SEVERITY_COLORS = {
  critical: colors.error,
  high: '#ea580c',
  medium: '#b45309',
  low: colors.accentBlue,
  info: colors.textTertiary,
};

export const CATEGORY_COLORS = {
  'owasp-mcp': colors.accentPurple,
  'agentic-security': colors.accentBlue,
  'general-security': colors.accentGreen,
};

export const CATEGORY_NAMES = {
  'owasp-mcp': 'OWASP MCP',
  'agentic-security': 'Agentic',
  'general-security': 'General',
};

export const OWASP_CATEGORY_MAP = {
  MCP01: 'owasp-mcp',
  MCP02: 'owasp-mcp',
  MCP03: 'owasp-mcp',
  MCP04: 'owasp-mcp',
  MCP05: 'owasp-mcp',
  MCP06: 'owasp-mcp',
  MCP07: 'owasp-mcp',
  MCP08: 'owasp-mcp',
  MCP09: 'owasp-mcp',
  MCP10: 'owasp-mcp',
  ASI01: 'agentic-security',
  ASI02: 'agentic-security',
  ASI03: 'agentic-security',
  ASI04: 'agentic-security',
  ASI05: 'agentic-security',
  ASI06: 'agentic-security',
  ASI07: 'agentic-security',
  ASI08: 'agentic-security',
  ASI09: 'agentic-security',
  ASI10: 'agentic-security',
};

export function getCategory(finding) {
  const owaspId = finding.owasp_id?.toUpperCase();
  if (owaspId && OWASP_CATEGORY_MAP[owaspId]) {
    return OWASP_CATEGORY_MAP[owaspId];
  }
  return 'general-security';
}
