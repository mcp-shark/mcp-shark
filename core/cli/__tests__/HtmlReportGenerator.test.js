import assert from 'node:assert';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { generateHtmlReport } from '../HtmlReportGenerator.js';

const OUTPUT_PATH = join(import.meta.dirname, '_test_report.html');

describe('HtmlReportGenerator', () => {
  const mockScanResult = {
    scoreResult: { score: 72, grade: 'C', label: 'Needs work' },
    findings: [
      {
        rule_id: 'hardcoded-secret',
        severity: 'critical',
        title: 'API Key Exposed',
        description: 'Found hardcoded key',
        server_name: 'test-srv',
        ide: 'Cursor',
      },
      {
        rule_id: 'missing-containment',
        severity: 'high',
        title: 'No Container',
        description: 'Runs uncontained',
        server_name: 'test-srv',
        ide: 'Cursor',
      },
    ],
    toxicFlows: [
      {
        source: 'Slack',
        target: 'GitHub',
        scenario: 'Prompt injection leads to code push',
      },
    ],
    severityCounts: { critical: 1, high: 1, medium: 0, low: 0 },
    servers: [{ name: 'test-srv', ide: 'Cursor' }],
    serverCount: 1,
    ruleCount: 35,
    elapsedMs: 42,
  };

  after(() => {
    if (existsSync(OUTPUT_PATH)) {
      unlinkSync(OUTPUT_PATH);
    }
  });

  it('generates a file at the specified path', () => {
    generateHtmlReport(mockScanResult, OUTPUT_PATH);
    assert.ok(existsSync(OUTPUT_PATH));
  });

  it('produces valid HTML with DOCTYPE', () => {
    generateHtmlReport(mockScanResult, OUTPUT_PATH);
    const html = readFileSync(OUTPUT_PATH, 'utf-8');
    assert.ok(html.startsWith('<!DOCTYPE html>'));
    assert.ok(html.includes('</html>'));
  });

  it('includes the Shark Score', () => {
    generateHtmlReport(mockScanResult, OUTPUT_PATH);
    const html = readFileSync(OUTPUT_PATH, 'utf-8');
    assert.ok(html.includes('72'));
    assert.ok(html.includes('Shark Score'));
  });

  it('includes findings with severity badges', () => {
    generateHtmlReport(mockScanResult, OUTPUT_PATH);
    const html = readFileSync(OUTPUT_PATH, 'utf-8');
    assert.ok(html.includes('API Key Exposed'));
    assert.ok(html.includes('sev-critical'));
    assert.ok(html.includes('sev-high'));
  });

  it('includes toxic flows section', () => {
    generateHtmlReport(mockScanResult, OUTPUT_PATH);
    const html = readFileSync(OUTPUT_PATH, 'utf-8');
    assert.ok(html.includes('Toxic Flows'));
    assert.ok(html.includes('Prompt injection'));
  });

  it('includes servers table', () => {
    generateHtmlReport(mockScanResult, OUTPUT_PATH);
    const html = readFileSync(OUTPUT_PATH, 'utf-8');
    assert.ok(html.includes('test-srv'));
    assert.ok(html.includes('Cursor'));
  });

  it('is self-contained (no external CSS/JS)', () => {
    generateHtmlReport(mockScanResult, OUTPUT_PATH);
    const html = readFileSync(OUTPUT_PATH, 'utf-8');
    assert.ok(!html.includes('<link rel="stylesheet"'));
    assert.ok(!html.includes('<script src='));
    assert.ok(html.includes('<style>'));
  });

  it('escapes HTML in findings', () => {
    const xssResult = {
      ...mockScanResult,
      findings: [
        {
          rule_id: 'xss-test',
          severity: 'high',
          title: '<script>alert("xss")</script>',
          description: 'Test & verify',
          server_name: 'srv',
        },
      ],
    };
    generateHtmlReport(xssResult, OUTPUT_PATH);
    const html = readFileSync(OUTPUT_PATH, 'utf-8');
    assert.ok(!html.includes('<script>alert'));
    assert.ok(html.includes('&lt;script&gt;'));
  });
});
