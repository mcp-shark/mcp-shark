import assert from 'node:assert';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { isRuleCacheStale, resolveRuleRegistryConfig } from '../RuleRegistryConfig.js';

function isolatedCwd(fn) {
  const tmpHome = mkdtempSync(join(tmpdir(), 'mcp-shark-xdg-'));
  const tmpProj = mkdtempSync(join(tmpdir(), 'mcp-shark-proj-'));
  const prevXdg = process.env.XDG_CONFIG_HOME;
  const prevCwd = process.cwd();
  process.env.XDG_CONFIG_HOME = join(tmpHome, 'config');
  mkdirSync(process.env.XDG_CONFIG_HOME, { recursive: true });
  process.chdir(tmpProj);
  try {
    return fn();
  } finally {
    process.chdir(prevCwd);
    if (prevXdg === undefined) {
      process.env.XDG_CONFIG_HOME = undefined;
    } else {
      process.env.XDG_CONFIG_HOME = prevXdg;
    }
    rmSync(tmpHome, { recursive: true, force: true });
    rmSync(tmpProj, { recursive: true, force: true });
  }
}

describe('RuleRegistryConfig', () => {
  describe('resolveRuleRegistryConfig', () => {
    it('CLI override wins over environment', () => {
      isolatedCwd(() => {
        process.env.MCP_SHARK_RULE_REGISTRY = 'https://env.example/manifest.json';
        const c = resolveRuleRegistryConfig({
          overrideUrl: 'https://cli.example/manifest.json',
        });
        assert.strictEqual(c.registryUrl, 'https://cli.example/manifest.json');
        process.env.MCP_SHARK_RULE_REGISTRY = undefined;
      });
    });

    it('environment wins over built-in default', () => {
      isolatedCwd(() => {
        process.env.MCP_SHARK_RULE_REGISTRY = 'https://corp.example/rules/manifest.json';
        const c = resolveRuleRegistryConfig({});
        assert.strictEqual(c.registryUrl, 'https://corp.example/rules/manifest.json');
        process.env.MCP_SHARK_RULE_REGISTRY = undefined;
      });
    });

    it('autoUpdate is false when no registry files', () => {
      isolatedCwd(() => {
        const c = resolveRuleRegistryConfig({});
        assert.strictEqual(c.autoUpdate, false);
      });
    });

    it('rejects cache_dir with path traversal', () => {
      const dir = mkdtempSync(join(tmpdir(), 'mcp-shark-rc-'));
      const prev = process.cwd();
      process.chdir(dir);
      try {
        mkdirSync('.mcp-shark', { recursive: true });
        writeFileSync(
          join('.mcp-shark', 'rule-registry.json'),
          JSON.stringify({ cache_dir: '../escaped' })
        );
        assert.throws(() => resolveRuleRegistryConfig({}), /\.\./);
      } finally {
        process.chdir(prev);
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe('isRuleCacheStale', () => {
    let dir;
    const setup = () => {
      dir = mkdtempSync(join(tmpdir(), 'mcp-shark-stale-'));
    };
    const teardown = () => {
      rmSync(dir, { recursive: true, force: true });
    };

    it('true when directory missing', () => {
      setup();
      try {
        assert.strictEqual(isRuleCacheStale(join(dir, 'nope'), 24), true);
      } finally {
        teardown();
      }
    });

    it('true when no json packs', () => {
      setup();
      try {
        assert.strictEqual(isRuleCacheStale(dir, 24), true);
      } finally {
        teardown();
      }
    });

    it('false when pack file is fresh', () => {
      setup();
      try {
        writeFileSync(join(dir, 'pack.json'), '{}');
        assert.strictEqual(isRuleCacheStale(dir, 24 * 365), false);
      } finally {
        teardown();
      }
    });
  });
});
