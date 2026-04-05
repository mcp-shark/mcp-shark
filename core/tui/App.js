import { Box, Text, useApp, useInput } from 'ink';
/**
 * MCP Shark Interactive TUI — Main App Component
 * Lazygit-style full-screen terminal interface
 */
import { useEffect, useState } from 'react';
import { runScan } from '#core/cli/ScanService.js';
import { FindingsPanel } from './FindingsPanel.js';
import { FixPanel } from './FixPanel.js';
import { Header } from './Header.js';
import { HelpBar } from './HelpBar.js';
import { ServersPanel } from './ServersPanel.js';
import { ToxicFlowsPanel } from './ToxicFlowsPanel.js';
import { h } from './h.js';

const PANELS = ['findings', 'servers', 'flows', 'fix'];
const PANEL_LABELS = {
  findings: 'Findings',
  servers: 'Servers',
  flows: 'Toxic Flows',
  fix: 'Auto-Fix',
};

export function App() {
  const { exit } = useApp();
  const [scanResult, setScanResult] = useState(null);
  const [activePanel, setActivePanel] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const result = runScan({});
    setScanResult(result);
  }, []);

  const rescan = () => {
    setScanResult(null);
    const result = runScan({});
    setScanResult(result);
    setSelectedIndex(0);
  };

  useInput((input, key) => {
    if (input === 'q' || (key.ctrl && input === 'c')) {
      exit();
      return;
    }

    if (key.tab || input === 'l') {
      setActivePanel((prev) => (prev + 1) % PANELS.length);
      setSelectedIndex(0);
      return;
    }

    if (input === '1') {
      setActivePanel(0);
      setSelectedIndex(0);
    }
    if (input === '2') {
      setActivePanel(1);
      setSelectedIndex(0);
    }
    if (input === '3') {
      setActivePanel(2);
      setSelectedIndex(0);
    }
    if (input === '4') {
      setActivePanel(3);
      setSelectedIndex(0);
    }

    if (input === 'r') {
      rescan();
      return;
    }

    if (key.downArrow || input === 'j') {
      setSelectedIndex((prev) => prev + 1);
    }
    if (key.upArrow || input === 'k') {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    }
  });

  if (!scanResult) {
    return h(
      Box,
      { flexDirection: 'column', padding: 1 },
      h(Header, { score: null, grade: null }),
      h(Box, { justifyContent: 'center', padding: 2 }, h(Text, { color: 'cyan' }, 'Scanning...'))
    );
  }

  const panelName = PANELS[activePanel];

  const tabs = PANELS.map((panel, idx) =>
    h(
      Box,
      { key: panel, marginRight: 1 },
      h(
        Text,
        {
          bold: idx === activePanel,
          color: idx === activePanel ? 'cyan' : 'gray',
          inverse: idx === activePanel,
        },
        ` ${idx + 1}:${PANEL_LABELS[panel]} `
      )
    )
  );

  const panelProps = { selectedIndex };
  let activeContent = null;

  if (panelName === 'findings') {
    activeContent = h(FindingsPanel, { findings: scanResult.findings, ...panelProps });
  } else if (panelName === 'servers') {
    activeContent = h(ServersPanel, {
      servers: scanResult.servers,
      findings: scanResult.findings,
      ...panelProps,
    });
  } else if (panelName === 'flows') {
    activeContent = h(ToxicFlowsPanel, { toxicFlows: scanResult.toxicFlows, ...panelProps });
  } else if (panelName === 'fix') {
    activeContent = h(FixPanel, { findings: scanResult.findings, onRescan: rescan });
  }

  return h(
    Box,
    { flexDirection: 'column', padding: 0 },
    h(Header, {
      score: scanResult.scoreResult.score,
      grade: scanResult.scoreResult.grade,
      serverCount: scanResult.serverCount,
      findingCount: scanResult.findings.length,
      flowCount: scanResult.toxicFlows.length,
      ruleCount: scanResult.ruleCount,
      elapsedMs: scanResult.elapsedMs,
    }),
    h(Box, { paddingX: 1 }, ...tabs),
    h(Box, { flexDirection: 'column', paddingX: 1, flexGrow: 1 }, activeContent),
    h(HelpBar, { activePanel: panelName })
  );
}
