/**
 * MCP03: Tool Poisoning
 * Detects hidden instructions or malicious commands embedded in tool metadata
 */

const POISONING_PATTERNS = [
  // Hidden instructions
  {
    pattern: /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions?/gi,
    name: 'Ignore Instructions',
    severity: 'critical',
  },
  {
    pattern: /disregard\s+(?:all\s+)?(?:previous|prior|above)/gi,
    name: 'Disregard Instructions',
    severity: 'critical',
  },
  {
    pattern: /forget\s+(?:all\s+)?(?:previous|prior|above)/gi,
    name: 'Forget Instructions',
    severity: 'critical',
  },

  // System prompt override attempts
  {
    pattern: /you\s+are\s+now\s+(?:a\s+)?(?:new|different)/gi,
    name: 'Role Override',
    severity: 'high',
  },
  {
    pattern: /your\s+new\s+(?:role|instructions?|purpose)/gi,
    name: 'Role Reassignment',
    severity: 'high',
  },
  {
    pattern: /act\s+as\s+(?:if\s+you\s+are|a\s+)?(?!an?\s+(?:assistant|helper))/gi,
    name: 'Role Injection',
    severity: 'high',
  },

  // Hidden data exfiltration
  {
    pattern: /send\s+(?:all\s+)?(?:data|information|content)\s+to/gi,
    name: 'Data Exfiltration',
    severity: 'critical',
  },
  {
    pattern: /forward\s+(?:all\s+)?(?:messages?|responses?)\s+to/gi,
    name: 'Message Forwarding',
    severity: 'critical',
  },
  {
    pattern: /(?:http|https|ftp):\/\/[^\s<>"{}|\\^`\[\]]+/gi,
    name: 'External URL',
    severity: 'medium',
  },

  // Invisible characters that could hide instructions
  {
    pattern: /(?:\u200B|\u200C|\u200D|\uFEFF|\u2060)/g,
    name: 'Zero-Width Characters',
    severity: 'high',
  },
  {
    pattern: /[\u2066-\u2069\u202A-\u202E]/g,
    name: 'Bidirectional Text Override',
    severity: 'high',
  },

  // Delimiter injection
  { pattern: /```(?:system|assistant|user)/gi, name: 'Role Delimiter Injection', severity: 'high' },
  {
    pattern: /<\|(?:im_start|im_end|system|user|assistant)\|>/gi,
    name: 'ChatML Injection',
    severity: 'high',
  },
  { pattern: /\[INST\]|\[\/INST\]/gi, name: 'Llama Instruction Tags', severity: 'high' },

  // Command execution patterns
  { pattern: /\$\([^)]+\)/g, name: 'Shell Command Substitution', severity: 'high' },
  { pattern: /`[^`]+`/g, name: 'Backtick Command', severity: 'low' },

  // Suspicious HTML/JavaScript in descriptions
  { pattern: /<script[^>]*>/gi, name: 'Script Tag', severity: 'critical' },
  { pattern: /javascript:/gi, name: 'JavaScript Protocol', severity: 'high' },
  { pattern: /on\w+\s*=/gi, name: 'Event Handler', severity: 'medium' },
];

function checkText(text, context) {
  const findings = [];

  if (!text || typeof text !== 'string') {
    return findings;
  }

  for (const { pattern, name, severity } of POISONING_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);

    if (matches) {
      findings.push({
        rule_id: 'mcp03-tool-poisoning',
        severity,
        owasp_id: 'MCP03',
        title: `Potential Tool Poisoning: ${name}`,
        description: `Found suspicious pattern "${name}" in ${context}. This could be an attempt to inject malicious instructions into the AI agent.`,
        evidence: matches[0].substring(0, 100) + (matches[0].length > 100 ? '...' : ''),
        recommendation:
          'Review and sanitize all tool metadata. Ensure descriptions do not contain hidden instructions or manipulation attempts.',
      });
    }
  }

  return findings;
}

/**
 * Analyze a tool definition for poisoning attempts
 */
export function analyzeTool(tool) {
  const findings = [];
  const toolName = tool.name || 'unknown';

  // Check tool name for suspicious patterns
  if (tool.name) {
    findings.push(...checkText(tool.name, 'tool name'));
  }

  // Check tool description - primary attack vector
  if (tool.description) {
    findings.push(...checkText(tool.description, `tool "${toolName}" description`));

    // Check for abnormally long descriptions (could hide instructions)
    if (tool.description.length > 2000) {
      findings.push({
        rule_id: 'mcp03-tool-poisoning',
        severity: 'medium',
        owasp_id: 'MCP03',
        title: 'Abnormally Long Tool Description',
        description: `Tool "${toolName}" has an unusually long description (${tool.description.length} chars). Long descriptions may hide malicious instructions.`,
        evidence: `Length: ${tool.description.length} characters`,
        recommendation:
          'Review the full description for hidden instructions. Consider if the length is justified.',
      });
    }
  }

  // Check input schema descriptions
  if (tool.inputSchema?.properties) {
    for (const [propName, propDef] of Object.entries(tool.inputSchema.properties)) {
      if (propDef.description) {
        findings.push(
          ...checkText(
            propDef.description,
            `tool "${toolName}" parameter "${propName}" description`
          )
        );
      }
    }
  }

  return findings.map((f) => ({ ...f, target_type: 'tool', target_name: toolName }));
}

/**
 * Analyze a prompt definition for poisoning attempts
 */
export function analyzePrompt(prompt) {
  const findings = [];
  const promptName = prompt.name || 'unknown';

  if (prompt.name) {
    findings.push(...checkText(prompt.name, 'prompt name'));
  }

  if (prompt.description) {
    findings.push(...checkText(prompt.description, `prompt "${promptName}" description`));
  }

  if (prompt.arguments && Array.isArray(prompt.arguments)) {
    for (const arg of prompt.arguments) {
      if (arg.description) {
        findings.push(
          ...checkText(arg.description, `prompt "${promptName}" argument "${arg.name}" description`)
        );
      }
    }
  }

  return findings.map((f) => ({ ...f, target_type: 'prompt', target_name: promptName }));
}

/**
 * Analyze a resource definition for poisoning attempts
 */
export function analyzeResource(resource) {
  const findings = [];
  const resourceUri = resource.uri || 'unknown';

  if (resource.name) {
    findings.push(...checkText(resource.name, 'resource name'));
  }

  if (resource.description) {
    findings.push(...checkText(resource.description, `resource "${resourceUri}" description`));
  }

  return findings.map((f) => ({ ...f, target_type: 'resource', target_name: resourceUri }));
}

/**
 * Analyze packet content for poisoning attempts
 */
export function analyzePacket(packet) {
  const findings = [];

  if (packet.body) {
    const bodyStr = typeof packet.body === 'string' ? packet.body : JSON.stringify(packet.body);
    findings.push(...checkText(bodyStr, 'packet body'));
  }

  return findings.map((f) => ({
    ...f,
    target_type: 'packet',
    target_name: `frame_${packet.frameNumber || 'unknown'}`,
  }));
}

export const ruleMetadata = {
  id: 'mcp03-tool-poisoning',
  name: 'Tool Poisoning',
  owasp_id: 'MCP03',
  severity: 'critical',
  description:
    'Detects hidden instructions or malicious commands embedded in tool metadata that exploit AI agent trust.',
  source: 'static',
  type: 'owasp-mcp',
};
