export const COMMAND_INJECTION_CRITICAL_PATTERNS = [
  String.raw`\$\(.+?\)`,
  String.raw`\`.+?\``,
  String.raw`\$\{.+?\}`,
  String.raw`\b(exec|system|shell_exec|passthru|popen|proc_open)\b`,
  String.raw`\b(fork|vfork|clone)\b`,
  String.raw`[;&|]\s*\w`,
  String.raw`\b(&&|\|\|)\b`,
];

export const COMMAND_INJECTION_CONTEXT_PATTERNS = [
  String.raw`\b(sh|bash|zsh|ksh|csh|tcsh|fish|powershell|pwsh|cmd\.exe|command\.com)\s+(?:-c|-e|--execute)`,
  String.raw`\b(python[0-9.]*|python3|py|perl|ruby|node|nodejs|php|java|go|rust)\s+(?:-c|-e|--eval|--execute|run)`,
  String.raw`\b(cat|curl|wget|nc|netcat|ncat|telnet|ftp|sftp|scp|ssh|rsync)\b.*[;&|>]`,
  String.raw`\b(chmod|chown|rm|mv|cp|mkdir|rmdir|touch|ln)\b.*[;&|>]`,
  String.raw`\b(sudo|su)\s+\w+`,
  String.raw`\b(kill|killall|pkill)\s+\w+`,
  String.raw`\b(mount|umount|fdisk|mkfs|dd)\s+[^\s]+`,
  String.raw`\b(systemctl|service|initctl)\s+\w+`,
  String.raw`\b(crontab|at|batch)\s+[^\s]+`,
  String.raw`\b(tee|sponge)\b.*[>|&]`,
  String.raw`\b(ping|traceroute|tracert|nslookup|dig|whois)\b.*[;&|]`,
  String.raw`\b(nmap|masscan|zmap|unicornscan)\s+[^\s]+`,
  String.raw`\b(powershell|pwsh|wsl|bash|sh)\s+(?:-c|-e)`,
  String.raw`\b(mysql|psql|sqlite|mongo|redis-cli|memcached)\b.*[;&|]`,
  String.raw`\b(docker|podman|kubectl)\s+(?:exec|run)`,
  String.raw`\b(reg|regedit|regsvr32|rundll32|wscript|cscript)\s+[^\s]+`,
  String.raw`\b(taskkill|schtasks|wmic)\s+[^\s]+`,
];

export const COMMAND_INJECTION_BENIGN_PATTERNS = [
  String.raw`(?:written|developed|coded)\s+in\s+(python|java|go|rust|perl|ruby|node)`,
  String.raw`(?:uses|utilizes)\s+(curl|wget|http)\s+(?:to|for)`,
  String.raw`(?:example|demo|sample)\s+(?:command|usage|syntax)`,
  String.raw`(?:see|refer|check)\s+(?:documentation|docs|readme|manual)`,
  String.raw`https?://[\w\-\.]+`,
  String.raw`[\w\-\.]+@[\w\-\.]+\.\w+`,
];

export const SECRET_PATTERNS = [
  { type: 'OpenAI', regex: /sk-[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}/g },
  { type: 'GitHub PAT', regex: /github_pat_[0-9A-Za-z_]{40,90}/g },
  { type: 'GitHub Token', regex: /(ghp|gho|ghs|ghu)_[A-Za-z0-9]{36}/g },
  { type: 'GitLab Token', regex: /glpat-[0-9A-Za-z\-_]{20}/g },
  { type: 'Slack Token', regex: /xox[baprs]-[A-Za-z0-9-]{10,120}/g },
  { type: 'Slack Webhook', regex: /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9+/]{30,}/g },
  { type: 'Discord Token', regex: /[A-Za-z0-9]{24}\.[A-Za-z0-9]{6}\.[A-Za-z0-9_-]{27}/g },
  { type: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g },
  { type: 'AWS Secret Key', regex: /(?<![A-Za-z0-9])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9])/g },
  { type: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/g },
  { type: 'Stripe Secret', regex: /sk_live_[0-9a-zA-Z]{24}/g },
  { type: 'Stripe Restricted', regex: /rk_live_[0-9a-zA-Z]{24}/g },
  { type: 'Twilio API Key', regex: /SK[0-9a-fA-F]{32}/g },
  { type: 'SendGrid', regex: /SG\.[0-9A-Za-z\-_]{22}\.[0-9A-Za-z\-_]{43}/g },
  { type: 'Mailgun', regex: /key-[0-9a-fA-F]{32}/g },
  { type: 'Algolia', regex: /[A-Z0-9]{32}-[A-Z0-9]{10}/g },
  {
    type: 'Heroku',
    regex: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g,
  },
  { type: 'PlanetScale', regex: /pscale_(?:tkn|pw|oauth)_[A-Za-z0-9._=-]{30,60}/g },
  { type: 'Postman', regex: /PMAK-[0-9a-f]{24}-[0-9a-f]{34}/g },
  { type: 'Firebase', regex: /AAAA[a-zA-Z0-9_-]{7}:[a-zA-Z0-9_-]{140}/g },
];

