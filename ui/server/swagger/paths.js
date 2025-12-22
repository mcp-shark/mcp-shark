/**
 * Swagger/OpenAPI path definitions for MCP Shark API
 * Aggregates all endpoint documentation from individual files
 */

import { backupsPaths } from './paths/backups.js';
import { components } from './paths/components.js';
import { configPaths } from './paths/config.js';
import { conversationsPaths } from './paths/conversations.js';
import { helpPaths } from './paths/help.js';
import { logsPaths } from './paths/logs.js';
import { playgroundPaths } from './paths/playground.js';
import { requestsPaths } from './paths/requests.js';
import { serverManagementPaths } from './paths/serverManagement.js';
import { sessionsPaths } from './paths/sessions.js';
import { settingsPaths } from './paths/settings.js';
import { smartScanPaths } from './paths/smartScan/index.js';
import { statisticsPaths } from './paths/statistics.js';

/**
 * Combine all path definitions into a single object
 */
export const paths = {
  ...requestsPaths,
  ...sessionsPaths,
  ...conversationsPaths,
  ...statisticsPaths,
  ...logsPaths,
  ...configPaths,
  ...backupsPaths,
  ...serverManagementPaths,
  ...helpPaths,
  ...playgroundPaths,
  ...smartScanPaths,
  ...settingsPaths,
};

export { components };
