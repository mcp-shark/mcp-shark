import { fileURLToPath } from 'node:url';

export function getRepoRootDirectory() {
  return fileURLToPath(new URL('../../..', import.meta.url));
}
