/**
 * Update Rules Command
 * Downloads latest rule packs from a remote registry and caches locally.
 *
 * Usage:
 *   npx mcp-shark update-rules                     (default registry)
 *   npx mcp-shark update-rules --source <url>       (custom registry)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import kleur from 'kleur';
import { loadBuiltinJson } from './DataLoader.js';
import { S } from './symbols.js';

const DEFAULT_SOURCES = loadBuiltinJson('rule-sources.json');

/**
 * Execute the update-rules command.
 * @param {object} options
 * @param {string} [options.source] - Custom manifest URL
 */
export async function executeUpdateRules(options = {}) {
  const manifestUrl = options.source || DEFAULT_SOURCES.registry_url;
  const cacheDir = join(process.cwd(), DEFAULT_SOURCES.cache_dir);

  console.log('');
  console.log(`  ${kleur.bold('mcp-shark update-rules')}`);
  console.log(kleur.dim('  ─────────────────────────────────────'));
  console.log('');
  console.log(`  ${S.info} Registry: ${kleur.dim(manifestUrl)}`);
  console.log('');

  let manifest;
  try {
    manifest = await fetchJson(manifestUrl);
  } catch (err) {
    console.log(`  ${S.fail} Failed to fetch manifest: ${err.message}`);
    console.log(`  ${S.info} Rule packs are unchanged. Built-in packs still active.`);
    console.log('');
    return;
  }

  if (!manifest.packs || !Array.isArray(manifest.packs)) {
    console.log(`  ${S.fail} Invalid manifest format (missing "packs" array)`);
    console.log('');
    return;
  }

  ensureDir(cacheDir);

  let updated = 0;
  let skipped = 0;

  for (const packRef of manifest.packs) {
    const localPath = join(cacheDir, `${packRef.id}.json`);
    const localVersion = readLocalVersion(localPath);

    if (localVersion && localVersion === packRef.version) {
      console.log(`  ${S.dot} ${packRef.id} v${packRef.version} ${kleur.dim('up to date')}`);
      skipped++;
      continue;
    }

    try {
      const packData = await fetchJson(packRef.url);
      if (!packData.schema_version || !packData.rules) {
        console.log(`  ${S.warn} ${packRef.id}: invalid pack format, skipped`);
        continue;
      }

      writeFileSync(localPath, JSON.stringify(packData, null, 2), 'utf-8');
      const verb = localVersion ? 'updated' : 'downloaded';
      const ruleCount = packData.rules.length;
      console.log(
        `  ${S.pass} ${packRef.id} v${packRef.version} ${kleur.green(verb)} (${ruleCount} rules)`
      );
      updated++;
    } catch (err) {
      console.log(`  ${S.fail} ${packRef.id}: ${err.message}`);
    }
  }

  console.log('');
  if (updated > 0) {
    console.log(`  ${S.pass} ${updated} pack(s) updated, ${skipped} up to date`);
  } else {
    console.log(`  ${S.info} All ${skipped} pack(s) up to date`);
  }
  console.log(`  ${S.info} Cache: ${kleur.dim(cacheDir)}`);
  console.log('');
}

/**
 * Fetch JSON from a URL using built-in fetch (Node 18+).
 */
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Read the version field from a cached pack file.
 */
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

/**
 * Ensure a directory exists.
 */
function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}
