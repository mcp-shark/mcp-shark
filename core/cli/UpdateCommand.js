/**
 * Update Rules Command
 * Downloads latest rule packs from a remote registry and caches locally.
 *
 * Security: HTTPS-only URLs (unless MCP_SHARK_INSECURE_HTTP_REGISTRY=1), manual redirects
 * with re-validation, response size limits, safe pack filenames, optional SHA-256 in manifest.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import kleur from 'kleur';
import { resetStaticRulesCache } from '#core/services/security/StaticRulesService.js';
import { resolveRuleRegistryConfig } from './RuleRegistryConfig.js';
import {
  assertAllowedRegistryUrl,
  assertSafePackId,
  assertSha256,
  fetchJsonSecure,
  fetchUtf8Secure,
} from './secureRegistryFetch.js';
import { S } from './symbols.js';

const MANIFEST_MAX_BYTES = 2 * 1024 * 1024;
const PACK_MAX_BYTES = 25 * 1024 * 1024;

/**
 * Execute the update-rules command.
 * @param {object} options
 * @param {string} [options.source] - Custom manifest URL (CLI override)
 * @param {boolean} [options.quiet] - Minimal output (e.g. before scan)
 * @returns {Promise<number>} Exit code (0 success, 1 failure — for CI)
 */
export async function executeUpdateRules(options = {}) {
  const { registryUrl, cacheDir } = resolveRuleRegistryConfig({
    overrideUrl: options.source,
  });

  const quiet = Boolean(options.quiet);

  if (!quiet) {
    console.log('');
    console.log(`  ${kleur.bold('mcp-shark update-rules')}`);
    console.log(kleur.dim('  ─────────────────────────────────────'));
    console.log('');
    console.log(`  ${S.info} Registry: ${kleur.dim(registryUrl)}`);
    console.log('');
  }

  let manifest;
  try {
    manifest = await fetchJsonSecure(registryUrl, MANIFEST_MAX_BYTES);
  } catch (err) {
    const msg = `Failed to fetch manifest: ${err.message}`;
    if (quiet) {
      console.log(`  ${S.warn} ${msg} (using built-in / cached packs)`);
    } else {
      console.log(`  ${S.fail} ${msg}`);
      console.log(`  ${S.info} Rule packs are unchanged. Built-in packs still active.`);
      console.log('');
    }
    return 1;
  }

  if (!manifest.packs || !Array.isArray(manifest.packs)) {
    if (!quiet) {
      console.log(`  ${S.fail} Invalid manifest format (missing "packs" array)`);
      console.log('');
    }
    return 1;
  }

  ensureDir(cacheDir);

  let updated = 0;
  let skipped = 0;
  let hadPackFailure = false;

  for (const packRef of manifest.packs) {
    if (!packRef || typeof packRef.id !== 'string' || typeof packRef.url !== 'string') {
      if (!quiet) {
        console.log(`  ${S.warn} Skipping invalid pack entry`);
      }
      continue;
    }

    try {
      assertSafePackId(packRef.id);
      assertAllowedRegistryUrl(packRef.url);
    } catch (err) {
      if (!quiet) {
        console.log(`  ${S.warn} ${packRef.id}: ${err.message}`);
      }
      continue;
    }

    const localPath = join(cacheDir, `${packRef.id}.json`);
    const localVersion = readLocalVersion(localPath);

    if (localVersion && packRef.version && localVersion === packRef.version) {
      if (!quiet) {
        console.log(`  ${S.dot} ${packRef.id} v${packRef.version} ${kleur.dim('up to date')}`);
      }
      skipped++;
      continue;
    }

    try {
      const packText = await fetchUtf8Secure(packRef.url, PACK_MAX_BYTES);
      assertSha256(packRef.sha256, packText);
      const packData = JSON.parse(packText);
      const toxicExtra = Array.isArray(packData.toxic_flow_rules) ? packData.toxic_flow_rules : [];
      if (!packData.schema_version || !Array.isArray(packData.rules)) {
        if (!quiet) {
          console.log(`  ${S.warn} ${packRef.id}: invalid pack format, skipped`);
        }
        hadPackFailure = true;
        continue;
      }
      if (packData.rules.length === 0 && toxicExtra.length === 0) {
        if (!quiet) {
          console.log(`  ${S.warn} ${packRef.id}: empty rules and toxic_flow_rules, skipped`);
        }
        hadPackFailure = true;
        continue;
      }

      const packToWrite = { ...packData };
      if (packRef.version && packToWrite.version == null) {
        packToWrite.version = packRef.version;
      }

      writeFileSync(localPath, JSON.stringify(packToWrite, null, 2), 'utf-8');
      resetStaticRulesCache();
      const verb = localVersion ? 'updated' : 'downloaded';
      const ruleCount = packData.rules.length;
      const toxicCount = toxicExtra.length;
      if (!quiet) {
        const parts = [];
        if (ruleCount > 0) {
          parts.push(`${ruleCount} rules`);
        }
        if (toxicCount > 0) {
          parts.push(`${toxicCount} toxic-flow rule${toxicCount !== 1 ? 's' : ''}`);
        }
        console.log(
          `  ${S.pass} ${packRef.id} v${packRef.version} ${kleur.green(verb)} (${parts.join(', ')})`
        );
      }
      updated++;
    } catch (err) {
      if (!quiet) {
        console.log(`  ${S.fail} ${packRef.id}: ${err.message}`);
      }
      hadPackFailure = true;
    }
  }

  if (!quiet) {
    console.log('');
    if (updated > 0) {
      console.log(`  ${S.pass} ${updated} pack(s) updated, ${skipped} up to date`);
    } else {
      console.log(`  ${S.info} All ${skipped} pack(s) up to date`);
    }
    console.log(`  ${S.info} Cache: ${kleur.dim(cacheDir)}`);
    console.log('');
  }

  return hadPackFailure ? 1 : 0;
}

function readLocalVersion(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  try {
    const content = readFileSync(filePath, 'utf-8');
    const pack = JSON.parse(content);
    return pack.version || null;
  } catch (_err) {
    return null;
  }
}

function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}
