/**
 * CLI banner display with gradient text
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import gradient from 'gradient-string';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..', '..', '..');

/**
 * Get the package version from package.json
 */
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
 * Display the scan banner with gradient coloring
 */
export function displayScanBanner() {
  const version = getVersion();
  const sharkGradient = gradient(['#00d2ff', '#3a7bd5']);
  const dimGradient = gradient(['#6b7280', '#9ca3af']);

  const title = sharkGradient(`  🦈 MCP Shark v${version}`);
  const subtitle = '  Security Scanner for AI Agent Tools';
  const separator = dimGradient('  ───────────────────────────────────────');
  const footer = dimGradient('  100% Local · Zero Telemetry · Zero API Calls');

  console.log('');
  console.log(title);
  console.log(subtitle);
  console.log(separator);
  console.log(footer);
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
