import assert from 'node:assert';
import { describe, it } from 'node:test';
import { IDE_CONFIGS } from '../IdeConfigPaths.js';

describe('IdeConfigPaths', () => {
  it('defines exactly 15 IDE entries', () => {
    assert.strictEqual(IDE_CONFIGS.length, 15);
  });

  const expectedNames = [
    'Cursor',
    'Claude Desktop',
    'Claude Code',
    'VS Code',
    'Windsurf',
    'Codex',
    'Gemini CLI',
    'Continue',
    'Cline',
    'Amp',
    'Kiro',
    'Zed',
    'Augment',
    'Roo Code',
    'Project',
  ];

  it('contains all expected IDE names', () => {
    const names = IDE_CONFIGS.map((c) => c.name);
    for (const expected of expectedNames) {
      assert.ok(names.includes(expected), `Missing IDE: ${expected}`);
    }
  });

  it('every entry has name, parser, and paths array', () => {
    for (const config of IDE_CONFIGS) {
      assert.ok(config.name, 'Missing name on entry');
      assert.ok(
        ['json', 'toml', 'jsonEmbedded'].includes(config.parser),
        `Invalid parser "${config.parser}" on ${config.name}`
      );
      assert.ok(Array.isArray(config.paths), `paths is not array on ${config.name}`);
    }
  });

  it('Codex uses toml parser', () => {
    const codex = IDE_CONFIGS.find((c) => c.name === 'Codex');
    assert.strictEqual(codex.parser, 'toml');
  });

  it('Gemini CLI uses jsonEmbedded parser', () => {
    const gemini = IDE_CONFIGS.find((c) => c.name === 'Gemini CLI');
    assert.strictEqual(gemini.parser, 'jsonEmbedded');
  });

  it('Project entry scans cwd', () => {
    const project = IDE_CONFIGS.find((c) => c.name === 'Project');
    assert.ok(project.paths.length >= 3, 'Should check mcp.json, .mcp.json, .mcp/config.json');
  });

  it('no duplicate IDE names', () => {
    const names = IDE_CONFIGS.map((c) => c.name);
    const unique = new Set(names);
    assert.strictEqual(unique.size, names.length, 'Duplicate IDE names found');
  });
});
