import assert from 'node:assert';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { after, before, beforeEach, describe, it } from 'node:test';
import { applyFixes, renderFixResults } from '../AutoFixEngine.js';
import { applyFix, undoFixes } from '../FixHandlers.js';

const TMP_DIR = join(import.meta.dirname, '_tmp_fix_test');
const CONFIG_PATH = join(TMP_DIR, 'mcp.json');

describe('AutoFixEngine + FixHandlers', () => {
  before(() => {
    mkdirSync(TMP_DIR, { recursive: true });
  });

  after(() => {
    rmSync(TMP_DIR, { recursive: true, force: true });
  });

  beforeEach(() => {
    const config = {
      mcpServers: {
        slack: { env: { SLACK_TOKEN: 'xoxb-real-token-value' } },
      },
    };
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
    const backupPath = `${CONFIG_PATH}.shark-backup`;
    if (existsSync(backupPath)) {
      unlinkSync(backupPath);
    }
  });

  describe('applyFix - env_var_replacement', () => {
    it('replaces hardcoded secret with ${ENV_VAR} reference', () => {
      const finding = {
        fixable: true,
        fix_type: 'env_var_replacement',
        config_path: CONFIG_PATH,
        fix_data: { key: 'SLACK_TOKEN', original: 'xoxb-real-token-value' },
      };
      const envVars = [];
      const result = applyFix(finding, envVars);
      assert.ok(result.success);
      const updated = readFileSync(CONFIG_PATH, 'utf-8');
      assert.ok(updated.includes('${SLACK_TOKEN}'));
      assert.ok(!updated.includes('xoxb-real-token-value'));
    });

    it('creates backup file', () => {
      const finding = {
        fixable: true,
        fix_type: 'env_var_replacement',
        config_path: CONFIG_PATH,
        fix_data: { key: 'SLACK_TOKEN', original: 'xoxb-real-token-value' },
      };
      applyFix(finding, []);
      assert.ok(existsSync(`${CONFIG_PATH}.shark-backup`));
    });

    it('collects env var names', () => {
      const finding = {
        fixable: true,
        fix_type: 'env_var_replacement',
        config_path: CONFIG_PATH,
        fix_data: { key: 'SLACK_TOKEN', original: 'xoxb-real-token-value' },
      };
      const envVars = [];
      applyFix(finding, envVars);
      assert.strictEqual(envVars.length, 1);
      assert.strictEqual(envVars[0].name, 'SLACK_TOKEN');
    });

    it('returns error for missing config file', () => {
      const finding = {
        fixable: true,
        fix_type: 'env_var_replacement',
        config_path: '/nonexistent/path.json',
        fix_data: { key: 'KEY', original: 'val' },
      };
      const result = applyFix(finding, []);
      assert.strictEqual(result.success, false);
    });
  });

  describe('applyFix - unknown type', () => {
    it('returns failure for unknown fix type', () => {
      const finding = { fixable: true, fix_type: 'unknown_type', config_path: CONFIG_PATH };
      const result = applyFix(finding, []);
      assert.strictEqual(result.success, false);
    });
  });

  describe('applyFixes orchestration', () => {
    it('applies all fixable findings', () => {
      const findings = [
        {
          fixable: true,
          fix_type: 'env_var_replacement',
          config_path: CONFIG_PATH,
          fix_data: { key: 'SLACK_TOKEN', original: 'xoxb-real-token-value' },
        },
        {
          fixable: false,
          severity: 'medium',
          title: 'Not fixable',
        },
      ];
      const result = applyFixes(findings);
      assert.ok(result.fixed.length >= 1);
    });

    it('skips non-fixable findings', () => {
      const findings = [{ fixable: false, severity: 'high', title: 'Manual' }];
      const result = applyFixes(findings);
      assert.strictEqual(result.fixed.length, 0);
    });
  });

  describe('undoFixes', () => {
    it('restores from backup', () => {
      const finding = {
        fixable: true,
        fix_type: 'env_var_replacement',
        config_path: CONFIG_PATH,
        fix_data: { key: 'SLACK_TOKEN', original: 'xoxb-real-token-value' },
      };
      applyFix(finding, []);
      const afterFix = readFileSync(CONFIG_PATH, 'utf-8');
      assert.ok(afterFix.includes('${SLACK_TOKEN}'));

      const undoResult = undoFixes([finding]);
      assert.ok(undoResult.fixed.length >= 1);
      const restored = readFileSync(CONFIG_PATH, 'utf-8');
      assert.ok(restored.includes('xoxb-real-token-value'));
    });

    it('skips when no backup exists', () => {
      const result = undoFixes([{ config_path: '/some/path.json' }]);
      assert.ok(result.skipped.length >= 1);
    });
  });

  describe('renderFixResults', () => {
    it('does not throw when nothing was attempted', () => {
      assert.doesNotThrow(() => {
        renderFixResults({ fixed: [], skipped: [], errors: [] }, null, null);
      });
    });

    it('renders when fixes failed with errors but none succeeded', () => {
      assert.doesNotThrow(() => {
        renderFixResults(
          {
            fixed: [],
            skipped: [{ reason: 'skipped', finding: { title: 'x' } }],
            errors: [{ error: 'disk full', finding: { title: 'y' } }],
          },
          null,
          null
        );
      });
    });

    it('renders when there were successful fixes', () => {
      assert.doesNotThrow(() => {
        renderFixResults(
          {
            fixed: [{ success: true, message: 'ok', finding: {} }],
            skipped: [],
            errors: [],
          },
          null,
          null
        );
      });
    });
  });

  describe('applyFix - chmod', () => {
    it('creates backup before changing permissions', { skip: process.platform === 'win32' }, () => {
      writeFileSync(CONFIG_PATH, '{}', 'utf-8');
      chmodSync(CONFIG_PATH, 0o644);
      const backupPath = `${CONFIG_PATH}.shark-backup`;
      if (existsSync(backupPath)) {
        unlinkSync(backupPath);
      }

      const finding = {
        fixable: true,
        fix_type: 'chmod',
        config_path: CONFIG_PATH,
        fix_data: { oldPerms: '644' },
      };
      const result = applyFix(finding, []);
      assert.ok(result.success, result.error || result.reason);
      assert.ok(existsSync(backupPath));
    });
  });
});
