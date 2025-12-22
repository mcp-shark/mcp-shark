import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function getNodeLlamaCppPackageJsonPath() {
  return fileURLToPath(
    new URL('../../../../node_modules/node-llama-cpp/package.json', import.meta.url)
  );
}

export function isNodeLlamaCppInstalled() {
  try {
    return existsSync(getNodeLlamaCppPackageJsonPath());
  } catch (_error) {
    return false;
  }
}