export const ISSUE_RECOMMENDATIONS = {
  'Command Injection':
    'Remove hidden shell commands from tool metadata or block the component before execution.',
  'Hardcoded Secret':
    'Rotate the exposed credential immediately and remove it from tool/resource metadata.',
  'Tool Name Ambiguity':
    'Rename tools or add strict prefixes so orchestration layers cannot confuse them.',
  'Cross-Server Tool Shadowing':
    'Isolate servers and avoid referencing foreign tools/resources in descriptions.',
  'Token Mismanagement':
    'Move all tokens and secrets to secure storage (environment variables, secret managers).',
  'Scope Creep':
    'Implement strict scope boundaries for tools. Monitor for unauthorized scope expansion.',
  'Tool Poisoning':
    'Verify tool authenticity and integrity. Implement tool signing and verification mechanisms.',
  'Supply Chain':
    'Pin all dependencies to specific versions. Verify package integrity and signatures.',
  'Prompt Injection Context':
    'Implement prompt injection defenses. Validate and sanitize all user inputs.',
  'Insufficient Auth':
    'Implement proper authentication and authorization mechanisms. Enforce access controls.',
  'Lack Audit': 'Implement comprehensive logging, audit trails, and telemetry.',
  'Shadow Server':
    'Maintain an inventory of all MCP servers. Implement server registration and approval processes.',
  'Context Injection':
    'Implement context isolation and filtering. Limit context sharing between tools.',
  'Goal Hijack':
    'Implement goal validation and verification. Monitor for unauthorized goal changes.',
  'Tool Misuse': 'Implement tool usage monitoring and restrictions. Enforce scope boundaries.',
  'Identity Abuse':
    'Implement strict identity and privilege management. Monitor for privilege escalation.',
  'RCE Agentic':
    'Implement strict input validation and sanitization. Prevent arbitrary code execution.',
  'Memory Poisoning': 'Implement memory and context validation. Monitor for data poisoning.',
  'Insecure Communication':
    'Implement encrypted communication channels. Use TLS/SSL for all inter-agent communications.',
  'Cascading Failures':
    'Implement failure isolation and containment. Use circuit breakers and failover mechanisms.',
  'Trust Exploitation':
    'Implement trust verification mechanisms. Educate users about agent limitations.',
  'Rogue Agent':
    'Implement agent registration and approval processes. Monitor for unauthorized agent creation.',
};

export const ISSUE_SAFE_USE_NOTES = {
  'Command Injection':
    'Review the tool/resource metadata and strip any shell-like snippets before enabling it.',
  'Hardcoded Secret':
    'Never embed raw secrets in MCP metadata; move sensitive values to secure storage.',
  'Tool Name Ambiguity':
    'Provide disambiguating prefixes or guardrails to avoid accidental tool selection.',
  'Cross-Server Tool Shadowing':
    'Ensure tools describe only local capabilities; remove references to other servers.',
  'Token Mismanagement':
    'Remove all tokens and secrets from metadata. Use secure storage mechanisms.',
  'Scope Creep':
    'Review tool scope boundaries. Ensure tools cannot expand their permissions beyond intended limits.',
  'Tool Poisoning':
    'Review tool description and behavior carefully. Verify tool source and integrity before use.',
  'Supply Chain': 'Verify all dependencies and packages. Use signed packages from trusted sources.',
  'Prompt Injection Context':
    'Review tool inputs for prompt injection vulnerabilities. Implement input validation and sanitization.',
  'Insufficient Auth':
    'Review tool authentication requirements. Ensure proper access controls are in place.',
  'Lack Audit':
    'Ensure tool operations are logged and audited. Implement telemetry for security monitoring.',
  'Shadow Server':
    'Verify server registration and approval status. Ensure all servers are properly managed and monitored.',
  'Context Injection':
    'Review context sharing mechanisms. Ensure only necessary context is shared between tools.',
  'Goal Hijack':
    'Review tool behavior for goal hijacking vulnerabilities. Ensure agent goals cannot be modified by tools.',
  'Tool Misuse':
    'Review tool usage patterns. Ensure tools are used only within their intended scope.',
  'Identity Abuse':
    'Review tool privilege requirements. Ensure agents cannot abuse their assigned identities or privileges.',
  'RCE Agentic':
    'Review tool for code execution vulnerabilities. Implement strict input validation and sandboxing.',
  'Memory Poisoning':
    'Review tool for memory poisoning vulnerabilities. Validate and sanitize all context data.',
  'Insecure Communication':
    'Review tool communication mechanisms. Ensure all inter-agent communications are encrypted and authenticated.',
  'Cascading Failures':
    'Review tool failure handling. Implement isolation and circuit breakers to prevent cascading failures.',
  'Trust Exploitation':
    'Review tool for trust exploitation vulnerabilities. Implement verification mechanisms for sensitive operations.',
  'Rogue Agent':
    'Verify agent registration and approval status. Ensure all agents are properly managed and monitored.',
};

export const SEVERITY_RISK_MAP = {
  critical: { risk: 'critical', score: 90 },
  high: { risk: 'high', score: 75 },
  medium: { risk: 'medium', score: 55 },
  low: { risk: 'low', score: 35 },
};

export const DEFAULT_SAFE_USE_NOTES =
  'Review this component manually before allowing autonomous execution.';

export const RULE_TAG = 'rule-based';
