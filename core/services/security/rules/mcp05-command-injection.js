/**
 * MCP05: Command Injection & Execution
 * Detects patterns that could lead to arbitrary code/command execution
 */

const COMMAND_INJECTION_PATTERNS = [
  // Shell command patterns
  {
    pattern: /;\s*(?:rm|del|format|mkfs|dd)\s+/gi,
    name: 'Destructive Command',
    severity: 'critical',
  },
  { pattern: /\|\s*(?:sh|bash|zsh|cmd|powershell)/gi, name: 'Shell Pipe', severity: 'critical' },
  { pattern: /&&\s*(?:curl|wget|nc|netcat)\s+/gi, name: 'Network Command Chain', severity: 'high' },
  { pattern: /\$\{[^}]+\}/g, name: 'Variable Expansion', severity: 'medium' },
  { pattern: /\$\([^)]+\)/g, name: 'Command Substitution', severity: 'high' },

  // Path traversal
  { pattern: /\.\.\/|\.\.\\|\.\.\%2[fF]/g, name: 'Path Traversal', severity: 'high' },
  {
    pattern: /\/etc\/(?:passwd|shadow|hosts)/gi,
    name: 'Sensitive File Access',
    severity: 'critical',
  },
  { pattern: /~\/\.|%7E\//g, name: 'Home Directory Access', severity: 'medium' },

  // SQL injection indicators (if tool interacts with databases)
  { pattern: /'\s*(?:OR|AND)\s*'?\d*'?\s*=\s*'?\d*/gi, name: 'SQL Injection', severity: 'high' },
  {
    pattern: /;\s*(?:DROP|DELETE|TRUNCATE|UPDATE)\s+/gi,
    name: 'SQL Destructive',
    severity: 'critical',
  },
  { pattern: /UNION\s+(?:ALL\s+)?SELECT/gi, name: 'SQL Union Injection', severity: 'high' },
  { pattern: /--\s*$/gm, name: 'SQL Comment Terminator', severity: 'medium' },

  // Code execution patterns
  { pattern: /eval\s*\(/gi, name: 'Eval Function', severity: 'critical' },
  { pattern: /exec\s*\(/gi, name: 'Exec Function', severity: 'critical' },
  { pattern: /spawn\s*\(/gi, name: 'Spawn Function', severity: 'high' },
  { pattern: /child_process/gi, name: 'Child Process Module', severity: 'high' },
  { pattern: /subprocess/gi, name: 'Subprocess Module', severity: 'high' },
  { pattern: /os\.system/gi, name: 'OS System Call', severity: 'critical' },
  { pattern: /Runtime\.getRuntime\(\)\.exec/gi, name: 'Java Runtime Exec', severity: 'critical' },

  // Template injection
  { pattern: /\{\{.*\}\}/g, name: 'Template Expression', severity: 'medium' },
  { pattern: /\$\{.*\}/g, name: 'String Interpolation', severity: 'medium' },
  { pattern: /<%.*%>/g, name: 'ERB/JSP Template', severity: 'medium' },

  // Null byte injection
  { pattern: /%00|\\x00|\\0/g, name: 'Null Byte Injection', severity: 'high' },

  // LDAP injection
  { pattern: /\*\)\(\|/g, name: 'LDAP Injection', severity: 'high' },

  // XML/XXE patterns
  { pattern: /<!ENTITY/gi, name: 'XML Entity Declaration', severity: 'high' },
  { pattern: /SYSTEM\s+["'][^"']+["']/gi, name: 'XML External Entity', severity: 'critical' },
];

function checkText(text, context) {
  const findings = [];

  if (!text || typeof text !== 'string') {
    return findings;
  }

  for (const { pattern, name, severity } of COMMAND_INJECTION_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);

    if (matches) {
      findings.push({
        rule_id: 'mcp05-command-injection',
        severity,
        owasp_id: 'MCP05',
        title: `Potential Command Injection: ${name}`,
        description: `Found pattern "${name}" in ${context}. This could enable arbitrary code execution if user input is not properly sanitized.`,
        evidence: matches[0].substring(0, 100) + (matches[0].length > 100 ? '...' : ''),
        recommendation:
          'Validate and sanitize all input. Use parameterized queries for database operations. Avoid shell commands with user-provided data.',
      });
    }
  }

  return findings;
}

/**
 * Check if a tool potentially executes commands
 */
function checkToolCapabilities(tool) {
  const findings = [];
  const toolName = tool.name || 'unknown';
  const dangerousCapabilities = [
    {
      keywords: ['execute', 'exec', 'run', 'shell', 'command', 'cmd'],
      capability: 'command execution',
    },
    {
      keywords: ['write', 'create', 'delete', 'remove', 'modify'],
      capability: 'file system modification',
    },
    { keywords: ['sql', 'query', 'database', 'db'], capability: 'database access' },
    { keywords: ['http', 'request', 'fetch', 'curl', 'wget'], capability: 'network access' },
    { keywords: ['eval', 'code', 'script'], capability: 'code evaluation' },
  ];

  const combinedText = `${tool.name || ''} ${tool.description || ''}`.toLowerCase();

  for (const { keywords, capability } of dangerousCapabilities) {
    const matched = keywords.filter((kw) => combinedText.includes(kw));
    if (matched.length > 0) {
      // Check if there's input that could be used for injection
      if (tool.inputSchema?.properties) {
        const hasStringInput = Object.values(tool.inputSchema.properties).some(
          (prop) => prop.type === 'string'
        );
        if (hasStringInput) {
          findings.push({
            rule_id: 'mcp05-command-injection',
            severity: 'medium',
            owasp_id: 'MCP05',
            title: `Tool Has ${capability} Capability`,
            description: `Tool "${toolName}" appears to have ${capability} capability and accepts string input. Ensure proper input validation.`,
            evidence: `Keywords found: ${matched.join(', ')}`,
            recommendation: `Implement strict input validation for tools with ${capability}. Consider allowlisting valid inputs.`,
          });
        }
      }
    }
  }

  return findings;
}

/**
 * Analyze a tool definition for command injection risks
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

    // Check for patterns in default values
    if (tool.inputSchema.properties) {
      for (const [propName, propDef] of Object.entries(tool.inputSchema.properties)) {
        if (propDef.default) {
          findings.push(
            ...checkText(
              String(propDef.default),
              `tool "${toolName}" parameter "${propName}" default`
            )
          );
        }
        if (propDef.examples) {
          for (const example of propDef.examples) {
            findings.push(
              ...checkText(String(example), `tool "${toolName}" parameter "${propName}" example`)
            );
          }
        }
      }
    }
  }

  // Check tool capabilities
  findings.push(...checkToolCapabilities(tool));

  return findings.map((f) => ({ ...f, target_type: 'tool', target_name: toolName }));
}

/**
 * Analyze a prompt definition for command injection risks
 */
export function analyzePrompt(prompt) {
  const findings = [];
  const promptName = prompt.name || 'unknown';

  if (prompt.description) {
    findings.push(...checkText(prompt.description, `prompt "${promptName}" description`));
  }

  return findings.map((f) => ({ ...f, target_type: 'prompt', target_name: promptName }));
}

/**
 * Analyze a resource definition for command injection risks
 */
export function analyzeResource(resource) {
  const findings = [];
  const resourceUri = resource.uri || 'unknown';

  if (resource.uri) {
    findings.push(...checkText(resource.uri, 'resource URI'));
  }

  if (resource.description) {
    findings.push(...checkText(resource.description, `resource "${resourceUri}" description`));
  }

  return findings.map((f) => ({ ...f, target_type: 'resource', target_name: resourceUri }));
}

/**
 * Analyze packet content for command injection
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
  id: 'mcp05-command-injection',
  name: 'Command Injection & Execution',
  owasp_id: 'MCP05',
  severity: 'critical',
  description:
    'Detects patterns that could lead to arbitrary code execution through command injection, SQL injection, or code evaluation.',
  source: 'static',
  type: 'owasp-mcp',
};
