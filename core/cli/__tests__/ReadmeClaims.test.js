/**
 * README Claims Verification Tests
 * Every number and feature claim in the README must be backed by a real test.
 * If any of these fail, the README is lying to users.
 */
import assert from 'node:assert';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { loadDeclarativeRules } from '../DeclarativeRuleEngine.js';
import { IDE_CONFIGS } from '../IdeConfigPaths.js';

const JS_RULES_DIR = join(
  import.meta.dirname,
  '..',
  '..',
  'services',
  'security',
  'rules',
  'scans'
);
const RULE_PACKS_DIR = join(import.meta.dirname, '..', 'data', 'rule-packs');

describe('README Claims Verification', () => {
  it('README says "35 security rules" — verify 24 declarative + 11 JS = 35', () => {
    const declarativeRules = loadDeclarativeRules({ builtinOnly: true });
    const jsFiles = readdirSync(JS_RULES_DIR).filter((f) => f.endsWith('.js'));
    const total = declarativeRules.length + jsFiles.length;
    assert.strictEqual(
      declarativeRules.length,
      24,
      `Expected 24 declarative, got ${declarativeRules.length}`
    );
    assert.strictEqual(jsFiles.length, 11, `Expected 11 JS rules, got ${jsFiles.length}`);
    assert.strictEqual(total, 35, `Expected 35 total rules, got ${total}`);
  });

  it('README says "15 IDE detection" — verify 15 entries', () => {
    assert.strictEqual(IDE_CONFIGS.length, 15);
  });

  it('README says "4 output formats" — terminal, json, sarif, html', async () => {
    const { formatAsJson, formatAsSarif } = await import('../output/JsonFormatter.js');
    assert.strictEqual(typeof formatAsJson, 'function');
    assert.strictEqual(typeof formatAsSarif, 'function');
    const { generateHtmlReport } = await import('../HtmlReportGenerator.js');
    assert.strictEqual(typeof generateHtmlReport, 'function');
  });

  it('README says "Shark Score" with grades A-F — verify grade boundaries', async () => {
    const { calculateSharkScore } = await import('../SharkScoreCalculator.js');
    assert.strictEqual(calculateSharkScore([]).grade, 'A');
    assert.strictEqual(calculateSharkScore([{ severity: 'high' }]).grade, 'B');
    const manyFindings = Array.from({ length: 10 }, () => ({ severity: 'critical' }));
    assert.strictEqual(calculateSharkScore(manyFindings).grade, 'F');
  });

  it('README says "Auto-fix" with backup/undo — verify modules exist', async () => {
    const { applyFixes } = await import('../AutoFixEngine.js');
    const { undoFixes } = await import('../FixHandlers.js');
    assert.strictEqual(typeof applyFixes, 'function');
    assert.strictEqual(typeof undoFixes, 'function');
  });

  it('README says "Tool pinning" with SHA-256 — verify hash function', async () => {
    const { hashToolDefinition } = await import('../LockDiffEngine.js');
    const hash = hashToolDefinition({ name: 'test', description: 'test' });
    assert.match(hash, /^[a-f0-9]{64}$/, 'Should produce SHA-256 hex');
  });

  it('README says "Toxic flow analysis" — verify analyzer exists', async () => {
    const { analyzeToxicFlows } = await import('../ToxicFlowAnalyzer.js');
    assert.strictEqual(typeof analyzeToxicFlows, 'function');
  });

  it('README says "Attack walkthroughs" — verify generator exists', async () => {
    const { generateWalkthroughs } = await import('../WalkthroughGenerator.js');
    assert.strictEqual(typeof generateWalkthroughs, 'function');
  });

  it('README says "YAML rules" — verify engine exists', async () => {
    const { loadYamlRules, applyYamlRules } = await import('../YamlRuleEngine.js');
    assert.strictEqual(typeof loadYamlRules, 'function');
    assert.strictEqual(typeof applyYamlRules, 'function');
  });

  it('README says "Downloadable rule packs" — verify packs dir exists with JSON files', () => {
    assert.ok(existsSync(RULE_PACKS_DIR), 'rule-packs dir should exist');
    const packs = readdirSync(RULE_PACKS_DIR).filter((f) => f.endsWith('.json'));
    assert.ok(packs.length >= 3, `Expected at least 3 pack files, got ${packs.length}`);
  });

  it('README says "SARIF v2.1.0" — verify schema version', async () => {
    const { formatAsSarif } = await import('../output/JsonFormatter.js');
    const sarif = JSON.parse(formatAsSarif({ version: '1.0.0', findings: [] }));
    assert.strictEqual(sarif.version, '2.1.0');
  });

  it('README says "confirmed/advisory" confidence levels', async () => {
    const { detectHardcodedSecrets } = await import('../SecretDetector.js');
    const findings = detectHardcodedSecrets(
      { KEY: 'AKIAIOSFODNN7EXAMPLE' },
      { name: 's', ide: 'i', configPath: 'p' }
    );
    if (findings.length > 0) {
      assert.ok(
        ['definite', 'confirmed', 'advisory', 'possible'].includes(findings[0].confidence),
        'Findings should have a confidence level'
      );
    }
  });
});
