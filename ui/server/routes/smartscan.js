/**
 * Smart Scan API proxy routes
 * Proxies requests to the Smart Scan API to avoid CORS issues
 */

import * as discoverRoutes from './smartscan/discover.js';
import * as scanRoutes from './smartscan/scans.js';
import * as tokenRoutes from './smartscan/token.js';

export function createSmartScanRoutes() {
  const router = {};

  router.getToken = tokenRoutes.getToken;
  router.saveToken = tokenRoutes.saveToken;
  router.discoverServers = discoverRoutes.discoverServers;
  router.getCachedResults = scanRoutes.getCachedResults;
  router.createScan = scanRoutes.createScan;
  router.getScan = scanRoutes.getScan;
  router.listScans = scanRoutes.listScans;
  router.createBatchScans = scanRoutes.createBatchScans;
  router.clearCache = scanRoutes.clearCache;

  return router;
}
