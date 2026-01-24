import assert from 'node:assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { BackupService } from '../BackupService.js';

function createMockConfigService(tempDir) {
  return {
    resolveFilePath: (filePath) => {
      if (filePath.startsWith('~')) {
        return filePath.replace('~', tempDir);
      }
      return filePath;
    },
    tryParseJson: (content) => {
      try {
        return JSON.parse(content);
      } catch {
        return null;
      }
    },
    parseJsonConfig: (content) => {
      try {
        return { config: JSON.parse(content) };
      } catch {
        return { config: null };
      }
    },
    isConfigPatched: (config) => {
      return config && config._mcpSharkPatched === true;
    },
    updateConfigForMcpShark: (config) => {
      return { ...config, _mcpSharkPatched: true };
    },
    writeConfigAsJson: (filePath, config) => {
      fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
    },
  };
}

function createMockLogger() {
  return {
    info: () => {},
    error: () => {},
    warn: () => {},
  };
}

describe('BackupService', () => {
  const ctx = {};

  beforeEach(() => {
    ctx.tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'backup-test-'));
    ctx.mockConfigService = createMockConfigService(ctx.tempDir);
    ctx.mockLogger = createMockLogger();
    ctx.service = new BackupService(ctx.mockConfigService, ctx.mockLogger);
  });

  afterEach(() => {
    fs.rmSync(ctx.tempDir, { recursive: true, force: true });
  });

  describe('_determineTargetPath', () => {
    test('returns resolved original path if provided', () => {
      const result = ctx.service._determineTargetPath('~/config.json', '/path/to/backup');
      assert.strictEqual(result, path.join(ctx.tempDir, 'config.json'));
    });

    test('extracts target from .backup extension', () => {
      const result = ctx.service._determineTargetPath(null, '/path/mcp.json.backup');
      assert.strictEqual(result, '/path/mcp.json');
    });

    test('extracts target from new format backup name', () => {
      const result = ctx.service._determineTargetPath(
        null,
        '/home/user/.cursor/.mcp.json-mcpshark.2024-01-01_12-00-00.json'
      );
      assert.strictEqual(result, '/home/user/.cursor/mcp.json');
    });

    test('returns null if cannot determine path', () => {
      const result = ctx.service._determineTargetPath(null, '/path/unknown-format.json');
      assert.strictEqual(result, null);
    });
  });

  describe('_repatchIfNeeded', () => {
    test('returns false if not patched', () => {
      const result = ctx.service._repatchIfNeeded(false, true, {}, '/path');
      assert.strictEqual(result, false);
    });

    test('returns false if server not running', () => {
      const result = ctx.service._repatchIfNeeded(true, false, {}, '/path');
      assert.strictEqual(result, false);
    });

    test('returns false if no config', () => {
      const result = ctx.service._repatchIfNeeded(true, true, null, '/path');
      assert.strictEqual(result, false);
    });

    test('returns true and repatches when all conditions met', () => {
      const configPath = path.join(ctx.tempDir, 'config.json');
      fs.writeFileSync(configPath, '{}');

      const result = ctx.service._repatchIfNeeded(true, true, { key: 'value' }, configPath);
      assert.strictEqual(result, true);

      const content = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      assert.strictEqual(content._mcpSharkPatched, true);
    });
  });

  describe('viewBackup', () => {
    test('returns null for non-existent backup', () => {
      const result = ctx.service.viewBackup('/non/existent/backup.json');
      assert.strictEqual(result, null);
    });

    test('returns backup content and metadata for existing file', () => {
      const backupPath = path.join(ctx.tempDir, 'backup.json');
      const content = JSON.stringify({ mcpServers: { test: {} } });
      fs.writeFileSync(backupPath, content);

      const result = ctx.service.viewBackup(backupPath);

      assert.ok(result);
      assert.strictEqual(result.backupPath, backupPath);
      assert.strictEqual(result.content, content);
      assert.ok(result.parsed);
      assert.ok(result.createdAt);
      assert.ok(result.modifiedAt);
      assert.ok(result.size > 0);
    });
  });

  describe('restoreBackup', () => {
    test('returns error for non-existent backup', () => {
      const result = ctx.service.restoreBackup('/non/existent/backup.json');
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error, 'Backup file not found');
    });

    test('returns error when target path cannot be determined', () => {
      const backupPath = path.join(ctx.tempDir, 'unknown-format.json');
      fs.writeFileSync(backupPath, '{}');

      const result = ctx.service.restoreBackup(backupPath);
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error, 'Could not determine original file path');
    });

    test('restores backup to original path', () => {
      const backupPath = path.join(ctx.tempDir, 'config.json.backup');
      const targetPath = path.join(ctx.tempDir, 'config.json');
      const backupContent = JSON.stringify({ mcpServers: { test: {} } });
      fs.writeFileSync(backupPath, backupContent);

      const result = ctx.service.restoreBackup(backupPath);

      assert.strictEqual(result.success, true);
      assert.ok(fs.existsSync(targetPath));
      assert.strictEqual(fs.readFileSync(targetPath, 'utf8'), backupContent);
    });

    test('restores backup to specified original path', () => {
      const backupPath = path.join(ctx.tempDir, 'backup.json');
      const targetPath = path.join(ctx.tempDir, 'restored-config.json');
      const backupContent = JSON.stringify({ mcpServers: { test: {} } });
      fs.writeFileSync(backupPath, backupContent);

      const result = ctx.service.restoreBackup(backupPath, targetPath);

      assert.strictEqual(result.success, true);
      assert.ok(fs.existsSync(targetPath));
    });

    test('repatches config if was patched and server is running', () => {
      const backupPath = path.join(ctx.tempDir, 'config.json.backup');
      const backupContent = JSON.stringify({ mcpServers: {}, _mcpSharkPatched: true });
      fs.writeFileSync(backupPath, backupContent);

      const result = ctx.service.restoreBackup(backupPath, null, true);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.wasPatched, true);
      assert.strictEqual(result.repatched, true);
    });
  });

  describe('deleteBackup', () => {
    test('returns error for non-existent backup', () => {
      const result = ctx.service.deleteBackup('/non/existent/backup.json');
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error, 'Backup file not found');
    });

    test('deletes existing backup file', () => {
      const backupPath = path.join(ctx.tempDir, 'backup.json');
      fs.writeFileSync(backupPath, '{}');

      const result = ctx.service.deleteBackup(backupPath);

      assert.strictEqual(result.success, true);
      assert.ok(!fs.existsSync(backupPath));
    });
  });

  describe('listBackups', () => {
    test('returns empty array when no backups exist', () => {
      const result = ctx.service.listBackups();
      assert.ok(Array.isArray(result));
    });
  });
});
