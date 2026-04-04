const vscode = require('vscode');
const { execSync } = require('node:child_process');
const { existsSync, watch } = require('node:fs');
const path = require('node:path');

const SCAN_COMMAND = 'npx @mcp-shark/mcp-shark scan --format json --ci';
const STATUS_BAR_PRIORITY = 100;

let statusBarItem;
let outputChannel;
let fileWatcher;

function activate(context) {
  outputChannel = vscode.window.createOutputChannel('MCP Shark');

  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    STATUS_BAR_PRIORITY
  );
  statusBarItem.command = 'mcp-shark.scan';
  statusBarItem.tooltip = 'MCP Shark Security Score — Click to scan';
  context.subscriptions.push(statusBarItem);

  const scanCmd = vscode.commands.registerCommand('mcp-shark.scan', () => runScan());
  const fixCmd = vscode.commands.registerCommand('mcp-shark.fix', () => runFix());
  const listCmd = vscode.commands.registerCommand('mcp-shark.list', () => runList());

  context.subscriptions.push(scanCmd, fixCmd, listCmd);

  const config = vscode.workspace.getConfiguration('mcp-shark');

  if (config.get('showStatusBar')) {
    statusBarItem.show();
    updateStatusBar('$(shield) Shark: ...', 'Scanning...');
  }

  if (config.get('autoScan')) {
    runScan();
    setupFileWatcher(context);
  }
}

function runScan() {
  try {
    outputChannel.clear();
    outputChannel.appendLine('[MCP Shark] Running security scan...');

    const result = execSync(SCAN_COMMAND, {
      encoding: 'utf-8',
      timeout: 30000,
      cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.env.HOME,
    });

    const data = JSON.parse(result);
    const score = data.score?.score ?? 0;
    const grade = data.score?.grade ?? '?';
    const findingCount = data.findings?.length ?? 0;
    const critical = data.summary?.severityCounts?.critical ?? 0;

    const icon = score >= 80 ? '$(pass)' : score >= 50 ? '$(warning)' : '$(error)';
    updateStatusBar(`${icon} Shark: ${score} (${grade})`, `${findingCount} findings`);

    if (critical > 0) {
      const bgColor = new vscode.ThemeColor('statusBarItem.errorBackground');
      statusBarItem.backgroundColor = bgColor;
    } else {
      statusBarItem.backgroundColor = undefined;
    }

    outputChannel.appendLine(`[MCP Shark] Score: ${score}/100 (${grade})`);
    outputChannel.appendLine(`[MCP Shark] ${findingCount} findings`);

    for (const finding of data.findings || []) {
      outputChannel.appendLine(`  [${finding.severity?.toUpperCase()}] ${finding.title}`);
    }
  } catch (err) {
    outputChannel.appendLine(`[MCP Shark] Scan error: ${err.message}`);
    updateStatusBar('$(shield) Shark: ?', 'Scan failed — click to retry');
  }
}

function runFix() {
  const terminal = vscode.window.createTerminal('MCP Shark Fix');
  terminal.show();
  terminal.sendText('npx @mcp-shark/mcp-shark scan --fix');
}

function runList() {
  const terminal = vscode.window.createTerminal('MCP Shark');
  terminal.show();
  terminal.sendText('npx @mcp-shark/mcp-shark list');
}

function updateStatusBar(text, tooltip) {
  if (statusBarItem) {
    statusBarItem.text = text;
    statusBarItem.tooltip = tooltip;
  }
}

function setupFileWatcher(context) {
  const configPaths = [
    path.join(process.env.HOME || '', '.cursor', 'mcp.json'),
    path.join(process.env.HOME || '', '.vscode', 'mcp.json'),
  ];

  for (const configPath of configPaths) {
    if (!existsSync(configPath)) {
      continue;
    }

    const watcher = watch(configPath, () => {
      outputChannel.appendLine('[MCP Shark] Config change detected, re-scanning...');
      runScan();
    });

    context.subscriptions.push({ dispose: () => watcher.close() });
  }
}

function deactivate() {
  if (fileWatcher) {
    fileWatcher.close();
  }
}

module.exports = { activate, deactivate };
