/**
 * Declarative Rule Engine
 * Loads JSON rule packs and compiles them into the same analyzeTool/analyzePrompt/
 * analyzeResource/analyzePacket interface that JS rule plugins export.
 *
 * Rule packs are loaded from:
 *   1. Built-in: core/cli/data/rule-packs/*.json  (shipped with package)
 *   2. User:     .mcp-shark/rule-packs/*.json      (local overrides / downloads)
 *
 * This allows OWASP 2027+ and new vulnerability catalogs to be added
 * without writing any JavaScript.
 *
 * Options: pass `{ builtinOnly: true }` to load only shipped packs (tests avoid cwd overrides).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  packetToText,
  promptToText,
  resourceToText,
  toolToText,
} from '#core/services/security/rules/utils/text.js';

const BUILTIN_PACKS_DIR = join(import.meta.dirname, 'data', 'rule-packs');
const USER_PACKS_DIR = join(process.cwd(), '.mcp-shark', 'rule-packs');

/**
 * Load all rule packs and compile them into rule objects.
 * Returns an array of rule objects with the same shape as JS rule plugins:
 *   { ruleMetadata, analyzeTool, analyzePrompt, analyzeResource, analyzePacket }
 *
 * @param {{ builtinOnly?: boolean }} [options]
 * @returns {Array<object>}
 */
export function loadDeclarativeRules(options = {}) {
  const packs = options.builtinOnly ? loadPacksFromDir(BUILTIN_PACKS_DIR) : loadAllPacks();
  const rules = [];

  for (const pack of packs) {
    const packRules = Array.isArray(pack.rules) ? pack.rules : [];
    for (const ruleDef of packRules) {
      const compiled = compileRule(ruleDef);
      if (compiled) {
        rules.push(compiled);
      }
    }
  }

  return deduplicateRules(rules);
}

/**
 * Load JSON packs from built-in and user directories.
 * User packs with the same pack_id override built-in packs.
 */
function loadAllPacks() {
  const builtinPacks = loadPacksFromDir(BUILTIN_PACKS_DIR);
  const userPacks = loadPacksFromDir(USER_PACKS_DIR);

  const packMap = new Map();
  for (const pack of builtinPacks) {
    packMap.set(pack.pack_id, pack);
  }
  for (const pack of userPacks) {
    packMap.set(pack.pack_id, pack);
  }

  return [...packMap.values()];
}

/**
 * Load all .json rule pack files from a directory.
 */
function loadPacksFromDir(dirPath) {
  if (!existsSync(dirPath)) {
    return [];
  }

  const files = readdirSync(dirPath).filter((f) => f.endsWith('.json'));
  const packs = [];

  for (const file of files) {
    try {
      const content = readFileSync(join(dirPath, file), 'utf-8');
      const pack = JSON.parse(content);
      if (pack.schema_version && Array.isArray(pack.rules)) {
        packs.push(pack);
      }
    } catch (_err) {
      // skip malformed pack files
    }
  }

  return packs;
}

/**
 * Compile a single declarative rule definition into a rule object.
 */
function compileRule(ruleDef) {
  const patterns = compilePatterns(ruleDef.patterns || []);
  const excludePatterns = compilePatterns(ruleDef.exclude_patterns || []);
  const toolNamePatterns = compileToolNamePatterns(ruleDef.tool_name_patterns || []);
  const paramPatterns = compilePatterns(ruleDef.param_patterns || []);
  const escalationPatterns = compilePatterns(ruleDef.severity_escalation_patterns || []);
  const scope = new Set(ruleDef.scope || ['tool', 'prompt', 'resource', 'packet']);
  const matchMode = ruleDef.match_mode || 'all_matches';
  const severityOverrides = ruleDef.severity_overrides || {};
  const textField = ruleDef.text_field || null;

  const ruleMetadata = {
    id: ruleDef.id,
    name: ruleDef.name,
    owasp_id: ruleDef.owasp_id,
    severity: ruleDef.severity,
    description: ruleDef.description,
    source: 'declarative',
    type: ruleDef.type,
  };

  const ctx = {
    ruleDef,
    patterns,
    excludePatterns,
    toolNamePatterns,
    paramPatterns,
    escalationPatterns,
    scope,
    matchMode,
    severityOverrides,
    textField,
    ruleMetadata,
  };

  return {
    ruleMetadata,
    analyzeTool: scope.has('tool') ? (tool) => analyzeEntity(ctx, 'tool', tool, toolToText) : noOp,
    analyzePrompt: scope.has('prompt')
      ? (prompt) => analyzeEntity(ctx, 'prompt', prompt, promptToText)
      : noOp,
    analyzeResource: scope.has('resource')
      ? (resource) => analyzeEntity(ctx, 'resource', resource, resourceToText)
      : noOp,
    analyzePacket: scope.has('packet')
      ? (packet) => analyzeEntity(ctx, 'packet', packet, packetToText)
      : noOp,
  };
}

/**
 * Analyze a single entity against a compiled rule's patterns.
 */
