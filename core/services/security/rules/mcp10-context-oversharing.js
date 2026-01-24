/**
 * MCP10: Context Injection & Over-Sharing
 * Detects patterns that could leak sensitive information across sessions or agents
 */

const SENSITIVE_DATA_PATTERNS = [
  // Personal Identifiable Information (PII)
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, name: 'SSN', severity: 'critical' },
  { pattern: /\b\d{9}\b/g, name: 'SSN (no dashes)', severity: 'medium' },
  { pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, name: 'Credit Card Number', severity: 'critical' },
  { pattern: /\b[A-Z]{2}\d{7}\b/g, name: 'Passport Number', severity: 'high' },

  // Contact Information
  {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    name: 'Email Address',
    severity: 'medium',
  },
  {
    pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    name: 'Phone Number',
    severity: 'medium',
  },

  // Healthcare
  {
    pattern: /\b(?:diagnosis|patient|medical\s+record|health\s+information)\b/gi,
    name: 'Healthcare Data Reference',
    severity: 'high',
  },
  {
    pattern: /\b(?:HIPAA|PHI|protected\s+health)\b/gi,
    name: 'Healthcare Compliance Reference',
    severity: 'medium',
  },

  // Financial
  {
    pattern: /\b(?:account\s+number|routing\s+number|bank\s+account)\b/gi,
    name: 'Financial Account Reference',
    severity: 'high',
  },
  {
    pattern: /\b(?:salary|income|net\s+worth|tax\s+return)\b/gi,
    name: 'Financial Data Reference',
    severity: 'medium',
  },

  // Session/User Context
  {
    pattern: /\b(?:session[-_]?id|user[-_]?id|account[-_]?id)\s*[:=]\s*["']?[a-zA-Z0-9-]+["']?/gi,
    name: 'Session/User ID',
    severity: 'medium',
  },
  {
    pattern: /\b(?:previous\s+user|other\s+user|different\s+session)\b/gi,
    name: 'Cross-Session Reference',
    severity: 'high',
  },

  // Conversation history leakage
  {
    pattern: /\b(?:previous\s+conversation|earlier\s+discussion|last\s+time\s+you)\b/gi,
    name: 'Conversation History Reference',
    severity: 'medium',
  },
  {
    pattern: /\b(?:remember\s+when|as\s+I\s+mentioned|we\s+discussed)\b/gi,
    name: 'Memory Persistence Reference',
    severity: 'low',
  },

  // Internal system information
  {
    pattern: /\b(?:internal\s+(?:api|system|server)|private\s+(?:key|endpoint))\b/gi,
    name: 'Internal System Reference',
    severity: 'high',
  },
  {
    pattern: /\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0|::1)\b/g,
    name: 'Local Network Address',
    severity: 'medium',
  },
  {
    pattern:
      /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/g,
    name: 'Private IP Address',
    severity: 'medium',
  },

  // Organization-specific
  {
    pattern: /\b(?:proprietary|confidential|internal\s+use\s+only)\b/gi,
    name: 'Confidentiality Marker',
    severity: 'medium',
  },
  {
    pattern: /\b(?:trade\s+secret|intellectual\s+property)\b/gi,
    name: 'IP Reference',
    severity: 'high',
  },
];

const OVERSHARING_PATTERNS = [
  // Tools requesting too much data
  {
    pattern: /(?:all|every|complete)\s+(?:data|records?|information|history)/gi,
    name: 'Broad Data Request',
    severity: 'medium',
  },
  {
    pattern: /(?:dump|export|extract)\s+(?:all|entire|complete)/gi,
    name: 'Data Dump Request',
    severity: 'high',
  },

  // Context accumulation
  {
    pattern: /(?:accumulate|aggregate|combine)\s+(?:context|data|information)/gi,
    name: 'Context Accumulation',
    severity: 'medium',
  },
  {
    pattern: /(?:store|save|persist)\s+(?:for\s+later|indefinitely|permanently)/gi,
    name: 'Persistence Request',
    severity: 'medium',
  },

  // Cross-boundary access
  {
    pattern: /(?:access|read|get)\s+(?:other|different|another)\s+(?:user|session|context)/gi,
    name: 'Cross-Boundary Access',
    severity: 'high',
  },
  {
    pattern: /(?:share|transfer|copy)\s+(?:between|across)\s+(?:sessions?|users?|contexts?)/gi,
    name: 'Cross-Session Sharing',
    severity: 'high',
  },
];

function checkText(text, context, patterns) {
  const findings = [];

  if (!text || typeof text !== 'string') {
    return findings;
  }

  for (const { pattern, name, severity } of patterns) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);

    if (matches) {
      findings.push({
        rule_id: 'mcp10-context-oversharing',
        severity,
        owasp_id: 'MCP10',
        title: `Potential Data Exposure: ${name}`,
        description: `Found ${name} pattern in ${context}. This could indicate sensitive data exposure or context leakage.`,
        evidence: matches[0].substring(0, 80) + (matches[0].length > 80 ? '...' : ''),
        recommendation:
          'Implement data minimization. Use scoped contexts and ensure session isolation. Mask or filter sensitive data before including in responses.',
      });
    }
  }

  return findings;
}

