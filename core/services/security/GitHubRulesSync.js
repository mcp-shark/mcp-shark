/**
 * GitHub Rules Sync Helper
 * Handles downloading and parsing YARA rules from GitHub repositories
 */
import { convertToSecurityRule, parseYaraFile } from './YaraRuleParser.js';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';

/**
 * Parse GitHub URL to extract owner and repo
 */
export function parseGitHubUrl(url) {
  const urlMatch = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!urlMatch) {
    return null;
  }
  return { owner: urlMatch[1], repo: urlMatch[2] };
}

/**
 * Fetch repository tree from GitHub API
 */
export async function fetchRepositoryTree(owner, repo, branch) {
  const treeUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const response = await fetch(treeUrl, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'MCPShark-Security-Scanner',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch repository tree: ${response.status}`);
  }

  return response.json();
}

/**
 * Filter tree for YARA files
 */
export function filterYaraFiles(tree, pathFilter = null) {
  return tree.filter((item) => {
    if (item.type !== 'blob') {
      return false;
    }
    if (!item.path.endsWith('.yar') && !item.path.endsWith('.yara')) {
      return false;
    }
    if (pathFilter && !item.path.includes(pathFilter)) {
      return false;
    }
    return true;
  });
}

/**
 * Download and parse a single YARA file
 */
export async function downloadAndParseYaraFile(
  owner,
  repo,
  branch,
  filePath,
  sourceName,
  sourceUrl,
  logger
) {
  try {
    const rawUrl = `${GITHUB_RAW_BASE}/${owner}/${repo}/${branch}/${filePath}`;
    const response = await fetch(rawUrl);

    if (!response.ok) {
      logger?.warn({ file: filePath }, 'Failed to download YARA file');
      return [];
    }

    const content = await response.text();
    const parsedRules = parseYaraFile(content);

    return parsedRules.map((parsed) => ({
      ...convertToSecurityRule(parsed, sourceName),
      content,
      source_url: sourceUrl,
      file_path: filePath,
    }));
  } catch (error) {
    logger?.warn({ file: filePath, error: error.message }, 'Error processing YARA file');
    return [];
  }
}

/**
 * Process YARA files in batches to avoid rate limiting
 */
export async function processYaraFilesInBatches(
  files,
  owner,
  repo,
  branch,
  sourceName,
  sourceUrl,
  logger
) {
  const rules = [];
  const batchSize = 10;

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);

    const batchPromises = batch.map((file) =>
      downloadAndParseYaraFile(owner, repo, branch, file.path, sourceName, sourceUrl, logger)
    );

    const batchResults = await Promise.all(batchPromises);
    for (const result of batchResults) {
      rules.push(...result);
    }

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < files.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return rules;
}

/**
 * Sync rules from a GitHub source
 */
export async function syncGitHubSource(source, logger) {
  const parsed = parseGitHubUrl(source.url);
  if (!parsed) {
    throw new Error('Invalid GitHub URL');
  }

  const { owner, repo } = parsed;
  const branch = source.branch || 'main';

  const treeData = await fetchRepositoryTree(owner, repo, branch);
  const yaraFiles = filterYaraFiles(treeData.tree, source.path_filter);

  logger?.debug({ source: source.name, fileCount: yaraFiles.length }, 'Found YARA files');

  return processYaraFilesInBatches(yaraFiles, owner, repo, branch, source.name, source.url, logger);
}

/**
 * Sync rules from a direct URL
 */
export async function syncUrlSource(source) {
  const response = await fetch(source.url);

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const content = await response.text();
  const parsedRules = parseYaraFile(content);

  return parsedRules.map((parsed) => ({
    ...convertToSecurityRule(parsed, source.name),
    content,
    source_url: source.url,
  }));
}
