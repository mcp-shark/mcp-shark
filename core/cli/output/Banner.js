/**
 * CLI banner — clean, text-only
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import kleur from 'kleur';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..', '..', '..');

function getVersion() {
  try {
    const pkgPath = join(rootDir, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return pkg.version;
  } catch (_err) {
    return 'unknown';
  }
}

/**
 * Display the scan banner — minimal, Biome-style
 */
export function displayScanBanner() {
  const version = getVersion();

  console.log('');
  console.log(`  ${kleur.bold('mcp-shark')} ${kleur.dim(`v${version}`)}`);
  console.log(kleur.dim('  ─────────────────────────────────────'));
  console.log('');
}

/**
 * Display the serve banner (existing ASCII art style)
 */
export function displayServeBanner() {
  const version = getVersion();
  const banner = `
   ███╗   ███╗ ██████╗ ██████╗      ███████╗██╗  ██╗ █████╗ ██████╗ ██╗  ██╗
   ████╗ ████║██╔════╝██╔══██╗     ██╔════╝██║  ██║██╔══██╗██╔══██╗██║ ██╔╝
   ██╔████╔██║██║     ██████╔╝     ███████╗███████║███████║██████╔╝█████╔╝ 
   ██║╚██╔╝██║██║     ██╔═══╝      ╚════██║██╔══██║██╔══██║██╔══██╗██╔═██╗ 
   ██║ ╚═╝ ██║╚██████╗██║          ███████║██║  ██║██║  ██║██║  ██║██║  ██╗
   ╚═╝     ╚═╝ ╚═════╝╚═╝          ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
   
   Aggregate multiple MCP servers into a unified interface
   Version: ${version} | Homepage: https://mcpshark.sh
`;
  console.log(banner);
}
