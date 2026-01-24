/**
 * YARA Rule Parser
 * Parses YARA rule syntax and extracts metadata for display and management
 * This is a lightweight parser for UI purposes, not for execution
 */

/**
 * Parse a single YARA rule and extract its components
 */
export function parseYaraRule(content) {
  const result = {
    valid: false,
    name: null,
    tags: [],
    meta: {},
    strings: [],
    condition: null,
    imports: [],
    errors: [],
  };

  try {
    // Extract imports
    const importMatches = content.matchAll(/import\s+"([^"]+)"/g);
    for (const match of importMatches) {
      result.imports.push(match[1]);
    }

    // Extract rule name and tags
    const ruleMatch = content.match(/rule\s+(\w+)\s*(?::\s*([\w\s]+))?\s*\{/);
    if (!ruleMatch) {
      result.errors.push('Could not parse rule declaration');
      return result;
    }

    result.name = ruleMatch[1];
    if (ruleMatch[2]) {
      result.tags = ruleMatch[2].trim().split(/\s+/);
    }

    // Extract meta section
    const metaMatch = content.match(/meta\s*:\s*([\s\S]*?)(?=strings\s*:|condition\s*:|$)/i);
    if (metaMatch) {
      const metaContent = metaMatch[1];
      const metaLines = metaContent.split('\n');

      for (const line of metaLines) {
        const kvMatch = line.match(/^\s*(\w+)\s*=\s*(.+?)\s*$/);
        if (kvMatch) {
          const key = kvMatch[1];
          const rawValue = kvMatch[2].trim();
          const parsedValue = parseMetaValue(rawValue);
          result.meta[key] = parsedValue;
        }
      }
    }

    // Extract strings section
    const stringsMatch = content.match(/strings\s*:\s*([\s\S]*?)(?=condition\s*:|$)/i);
    if (stringsMatch) {
      const stringsContent = stringsMatch[1];
      const stringLines = stringsContent.split('\n');

      for (const line of stringLines) {
        const stringMatch = line.match(/^\s*(\$\w+)\s*=\s*(.+?)\s*$/);
        if (stringMatch) {
          result.strings.push({
            identifier: stringMatch[1],
            value: stringMatch[2].trim(),
          });
        }
      }
    }

    // Extract condition
    const conditionMatch = content.match(/condition\s*:\s*([\s\S]*?)(?=\}|$)/i);
    if (conditionMatch) {
      result.condition = conditionMatch[1].trim().replace(/\s+/g, ' ');
    }

    result.valid = true;
  } catch (error) {
    result.errors.push(error.message);
  }

  return result;
}

/**
 * Parse multiple YARA rules from a file content
 */
export function parseYaraFile(content) {
  const rules = [];
  const globalImports = [];

  // Extract global imports (before any rule)
  const importMatches = content.matchAll(/import\s+"([^"]+)"/g);
  for (const match of importMatches) {
    globalImports.push(match[1]);
  }

  // Split by rule declarations
  const ruleMatches = content.matchAll(/rule\s+\w+[\s\S]*?(?=\nrule\s+|\n*$)/g);

  for (const match of ruleMatches) {
    const ruleContent = match[0];
    const parsed = parseYaraRule(ruleContent);

    if (parsed.valid) {
      // Add global imports to each rule
      parsed.imports = [...new Set([...globalImports, ...parsed.imports])];
      rules.push(parsed);
    }
  }

  return rules;
}

/**
 * Convert a parsed YARA rule to security rule format
 */
export function convertToSecurityRule(parsed, source = 'community') {
  return {
    rule_id: `yara-${parsed.name}`,
    source,
    name: parsed.meta.description || parsed.name,
    content: null, // Original content should be stored separately
    owasp_id: parsed.meta.owasp_id || parsed.meta.owasp || parsed.meta.cwe || null,
    severity: normalizeSeverity(parsed.meta.severity || parsed.meta.threat_level),
    tags: JSON.stringify(parsed.tags),
    description: parsed.meta.description || null,
    author: parsed.meta.author || null,
    reference: parsed.meta.reference || null,
  };
}

/**
 * Parse a meta value from YARA rule
 */
function parseMetaValue(rawValue) {
  // Remove quotes from string values
  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    return rawValue.slice(1, -1);
  }
  // Parse boolean values
  if (rawValue === 'true') {
    return true;
  }
  if (rawValue === 'false') {
    return false;
  }
  // Parse numeric values
  if (/^\d+$/.test(rawValue)) {
    return Number.parseInt(rawValue, 10);
  }
  return rawValue;
}

/**
 * Normalize severity value
 */
function normalizeSeverity(value) {
  if (!value) {
    return 'medium';
  }

  const normalized = String(value).toLowerCase();

  const severityMap = {
    critical: 'critical',
    crit: 'critical',
    high: 'high',
    medium: 'medium',
    med: 'medium',
    low: 'low',
    info: 'info',
    informational: 'info',
  };

  return severityMap[normalized] || 'medium';
}

/**
 * Validate YARA rule syntax (basic validation)
 */
export function validateYaraRule(content) {
  const errors = [];
  const warnings = [];

  // Check for rule declaration
  if (!content.match(/rule\s+\w+/)) {
    errors.push('Missing rule declaration');
  }

  // Check for condition section
  if (!content.match(/condition\s*:/i)) {
    errors.push('Missing condition section');
  }

  // Check for balanced braces
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('Unbalanced braces');
  }

  // Check for common issues
  if (content.includes('$') && !content.match(/strings\s*:/i)) {
    warnings.push('String variables used but no strings section found');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extract rule metadata summary for display
 */
export function getRuleSummary(parsed) {
  return {
    name: parsed.name,
    tags: parsed.tags,
    description: parsed.meta.description || null,
    author: parsed.meta.author || null,
    severity: normalizeSeverity(parsed.meta.severity || parsed.meta.threat_level),
    stringCount: parsed.strings.length,
    hasCondition: !!parsed.condition,
    imports: parsed.imports,
  };
}
