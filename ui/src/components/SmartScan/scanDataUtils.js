/**
 * Utility functions for normalizing scan data from various API response formats
 */

export function getScanValue(scan, path) {
  const paths = path.split('.');
  return paths.reduce((value, p) => {
    if (value && typeof value === 'object' && p in value) {
      return value[p];
    }
    return null;
  }, scan);
}

export function normalizeScanData(scan) {
  const actualScan = scan.result || scan.data || scan;

  const scanId =
    getScanValue(scan, 'result.id') ||
    getScanValue(scan, 'id') ||
    getScanValue(scan, 'scan_id') ||
    getScanValue(scan, 'data.id') ||
    getScanValue(scan, 'data.scan_id') ||
    actualScan?.id ||
    actualScan?.scan_id;

  const serverName =
    scan.serverName || // Check top-level first (for cached scans)
    scan.server_name ||
    getScanValue(scan, 'result.mcp_server_data.server.name') ||
    getScanValue(scan, 'mcp_server_data.server.name') ||
    getScanValue(scan, 'server.name') ||
    getScanValue(scan, 'data.server.name') ||
    getScanValue(scan, 'data.data.server.name') ||
    scan.server?.name || // Check nested server object
    'Unknown Server';

  const status =
    getScanValue(scan, 'result.status') ||
    getScanValue(scan, 'status') ||
    getScanValue(scan, 'data.status');

  const overallRiskLevel =
    getScanValue(scan, 'result.overall_risk_level') ||
    getScanValue(scan, 'overall_risk_level') ||
    getScanValue(scan, 'data.overall_risk_level') ||
    getScanValue(scan, 'data.data.overall_risk_level');

  const createdAt =
    getScanValue(scan, 'result.created_at') ||
    getScanValue(scan, 'created_at') ||
    getScanValue(scan, 'data.created_at') ||
    getScanValue(scan, 'data.data.created_at');

  const updatedAt =
    getScanValue(scan, 'result.updated_at') ||
    getScanValue(scan, 'updated_at') ||
    getScanValue(scan, 'data.updated_at') ||
    getScanValue(scan, 'data.data.updated_at');

  const baseAnalysisResult =
    getScanValue(scan, 'result.analysis_result') ||
    getScanValue(scan, 'analysis_result') ||
    getScanValue(scan, 'data.analysis_result') ||
    getScanValue(scan, 'data.data.analysis_result') ||
    getScanValue(scan, 'data.data.data.analysis_result');

  const extractAnalysisResult = (base, actual) => {
    if (base) {
      return base;
    }
    if (actual && typeof actual === 'object') {
      if (actual.tool_findings || actual.prompt_findings || actual.resource_findings) {
        return actual;
      }
      if (actual.analysis_result) {
        return actual.analysis_result;
      }
    }
    return null;
  };

  const analysisResult = extractAnalysisResult(baseAnalysisResult, actualScan);

  const serverData =
    getScanValue(scan, 'result.mcp_server_data.server') ||
    getScanValue(scan, 'mcp_server_data.server') ||
    getScanValue(scan, 'server') ||
    getScanValue(scan, 'data.server') ||
    getScanValue(scan, 'data.data.server') ||
    getScanValue(scan, 'mcp_server_data');

  return {
    scanId,
    serverName,
    status,
    overallRiskLevel,
    createdAt,
    updatedAt,
    analysisResult,
    serverData,
  };
}