/**
 * Check if a resource could expose sensitive data
 */
function checkResourceScope(resource) {
  const findings = [];
  const resourceUri = resource.uri || 'unknown';
  const wideAccessPatterns = [
    { pattern: /\*\*/g, name: 'Recursive Wildcard' },
    { pattern: /\/\*/g, name: 'Directory Wildcard' },
    { pattern: /\/\.\./g, name: 'Parent Directory' },
    { pattern: /\/:[\w]+/g, name: 'Dynamic Path Segment' },
  ];

  if (resource.uri) {
    for (const { pattern, name } of wideAccessPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(resource.uri)) {
        findings.push({
          rule_id: 'mcp10-context-oversharing',
          severity: 'medium',
          owasp_id: 'MCP10',
          title: `Broad Resource Access: ${name}`,
          description: `Resource "${resourceUri}" uses ${name} which could expose more data than intended.`,
          evidence: resource.uri,
          recommendation:
            'Use specific resource paths instead of wildcards. Implement access controls at the resource level.',
        });
      }
    }
  }

  return findings;
}

/**
 * Analyze a tool definition for context oversharing risks
 */
export function analyzeTool(tool) {
  const findings = [];
  const toolName = tool.name || 'unknown';

  if (tool.description) {
    findings.push(
      ...checkText(tool.description, `tool "${toolName}" description`, SENSITIVE_DATA_PATTERNS)
    );
    findings.push(
      ...checkText(tool.description, `tool "${toolName}" description`, OVERSHARING_PATTERNS)
    );
  }

  if (tool.inputSchema) {
    const schemaStr = JSON.stringify(tool.inputSchema);
    findings.push(
      ...checkText(schemaStr, `tool "${toolName}" input schema`, SENSITIVE_DATA_PATTERNS)
    );
  }

  // Check for tools that might accumulate context
  const contextAccumPatterns = ['history', 'memory', 'context', 'state', 'persist'];
  const toolNameLower = toolName.toLowerCase();
  const descLower = (tool.description || '').toLowerCase();

  for (const pat of contextAccumPatterns) {
    if (toolNameLower.includes(pat) || descLower.includes(pat)) {
      findings.push({
        rule_id: 'mcp10-context-oversharing',
        severity: 'low',
        owasp_id: 'MCP10',
        title: 'Context Persistence Tool',
        description: `Tool "${toolName}" appears to handle persistent context or memory. Ensure proper session isolation.`,
        evidence: `Pattern: ${pat}`,
        recommendation:
          'Implement strict session boundaries. Clear context between sessions. Avoid sharing state between users.',
      });
      break;
    }
  }

  return findings.map((f) => ({ ...f, target_type: 'tool', target_name: toolName }));
}

/**
 * Analyze a prompt definition for oversharing risks
 */
export function analyzePrompt(prompt) {
  const findings = [];
  const promptName = prompt.name || 'unknown';

  if (prompt.description) {
    findings.push(
      ...checkText(
        prompt.description,
        `prompt "${promptName}" description`,
        SENSITIVE_DATA_PATTERNS
      )
    );
    findings.push(
      ...checkText(prompt.description, `prompt "${promptName}" description`, OVERSHARING_PATTERNS)
    );
  }

  return findings.map((f) => ({ ...f, target_type: 'prompt', target_name: promptName }));
}

/**
 * Analyze a resource definition for oversharing risks
 */
export function analyzeResource(resource) {
  const findings = [];
  const resourceUri = resource.uri || 'unknown';

  if (resource.description) {
    findings.push(
      ...checkText(
        resource.description,
        `resource "${resourceUri}" description`,
        SENSITIVE_DATA_PATTERNS
      )
    );
    findings.push(
      ...checkText(
        resource.description,
        `resource "${resourceUri}" description`,
        OVERSHARING_PATTERNS
      )
    );
  }

  // Check resource scope
  findings.push(...checkResourceScope(resource));

  return findings.map((f) => ({ ...f, target_type: 'resource', target_name: resourceUri }));
}

/**
 * Analyze packet content for sensitive data exposure
 */
export function analyzePacket(packet) {
  const findings = [];

  if (packet.body) {
    const bodyStr = typeof packet.body === 'string' ? packet.body : JSON.stringify(packet.body);
    findings.push(...checkText(bodyStr, 'packet body', SENSITIVE_DATA_PATTERNS));
    findings.push(...checkText(bodyStr, 'packet body', OVERSHARING_PATTERNS));
  }

  return findings.map((f) => ({
    ...f,
    target_type: 'packet',
    target_name: `frame_${packet.frameNumber || 'unknown'}`,
  }));
}

export const ruleMetadata = {
  id: 'mcp10-context-oversharing',
  name: 'Context Injection & Over-Sharing',
  owasp_id: 'MCP10',
  severity: 'high',
  description:
    'Detects patterns that could leak sensitive information across sessions, agents, or users through insufficient context scoping.',
  source: 'static',
  type: 'owasp-mcp',
};
