# Local Analysis

Local Analysis provides rule-based static security analysis for MCP servers connected through the MCP Shark proxy.

## Overview

Local Analysis scans MCP server configurations and tool definitions using YARA-based pattern matching to detect potential security vulnerabilities. Unlike Smart Scan (which uses AI-powered analysis), Local Analysis runs entirely locally and provides fast, deterministic results.

## Prerequisites

Before running Local Analysis:

1. **Start MCP Servers**: Use the Setup tab to start your MCP servers through the proxy
2. **Verify Connection**: The Analyse button is disabled until at least one server is running

## Running Analysis

### Quick Start

1. Go to the **Setup** tab and start your MCP servers
2. Navigate to the **Local Analysis** tab
3. Click **Analyse** to scan all connected servers
4. View findings in the dashboard

### Controls

| Button | Description |
|--------|-------------|
| **Analyse** | Run static analysis on connected proxy servers (disabled when no servers running) |
| **History** | Toggle scan history view to see past results |
| **Clear** | Remove all findings and scan history |

## View Modes

Switch between different views to analyze findings:

### Dashboard View
- Overview charts showing severity distribution
- Summary statistics (total findings, critical/high/medium/low counts)
- Recent findings table

### By Severity
- Findings grouped by severity level
- Critical, High, Medium, Low categories
- Expandable sections for each severity

### By Category
- Findings organized by security category
- **MCP Top 10**: OWASP MCP security guidelines
- **Agentic Top 10**: Agentic security risk categories
- Quick navigation between categories

### By Target
- Findings grouped by server or tool name
- See which components have the most issues
- Drill down into specific targets

## Security Categories

### MCP Top 10

Based on OWASP MCP security guidelines:

| ID | Category |
|----|----------|
| MCP-01 | Token Mismanagement |
| MCP-02 | Scope Creep |
| MCP-03 | Tool Poisoning |
| MCP-04 | Supply Chain |
| MCP-05 | Command Injection |
| MCP-06 | Prompt Injection Context |
| MCP-07 | Insufficient Auth |
| MCP-08 | Lack of Audit |
| MCP-09 | Shadow Servers |
| MCP-10 | Context Injection |

### Agentic Top 10

Agentic security risk categories:

| ID | Category |
|----|----------|
| AGENTIC-01 | Goal Hijack |
| AGENTIC-02 | Tool Misuse |
| AGENTIC-03 | Identity Abuse |
| AGENTIC-04 | Supply Chain |
| AGENTIC-05 | RCE |
| AGENTIC-06 | Memory Poisoning |
| AGENTIC-07 | Insecure Communication |
| AGENTIC-08 | Cascading Failures |
| AGENTIC-09 | Trust Exploitation |
| AGENTIC-10 | Rogue Agent |

## Scan History

View and compare past analysis results:

- **Timestamp**: When the scan was performed
- **Finding Count**: Total number of findings
- **Servers**: Which servers were scanned
- **Severity Breakdown**: Critical/High/Medium/Low counts

Click on a historical scan to view its findings in the dashboard.

## YARA Detection Rules

### Managing Rules

Switch to the **YARA Detection** tab to manage detection rules:

1. **View Rules**: See all predefined and custom rules
2. **Enable/Disable**: Toggle individual rules on/off
3. **Create Custom**: Write your own YARA rules
4. **Reset Defaults**: Restore predefined rules to defaults

### Predefined Rules

MCP Shark includes predefined YARA rules for:

- Command injection patterns
- Hardcoded secrets detection
- Cross-server shadowing
- Tool name ambiguity
- And more based on MCP/Agentic Top 10

### Custom Rules

Create custom YARA rules for specific patterns:

```yara
rule custom_sensitive_data {
    meta:
        description = "Detect sensitive data patterns"
        severity = "high"
        category = "MCP-01"
    strings:
        $api_key = /api[_-]?key/i
        $password = /password/i
    condition:
        any of them
}
```

## Local vs Smart Scan

| Feature | Local Analysis | Smart Scan |
|---------|---------------|------------|
| **Analysis Type** | Static (rule-based) | Dynamic (AI-powered) |
| **Detection Method** | YARA patterns | Semantic analysis |
| **Requires** | Running proxy servers | Server configuration |
| **Speed** | Fast (milliseconds) | Varies by server count |
| **Best For** | Quick pattern checks | Deep security analysis |
| **Internet Required** | No | Yes |
| **Custom Rules** | Yes (YARA) | No |

### When to Use Each

**Use Local Analysis when:**
- You need quick, immediate results
- You want to check for specific patterns
- You're working offline
- You want to create custom detection rules

**Use Smart Scan when:**
- You need comprehensive security analysis
- You want AI-powered semantic detection
- You need detailed security reports
- You want to identify complex vulnerabilities

## API Reference

### Analyse Running Servers

```http
POST /api/security/analyse
```

Scans all MCP servers currently connected via the proxy.

**Response:**
```json
{
  "success": true,
  "serversScanned": 2,
  "totalFindings": 5,
  "results": [...]
}
```

**Error Response (no servers running):**
```json
{
  "success": false,
  "error": "No MCP servers are running. Start servers via the Setup tab.",
  "requiresSetup": true
}
```

### Get Connected Servers

```http
GET /api/server/connected
```

Returns the count and names of currently connected servers.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "servers": ["filesystem", "github"]
}
```

### Get Scan History

```http
GET /api/security/history?limit=20
```

Returns historical scan data.

### Clear Findings

```http
POST /api/security/findings/clear
```

Removes all findings and scan history.

## Troubleshooting

### Analyse Button is Disabled

**Cause**: No MCP servers are running through the proxy.

**Solution**:
1. Go to the Setup tab
2. Select your MCP configuration file
3. Start the MCP Shark server
4. Return to Local Analysis

### No Findings After Scan

**Possible causes**:
- Server configurations are clean (no issues detected)
- Relevant YARA rules are disabled
- Servers don't expose tools/resources

**Solutions**:
- Check the YARA Detection tab to ensure rules are enabled
- Verify servers are properly connected in Setup
- Review the MCP Playground to confirm server capabilities

### Historical Scan Shows Different Results

**Cause**: Server configurations or YARA rules changed between scans.

**Solution**: This is expected behavior. Use History to compare how security posture changes over time.
