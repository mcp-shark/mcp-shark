/**
 * MCP06: Prompt Injection via Contextual Payloads
 * Detects prompt injection attempts in MCP traffic
 */

const PROMPT_INJECTION_PATTERNS = [
  // Direct instruction override
  {
    pattern:
      /ignore\s+(?:all\s+)?(?:previous|prior|above|earlier)\s+(?:instructions?|commands?|rules?)/gi,
    name: 'Instruction Override',
    severity: 'critical',
  },
  {
    pattern: /disregard\s+(?:all\s+)?(?:previous|prior|system)/gi,
    name: 'Disregard System',
    severity: 'critical',
  },
  {
    pattern: /forget\s+(?:everything|all|what)\s+(?:you|I|we)\s+(?:said|told|discussed)/gi,
    name: 'Memory Wipe',
    severity: 'high',
  },

  // Role manipulation
  {
    pattern: /you\s+are\s+(?:now\s+)?(?:a\s+)?(?:different|new|evil|malicious)/gi,
    name: 'Role Manipulation',
    severity: 'critical',
  },
  {
    pattern: /pretend\s+(?:to\s+be|you\s+are|that)/gi,
    name: 'Pretend Attack',
    severity: 'high',
  },
  {
    pattern: /roleplay\s+as|act\s+like\s+(?:a\s+)?(?!assistant|helper)/gi,
    name: 'Roleplay Injection',
    severity: 'high',
  },
  {
    pattern: /(?:DAN|jailbreak|bypass|hack)\s*(?:mode|prompt)?/gi,
    name: 'Jailbreak Attempt',
    severity: 'critical',
  },

  // System prompt extraction
  {
    pattern:
      /(?:show|tell|reveal|display|print|output)\s+(?:me\s+)?(?:your\s+)?(?:system\s+)?(?:prompt|instructions?)/gi,
    name: 'System Prompt Extraction',
    severity: 'high',
  },
  {
    pattern: /what\s+(?:are|is)\s+your\s+(?:system\s+)?(?:prompt|instructions?|rules?)/gi,
    name: 'Prompt Query',
    severity: 'medium',
  },
  {
    pattern: /repeat\s+(?:your\s+)?(?:initial|first|system)\s+(?:prompt|message|instructions?)/gi,
    name: 'Prompt Repeat Request',
    severity: 'high',
  },

  // Context manipulation
  {
    pattern: /\[(?:system|user|assistant)\]/gi,
    name: 'Role Tag Injection',
    severity: 'high',
  },
  {
    pattern: /###\s*(?:System|User|Assistant|Instruction)/gi,
    name: 'Markdown Role Injection',
    severity: 'high',
  },
  {
    pattern: /<\|(?:im_start|im_end|system|user|assistant)\|>/gi,
    name: 'ChatML Injection',
    severity: 'critical',
  },
  {
    pattern: /\[INST\].*\[\/INST\]/gis,
    name: 'Llama Format Injection',
    severity: 'critical',
  },
  {
    pattern: /Human:|Assistant:|System:/gi,
    name: 'Claude Format Injection',
    severity: 'high',
  },

  // Output manipulation
  {
    pattern: /(?:always|must|should)\s+(?:respond|reply|answer|say)\s+(?:with|that)/gi,
    name: 'Response Control',
    severity: 'medium',
  },
  {
    pattern: /(?:never|don't|do\s+not)\s+(?:mention|say|reveal|disclose)/gi,
    name: 'Suppression Attempt',
    severity: 'medium',
  },

  // Data exfiltration prompts
  {
    pattern:
      /(?:include|add|append|insert)\s+(?:all\s+)?(?:user|private|confidential|secret)\s+(?:data|information)/gi,
    name: 'Data Inclusion Request',
    severity: 'high',
  },
  {
    pattern: /(?:send|forward|transmit|post)\s+(?:to|data\s+to)\s+(?:http|https|ftp)/gi,
    name: 'Data Exfiltration',
    severity: 'critical',
  },

  // Encoded/obfuscated attempts
  {
    pattern: /base64\s*[:\s]\s*[A-Za-z0-9+/=]{20,}/gi,
    name: 'Base64 Encoded Payload',
    severity: 'medium',
  },
  {
    pattern: /\\x[0-9a-fA-F]{2}/g,
    name: 'Hex Encoded Characters',
    severity: 'low',
  },
  {
    pattern: /\\u[0-9a-fA-F]{4}/g,
    name: 'Unicode Escaped Characters',
    severity: 'low',
  },

  // Multi-turn attack setup
  {
    pattern: /in\s+(?:the\s+)?(?:next|following|subsequent)\s+(?:message|response|turn)/gi,
    name: 'Multi-Turn Setup',
    severity: 'medium',
  },
  {
    pattern: /when\s+I\s+(?:say|type|send)\s+["'][^"']+["']/gi,
    name: 'Trigger Setup',
    severity: 'medium',
  },
];

function checkText(text, context) {
  const findings = [];

  if (!text || typeof text !== 'string') {
    return findings;
  }

  for (const { pattern, name, severity } of PROMPT_INJECTION_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);

    if (matches) {
      findings.push({
        rule_id: 'mcp06-prompt-injection',
        severity,
        owasp_id: 'MCP06',
        title: `Potential Prompt Injection: ${name}`,
        description: `Found prompt injection pattern "${name}" in ${context}. This could manipulate AI behavior or extract sensitive information.`,
        evidence: matches[0].substring(0, 100) + (matches[0].length > 100 ? '...' : ''),
        recommendation:
          'Implement input sanitization and prompt guardrails. Use system prompts that explicitly reject manipulation attempts.',
      });
    }
  }

  return findings;
}

