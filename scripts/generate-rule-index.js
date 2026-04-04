#!/usr/bin/env node
/**
 * Auto-generates the rules barrel file (core/services/security/rules/index.js)
 * by scanning all .js files in rules/scans/ and reading their ruleMetadata exports.
 *
 * Usage: node scripts/generate-rule-index.js
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const SCANS_DIR = join(import.meta.dirname, '..', 'core', 'services', 'security', 'rules', 'scans');
const OUTPUT_FILE = join(
  import.meta.dirname,
  '..',
  'core',
  'services',
  'security',
  'rules',
  'index.js'
);

const HEADER = `/**
 * Static security rules index — AUTO-GENERATED
 * Do not edit manually. Run: npm run generate:rules
 *
 * Exports all OWASP MCP Top 10 + Agentic Security + General security rules
 */
`;

function generateRuleIndex() {
  const files = readdirSync(SCANS_DIR)
    .filter((f) => f.endsWith('.js'))
    .sort();

  const imports = [];
  const entries = [];

  for (const file of files) {
    const moduleName = basename(file, '.js');
    const alias = toAlias(moduleName);
    imports.push(`import * as ${alias} from './scans/${file}';`);
    entries.push(`  [${alias}.ruleMetadata.id]: ${alias},`);
  }

  const source = [
    HEADER,
    imports.join('\n'),
    '',
    '/**',
    ' * All available static rules with their analysis functions',
    ' */',
    'export const staticRules = {',
    entries.join('\n'),
    '};',
    '',
    '/**',
    ' * Get all rule metadata',
    ' */',
    'export function getAllRuleMetadata() {',
    '  return Object.values(staticRules).map((rule) => rule.ruleMetadata);',
    '}',
    '',
    '/**',
    ' * Get rule by ID',
    ' */',
    'export function getRule(ruleId) {',
    '  return staticRules[ruleId] || null;',
    '}',
    '',
    '/**',
    ' * Get all enabled rules (for now, all rules are enabled)',
    ' */',
    'export function getEnabledRules() {',
    '  return Object.entries(staticRules).map(([id, rule]) => ({',
    '    id,',
    '    ...rule.ruleMetadata,',
    '    analyzeTool: rule.analyzeTool,',
    '    analyzePrompt: rule.analyzePrompt,',
    '    analyzeResource: rule.analyzeResource,',
    '    analyzePacket: rule.analyzePacket,',
    '  }));',
    '}',
    '',
  ].join('\n');

  writeFileSync(OUTPUT_FILE, source, 'utf-8');

  const count = files.length;
  console.log(`Generated rules/index.js with ${count} rules from scans/ directory`);
}

/**
 * Convert a file name like "mcp01TokenMismanagement" to a safe JS alias
 */
function toAlias(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}

generateRuleIndex();
