/**
 * MCP01: Token Mismanagement & Secret Exposure
 * Detects hard-coded credentials, API keys, and secrets in tool definitions
 */

const SECRET_PATTERNS = [
  // API Keys
  { pattern: /api[_-]?key\s*[:=]\s*["']?[a-zA-Z0-9_-]{20,}["']?/gi, name: 'API Key' },
  { pattern: /apikey\s*[:=]\s*["']?[a-zA-Z0-9_-]{20,}["']?/gi, name: 'API Key' },

  // AWS
  { pattern: /AKIA[0-9A-Z]{16}/g, name: 'AWS Access Key ID' },
  { pattern: /aws[_-]?secret[_-]?access[_-]?key/gi, name: 'AWS Secret Key Reference' },

  // Generic secrets
  { pattern: /secret[_-]?key\s*[:=]\s*["']?[a-zA-Z0-9_-]{16,}["']?/gi, name: 'Secret Key' },
  { pattern: /password\s*[:=]\s*["'][^"']{8,}["']/gi, name: 'Password' },
  { pattern: /token\s*[:=]\s*["']?[a-zA-Z0-9_.-]{20,}["']?/gi, name: 'Token' },

  // Bearer tokens
  { pattern: /bearer\s+[a-zA-Z0-9_.-]{20,}/gi, name: 'Bearer Token' },

  // Private keys
  { pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi, name: 'Private Key' },

  // GitHub
  { pattern: /ghp_[a-zA-Z0-9]{36}/g, name: 'GitHub Personal Access Token' },
  { pattern: /github[_-]?token/gi, name: 'GitHub Token Reference' },

  // OpenAI
  { pattern: /sk-[a-zA-Z0-9]{48}/g, name: 'OpenAI API Key' },

  // Anthropic
  { pattern: /sk-ant-[a-zA-Z0-9-]{40,}/g, name: 'Anthropic API Key' },

  // Generic credential patterns
  { pattern: /credentials?\s*[:=]\s*\{/gi, name: 'Credentials Object' },
  { pattern: /auth[_-]?token/gi, name: 'Auth Token Reference' },
];

function checkText(text, context) {
  const findings = [];

  if (!text || typeof text !== 'string') {
    return findings;
  }

  for (const { pattern, name } of SECRET_PATTERNS) {
    // Reset regex state for global patterns
    pattern.lastIndex = 0;
    const matches = text.match(pattern);

    if (matches) {
      findings.push({
        rule_id: 'mcp01-token-exposure',
        severity: 'high',
        owasp_id: 'MCP01',
        title: `Potential ${name} Exposure`,
        description: `Found potential ${name} in ${context}. Hard-coded credentials can be exposed through prompt injection or compromised context.`,
        evidence: matches[0].substring(0, 50) + (matches[0].length > 50 ? '...' : ''),
        recommendation:
          'Use environment variables or secure secret management. Never hard-code credentials in tool definitions or prompts.',
      });
    }
  }

  return findings;
}

/**
 * Analyze a tool definition for token/secret exposure
 */
export function analyzeTool(tool) {
  const findings = [];
  const toolName = tool.name || 'unknown';

  // Check tool description
  if (tool.description) {
    findings.push(...checkText(tool.description, `tool "${toolName}" description`));
  }

  // Check input schema
  if (tool.inputSchema) {
    const schemaStr = JSON.stringify(tool.inputSchema);
    findings.push(...checkText(schemaStr, `tool "${toolName}" input schema`));

    // Check for sensitive parameter names that suggest secret handling
    const sensitiveParams = ['api_key', 'apiKey', 'secret', 'password', 'token', 'credential'];
    const properties = tool.inputSchema.properties || {};

    for (const paramName of Object.keys(properties)) {
      const lowerParam = paramName.toLowerCase();
      for (const sensitive of sensitiveParams) {
        if (lowerParam.includes(sensitive.toLowerCase())) {
          findings.push({
            rule_id: 'mcp01-token-exposure',
            severity: 'medium',
            owasp_id: 'MCP01',
            title: 'Sensitive Parameter in Tool Input',
            description: `Tool "${toolName}" accepts sensitive parameter "${paramName}". Ensure proper handling and avoid logging.`,
            evidence: `Parameter: ${paramName}`,
            recommendation:
              'Mark sensitive parameters appropriately and ensure they are not logged or exposed in error messages.',
          });
        }
      }
    }
  }

  return findings.map((f) => ({ ...f, target_type: 'tool', target_name: toolName }));
}

/**
 * Analyze a prompt definition for token/secret exposure
 */
export function analyzePrompt(prompt) {
  const findings = [];
  const promptName = prompt.name || 'unknown';

  if (prompt.description) {
    findings.push(...checkText(prompt.description, `prompt "${promptName}" description`));
  }

  // Check prompt arguments
  if (prompt.arguments && Array.isArray(prompt.arguments)) {
    for (const arg of prompt.arguments) {
      if (arg.description) {
        findings.push(
          ...checkText(arg.description, `prompt "${promptName}" argument "${arg.name}"`)
        );
      }
    }
  }

  return findings.map((f) => ({ ...f, target_type: 'prompt', target_name: promptName }));
}

/**
 * Analyze a resource definition for token/secret exposure
 */
export function analyzeResource(resource) {
  const findings = [];
  const resourceUri = resource.uri || 'unknown';

  if (resource.description) {
    findings.push(...checkText(resource.description, `resource "${resourceUri}" description`));
  }

  // Check URI for embedded credentials
  if (resource.uri) {
    findings.push(...checkText(resource.uri, 'resource URI'));
  }

  return findings.map((f) => ({ ...f, target_type: 'resource', target_name: resourceUri }));
}

/**
 * Analyze packet content for token/secret exposure
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
  id: 'mcp01-token-exposure',
  name: 'Token Mismanagement & Secret Exposure',
  owasp_id: 'MCP01',
  severity: 'high',
  description:
    'Detects hard-coded credentials, API keys, and secrets that could be exposed through prompt injection or compromised context.',
  source: 'static',
  type: 'owasp-mcp',
};