/**
 * Analyze a tool definition for prompt injection vectors
 */
export function analyzeTool(tool) {
  const findings = [];
  const toolName = tool.name || 'unknown';

  if (tool.description) {
    findings.push(...checkText(tool.description, `tool "${toolName}" description`));
  }

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
      if (propDef.default && typeof propDef.default === 'string') {
        findings.push(
          ...checkText(propDef.default, `tool "${toolName}" parameter "${propName}" default value`)
        );
      }
    }
  }

  return findings.map((f) => ({ ...f, target_type: 'tool', target_name: toolName }));
}

/**
 * Analyze a prompt definition for injection vectors
 */
export function analyzePrompt(prompt) {
  const findings = [];
  const promptName = prompt.name || 'unknown';

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
 * Analyze a resource definition for injection vectors
 */
export function analyzeResource(resource) {
  const findings = [];
  const resourceUri = resource.uri || 'unknown';

  if (resource.description) {
    findings.push(...checkText(resource.description, `resource "${resourceUri}" description`));
  }

  return findings.map((f) => ({ ...f, target_type: 'resource', target_name: resourceUri }));
}

// Suspicious tool names that suggest manipulation attempts
const SUSPICIOUS_TOOL_NAME_PATTERNS = [
  { pattern: /override/i, name: 'Override Tool', severity: 'critical' },
  { pattern: /bypass/i, name: 'Bypass Tool', severity: 'critical' },
  { pattern: /ignore/i, name: 'Ignore Tool', severity: 'high' },
  { pattern: /disable/i, name: 'Disable Tool', severity: 'high' },
  { pattern: /jailbreak/i, name: 'Jailbreak Tool', severity: 'critical' },
  { pattern: /hack/i, name: 'Hack Tool', severity: 'critical' },
  { pattern: /exploit/i, name: 'Exploit Tool', severity: 'critical' },
  { pattern: /inject/i, name: 'Inject Tool', severity: 'high' },
  { pattern: /escape/i, name: 'Escape Tool', severity: 'medium' },
  { pattern: /sudo|admin|root/i, name: 'Privilege Escalation Tool', severity: 'high' },
  {
    pattern: /system_prompt|systemprompt/i,
    name: 'System Prompt Access Tool',
    severity: 'critical',
  },
  { pattern: /instruction/i, name: 'Instruction Manipulation Tool', severity: 'high' },
];

function checkToolName(toolName) {
  const findings = [];

  if (!toolName || typeof toolName !== 'string') {
    return findings;
  }

  for (const { pattern, name, severity } of SUSPICIOUS_TOOL_NAME_PATTERNS) {
    if (pattern.test(toolName)) {
      findings.push({
        rule_id: 'mcp06-prompt-injection',
        severity,
        owasp_id: 'MCP06',
        title: `Suspicious Tool Name: ${name}`,
        description: `Tool "${toolName}" has a suspicious name suggesting potential prompt injection or manipulation capability.`,
        evidence: toolName,
        recommendation:
          'Review tool purpose and ensure it cannot be used to manipulate AI behavior or bypass security controls.',
      });
    }
  }

  return findings;
}

/**
 * Analyze packet content for prompt injection
 * This is the primary use case - analyzing live traffic
 */
export function analyzePacket(packet) {
  const findings = [];

  if (packet.body) {
    const bodyStr = typeof packet.body === 'string' ? packet.body : JSON.stringify(packet.body);
    findings.push(...checkText(bodyStr, 'packet body'));

    // Check specifically for tool call arguments and tool names
    try {
      const parsed = typeof packet.body === 'string' ? JSON.parse(packet.body) : packet.body;

      // Check for suspicious tool names in tools/call requests
      if (parsed.method === 'tools/call' && parsed.params?.name) {
        findings.push(...checkToolName(parsed.params.name));
      }

      // Check tool arguments for injection patterns
      if (parsed.params?.arguments) {
        const args = parsed.params.arguments;
        for (const [key, value] of Object.entries(args)) {
          if (typeof value === 'string') {
            findings.push(...checkText(value, `tool argument "${key}"`));
          }
        }
      }
    } catch {
      // Not JSON or doesn't have expected structure - that's fine
    }
  }

  return findings.map((f) => ({
    ...f,
    target_type: 'packet',
    target_name: `frame_${packet.frameNumber || 'unknown'}`,
  }));
}

export const ruleMetadata = {
  id: 'mcp06-prompt-injection',
  name: 'Prompt Injection via Contextual Payloads',
  owasp_id: 'MCP06',
  severity: 'critical',
  description:
    'Detects prompt injection attempts that could manipulate AI behavior, extract system prompts, or cause unauthorized actions.',
  source: 'static',
  type: 'owasp-mcp',
};
