const PROMPT_VERSION = '1.0.0';

/**
 * Build the prompt for LLM tool drift analysis
 */
export function buildDriftAnalysisPrompt(baselineCompact, currentCompact, diff) {
  const baselineTools = baselineCompact.tools || [];
  const currentTools = currentCompact.tools || [];

  const prompt = `You are a cybersecurity expert analyzing changes in MCP (Model Context Protocol) tool manifests.

A tool manifest defines the capabilities available to an LLM. Changes to tool manifests can introduce security risks.

**BASELINE MANIFEST** (previous state):
${baselineTools.length === 0 ? 'No tools' : baselineTools.map((t) => `- ${t.name}: ${t.description || 'No description'}`).join('\n')}

**CURRENT MANIFEST** (current state):
${currentTools.length === 0 ? 'No tools' : currentTools.map((t) => `- ${t.name}: ${t.description || 'No description'}`).join('\n')}

**DETECTED CHANGES**:
${diff.summary || 'No changes detected'}
${diff.added.length > 0 ? `\nAdded tools:\n${diff.added.map((t) => `- ${t.name}: ${t.description || 'No description'}`).join('\n')}` : ''}
${diff.removed.length > 0 ? `\nRemoved tools:\n${diff.removed.map((t) => `- ${t.name}: ${t.description || 'No description'}`).join('\n')}` : ''}
${diff.changed.length > 0 ? `\nChanged tools:\n${diff.changed.map((t) => `- ${t.name}: Changes in ${t.changes.join(', ')}`).join('\n')}` : ''}

**YOUR TASK**:
Analyze these changes for security risks. Consider:
- Tools that execute system commands or shell operations
- Tools that access file systems (read/write/delete)
- Tools that make network requests
- Tools that access sensitive data
- Tools with suspicious parameter changes
- Tools removed that were previously present (potential backdoor removal)
- Tools added that bypass security controls

**OUTPUT FORMAT**:
You MUST respond with valid JSON only, no markdown, no explanation, no code blocks. Use this exact structure:

{
  "riskLevel": "low" | "medium" | "high" | "critical",
  "summary": "Brief summary (max 500 chars)",
  "findings": [
    {
      "type": "added" | "removed" | "changed",
      "toolName": "tool-name",
      "severity": "low" | "medium" | "high" | "critical",
      "description": "Description of security concern (max 500 chars)",
      "recommendation": "Recommended action (max 500 chars, optional)"
    }
  ],
  "confidence": 0.0-1.0
}

Respond with JSON only:`;

  return { prompt, version: PROMPT_VERSION };
}

/**
 * Compact diff for prompt (reduce token usage)
 */
export function compactDiffForPrompt(diff, maxTools = 10) {
  const compact = {
    summary: diff.summary || 'No changes',
    added: (diff.added || []).slice(0, maxTools),
    removed: (diff.removed || []).slice(0, maxTools),
    changed: (diff.changed || []).slice(0, maxTools),
  };

  if ((diff.added || []).length > maxTools) {
    compact.summary += ` (showing first ${maxTools} of ${diff.added.length} added tools)`;
  }
  if ((diff.removed || []).length > maxTools) {
    compact.summary += ` (showing first ${maxTools} of ${diff.removed.length} removed tools)`;
  }
  if ((diff.changed || []).length > maxTools) {
    compact.summary += ` (showing first ${maxTools} of ${diff.changed.length} changed tools)`;
  }

  return compact;
}

export { PROMPT_VERSION };
