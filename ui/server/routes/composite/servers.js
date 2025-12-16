import * as fs from 'node:fs';
import { getMcpConfigPath } from 'mcp-shark-common/configs/index.js';

export function getServers(_req, res) {
  try {
    const mcpsJsonPath = getMcpConfigPath();
    if (!fs.existsSync(mcpsJsonPath)) {
      return res.json({ servers: [] });
    }

    const configContent = fs.readFileSync(mcpsJsonPath, 'utf-8');
    const config = JSON.parse(configContent);
    const servers = config.servers ? Object.keys(config.servers) : [];
    res.json({ servers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get servers', details: error.message });
  }
}
