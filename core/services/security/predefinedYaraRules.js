/**
 * Predefined YARA Rules for MCP Shark
 * These complement the static rules with pattern-based detection
 */

export const PREDEFINED_YARA_RULES = [
  {
    name: 'api_key_patterns',
    content: `rule mcp_api_key_patterns : secrets
{
    meta:
        description = "Detects common API key patterns in MCP traffic"
        author = "MCP Shark"
        severity = "high"
        owasp_id = "MCP01"
    
    strings:
        $openai = /sk-[a-zA-Z0-9]{40,}/ nocase
        $anthropic = /sk-ant-[a-zA-Z0-9-]{40,}/ nocase
        $aws_key = /AKIA[0-9A-Z]{16}/
        $github = /ghp_[a-zA-Z0-9]{36}/
        $gitlab = /glpat-[a-zA-Z0-9-]{20}/
        $stripe = /sk_live_[a-zA-Z0-9]{24}/
        $twilio = /SK[a-f0-9]{32}/
    
    condition:
        any of them
}`,
  },
  {
    name: 'dangerous_protocols',
    content: `rule mcp_dangerous_protocols : network
{
    meta:
        description = "Detects dangerous protocol references in MCP tools"
        author = "MCP Shark"
        severity = "medium"
        owasp_id = "MCP09"
    
    strings:
        $file = "file://" nocase
        $ftp = "ftp://" nocase
        $ssh = "ssh://" nocase
        $telnet = "telnet://" nocase
        $ldap = "ldap://" nocase
        $smb = "smb://" nocase
    
    condition:
        any of them
}`,
  },
  {
    name: 'base64_credentials',
    content: `rule mcp_base64_credentials : encoding
{
    meta:
        description = "Detects Base64 encoded credential patterns"
        author = "MCP Shark"
        severity = "medium"
        owasp_id = "MCP01"
    
    strings:
        $basic_auth = /Basic [A-Za-z0-9+\\/=]{20,}/
        $bearer = /Bearer [A-Za-z0-9._-]{20,}/
        $authorization = /Authorization['":]\\s*[A-Za-z0-9+\\/=]{30,}/
    
    condition:
        any of them
}`,
  },
  {
    name: 'sql_injection_patterns',
    content: `rule mcp_sql_injection : injection
{
    meta:
        description = "Detects SQL injection patterns in MCP data"
        author = "MCP Shark"
        severity = "critical"
        owasp_id = "MCP05"
    
    strings:
        $union = /UNION\\s+(ALL\\s+)?SELECT/i
        $drop = /DROP\\s+(TABLE|DATABASE)/i
        $delete = /DELETE\\s+FROM\\s+\\w+\\s+WHERE\\s+1\\s*=\\s*1/i
        $or_true = /OR\\s+['"]*1['"]*\\s*=\\s*['"]*1/i
        $comment = /--\\s*$/
        $semicolon = /;\\s*(DROP|DELETE|UPDATE|INSERT)/i
    
    condition:
        any of them
}`,
  },
  {
    name: 'path_traversal_extended',
    content: `rule mcp_path_traversal : filesystem
{
    meta:
        description = "Extended path traversal detection"
        author = "MCP Shark"
        severity = "high"
        owasp_id = "MCP05"
    
    strings:
        $dotdot = "../"
        $dotdot_encoded = "%2e%2e%2f" nocase
        $dotdot_double = "%252e%252e%252f" nocase
        $etc_passwd = "/etc/passwd"
        $etc_shadow = "/etc/shadow"
        $windows_system = /[cC]:\\\\[wW]indows\\\\/
        $proc_self = "/proc/self/"
    
    condition:
        any of them
}`,
  },
  {
    name: 'sensitive_data_exposure',
    content: `rule mcp_sensitive_data : pii
{
    meta:
        description = "Detects sensitive data patterns like SSN, credit cards"
        author = "MCP Shark"
        severity = "high"
        owasp_id = "MCP08"
    
    strings:
        $ssn = /\\b\\d{3}-\\d{2}-\\d{4}\\b/
        $cc_visa = /\\b4\\d{3}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b/
        $cc_mc = /\\b5[1-5]\\d{2}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b/
        $cc_amex = /\\b3[47]\\d{2}[- ]?\\d{6}[- ]?\\d{5}\\b/
        $private_key = "-----BEGIN RSA PRIVATE KEY-----"
        $private_key2 = "-----BEGIN PRIVATE KEY-----"
    
    condition:
        any of them
}`,
  },
  {
    name: 'shell_metacharacters',
    content: `rule mcp_shell_metacharacters : injection
{
    meta:
        description = "Detects shell metacharacters that may indicate command injection"
        author = "MCP Shark"
        severity = "high"
        owasp_id = "MCP05"
    
    strings:
        $dollar_paren = /\\$\\([^)]+\\)/
        $semicolon_chain = /;\\s*(cat|ls|rm|wget|curl|chmod)/
        $pipe_chain = /\\|\\s*(bash|sh|nc|netcat)/
        $redirect = />>?\\s*\\/[a-z]/
        $backtick_hex = { 60 [1-20] 60 }
    
    condition:
        any of them
}`,
  },
  {
    name: 'jwt_exposure',
    content: `rule mcp_jwt_exposure : tokens
{
    meta:
        description = "Detects exposed JWT tokens in MCP traffic"
        author = "MCP Shark"
        severity = "medium"
        owasp_id = "MCP01"
    
    strings:
        $jwt = /eyJ[a-zA-Z0-9_-]+\\.eyJ[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+/
    
    condition:
        $jwt
}`,
  },
];

/**
 * Get predefined YARA rules formatted for storage
 */
export function getPredefinedRules() {
  return PREDEFINED_YARA_RULES.map((rule) => ({
    rule_id: `yara-${rule.name}`,
    name: rule.name,
    content: rule.content,
    source: 'predefined',
    enabled: true,
  }));
}
