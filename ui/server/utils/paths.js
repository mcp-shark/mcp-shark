import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function findMcpServerPath() {
  const pathsToCheck = [
    path.join(process.cwd(), '../mcp-server'),
    path.join(__dirname, '../../mcp-server'),
    path.join(process.cwd(), 'mcp-server'),
    path.join(__dirname, '../../mcp-server'),
  ];

  for (const possiblePath of pathsToCheck) {
    if (fs.existsSync(possiblePath)) {
      return possiblePath;
    }
  }

  return path.join(process.cwd(), '../mcp-server');
}