function analyzeEntity(ctx, entityType, entity, textFn) {
  const text =
    ctx.textField && entityType === 'tool' ? entity?.[ctx.textField] || '' : textFn(entity);

  if (!text) {
    return [];
  }

  if (hasExcludeMatch(ctx.excludePatterns, text)) {
    return [];
  }

  const findings = [];
  const severity = ctx.severityOverrides[entityType] || ctx.ruleDef.severity;
  const entityName = entity?.name || entity?.uri || entityType;

  if (entityType === 'tool' && ctx.toolNamePatterns.length > 0) {
    const toolName = entity?.name || '';
    const nameFindings = matchToolName(ctx, toolName, entityName);
    findings.push(...nameFindings);
  }

  if (entityType === 'tool' && ctx.paramPatterns.length > 0) {
    const paramFindings = matchParams(ctx, entity, entityName);
    findings.push(...paramFindings);
  }

  const textFindings = matchText(ctx, text, entityType, entityName, severity);
  findings.push(...textFindings);

  if (findings.length > 0 && ctx.escalationPatterns.length > 0) {
    applyEscalation(ctx.escalationPatterns, text, findings);
  }

  return findings;
}

/**
 * Match text against the rule's main patterns.
 */
function matchText(ctx, text, entityType, entityName, severity) {
  const { patterns, matchMode, ruleDef } = ctx;
  const matched = [];

  for (const p of patterns) {
    p.regex.lastIndex = 0;
    const match = text.match(p.regex);
    if (match) {
      matched.push({ snippet: match[0], label: p.label });
      if (matchMode === 'first') {
        break;
      }
    }
  }

  if (matched.length === 0) {
    return [];
  }

  const evidence = matched.map((m) => m.label || m.snippet);
  const description = `${ruleDef.name} detected in ${entityType} "${entityName}": ${evidence.join(', ')}`;

  return [buildFinding(ctx, severity, entityName, description, entityType)];
}

/**
 * Match tool name against tool_name_patterns.
 */
function matchToolName(ctx, toolName, entityName) {
  const findings = [];
  for (const p of ctx.toolNamePatterns) {
    p.regex.lastIndex = 0;
    if (p.regex.test(toolName)) {
      const description = `Suspicious tool name "${toolName}" matches ${p.label}`;
      findings.push(
        buildFinding(ctx, p.severity || ctx.ruleDef.severity, entityName, description, 'tool')
      );
      break;
    }
  }
  return findings;
}

/**
 * Match tool parameter names against param_patterns.
 */
function matchParams(ctx, tool, entityName) {
  const schema = tool?.input_schema || tool?.inputSchema || {};
  const props = schema.properties || {};
  const findings = [];

  for (const [paramName, paramDef] of Object.entries(props)) {
    for (const p of ctx.paramPatterns) {
      p.regex.lastIndex = 0;
      if (p.regex.test(paramName)) {
        const desc = (paramDef?.description || '').toLowerCase();
        const hasGuard =
          desc.includes('relative') || desc.includes('within') || desc.includes('allowed');
        if (!hasGuard) {
          const description = `Unsanitized ${p.label} "${paramName}" in tool "${entityName}"`;
          findings.push(buildFinding(ctx, 'medium', entityName, description, 'tool'));
        }
      }
    }
  }

  return findings;
}

/**
 * Check if any exclude pattern matches the text.
 */
function hasExcludeMatch(excludePatterns, text) {
  for (const p of excludePatterns) {
    p.regex.lastIndex = 0;
    if (p.regex.test(text)) {
      return true;
    }
  }
  return false;
}

/**
 * Apply severity escalation: if any escalation pattern matches,
 * upgrade all findings to the escalation severity.
 */
function applyEscalation(escalationPatterns, text, findings) {
  for (const p of escalationPatterns) {
    p.regex.lastIndex = 0;
    if (p.regex.test(text)) {
      for (const f of findings) {
        f.severity = p.severity;
      }
      break;
    }
  }
}

/**
 * Build a single finding in mcp-shark format.
 */
function buildFinding(ctx, severity, entityName, description, targetType) {
  return {
    rule_id: ctx.ruleDef.id,
    severity,
    owasp_id: ctx.ruleDef.owasp_id,
    title: `${ctx.ruleDef.name}: ${entityName}`,
    description,
    evidence: entityName,
    recommendation: ctx.ruleDef.recommendation,
    target_type: targetType,
    target_name: entityName,
  };
}

/**
 * Compile pattern entries (string or {regex, label, flags}) to RegExp objects.
 */
function compilePatterns(entries) {
  const compiled = [];
  for (const entry of entries) {
    try {
      if (typeof entry === 'string') {
        compiled.push({ regex: new RegExp(entry, 'i'), label: null });
      } else {
        const flags = entry.flags !== undefined ? entry.flags : 'i';
        compiled.push({ regex: new RegExp(entry.regex, flags), label: entry.label || null });
      }
    } catch (_err) {
      // skip malformed patterns
    }
  }
  return compiled;
}

/**
 * Compile tool name patterns with their per-pattern severity.
 */
function compileToolNamePatterns(entries) {
  const compiled = [];
  for (const entry of entries) {
    try {
      compiled.push({
        regex: new RegExp(entry.regex, 'i'),
        label: entry.label || null,
        severity: entry.severity || null,
      });
    } catch (_err) {
      // skip malformed patterns
    }
  }
  return compiled;
}

/**
 * Deduplicate rules by ID (later packs / user overrides win).
 */
function deduplicateRules(rules) {
  const map = new Map();
  for (const rule of rules) {
    map.set(rule.ruleMetadata.id, rule);
  }
  return [...map.values()];
}

/**
 * No-op for out-of-scope entity types.
 */
function noOp() {
  return [];
}
