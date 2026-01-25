import { IconRobot, IconShield, IconShieldLock } from '@tabler/icons-react';
import { colors } from '../../../theme.js';

export const CATEGORIES = {
  'owasp-mcp': {
    id: 'owasp-mcp',
    name: 'OWASP MCP Top 10',
    description: 'Model Context Protocol vulnerabilities',
    icon: IconShieldLock,
    color: colors.accentPurple,
  },
  'agentic-security': {
    id: 'agentic-security',
    name: 'Agentic Security',
    description: 'AI agent behavioral issues',
    icon: IconRobot,
    color: colors.accentBlue,
  },
  'general-security': {
    id: 'general-security',
    name: 'General Security',
    description: 'Common vulnerabilities',
    icon: IconShield,
    color: colors.accentGreen,
  },
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

export const OWASP_DESCRIPTIONS = {
  MCP01: 'Token Mismanagement',
  MCP02: 'Scope Creep',
  MCP03: 'Tool Poisoning',
  MCP04: 'Supply Chain',
  MCP05: 'Command Injection',
  MCP06: 'Prompt Injection',
  MCP07: 'Insufficient Auth',
  MCP08: 'Lack of Audit',
  MCP09: 'Shadow Servers',
  MCP10: 'Context Injection',
  ASI01: 'Goal Hijack',
  ASI02: 'Tool Misuse',
  ASI03: 'Identity Abuse',
  ASI04: 'Supply Chain',
  ASI05: 'Remote Code Execution',
  ASI06: 'Memory Poisoning',
  ASI07: 'Insecure Communication',
  ASI08: 'Cascading Failures',
  ASI09: 'Trust Exploitation',
  ASI10: 'Rogue Agent',
  SECRET: 'Hardcoded Secrets',
  'CMD-INJ': 'Command Injection',
  SHADOW: 'Cross-Server Shadowing',
  AMBIG: 'Tool Name Ambiguity',
};

export const SEVERITY_COLORS = {
  critical: colors.error,
  high: '#ea580c',
  medium: '#b45309',
  low: colors.accentBlue,
  info: colors.textTertiary,
};

export function getCategory(finding) {
  const owaspId = finding.owasp_id?.toUpperCase();
  if (owaspId && OWASP_CATEGORY_MAP[owaspId]) {
    return OWASP_CATEGORY_MAP[owaspId];
  }
  return 'general-security';
}
