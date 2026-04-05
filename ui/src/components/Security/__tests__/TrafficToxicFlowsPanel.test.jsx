import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TrafficToxicFlowsPanel from '../TrafficToxicFlowsPanel.jsx';

describe('TrafficToxicFlowsPanel', () => {
  it('renders title and calls onRefresh when Refresh is clicked', () => {
    const onRefresh = vi.fn();
    const onReplay = vi.fn();
    render(
      <TrafficToxicFlowsPanel
        snapshot={{
          success: true,
          toxicFlows: [],
          servers: [],
          note: 'Heuristic note',
        }}
        loading={false}
        error={null}
        onRefresh={onRefresh}
        onReplay={onReplay}
      />
    );

    expect(screen.getByText('Toxic flows (proxy traffic)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Refresh/i }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('calls onReplay when Replay from DB is clicked', () => {
    const onRefresh = vi.fn();
    const onReplay = vi.fn();
    render(
      <TrafficToxicFlowsPanel
        snapshot={{ success: true, toxicFlows: [], servers: [], note: '' }}
        loading={false}
        error={null}
        onRefresh={onRefresh}
        onReplay={onReplay}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Replay from DB/i }));
    expect(onReplay).toHaveBeenCalledTimes(1);
  });

  it('lists toxic flow titles from snapshot', () => {
    render(
      <TrafficToxicFlowsPanel
        snapshot={{
          success: true,
          toxicFlows: [
            {
              risk: 'HIGH',
              title: 'Test flow title',
              source: 'a',
              target: 'b',
              scenario: 'Cross-server scenario text',
            },
          ],
          servers: [{ name: 'a', toolCount: 2, updatedAt: 1 }],
          note: '',
        }}
        loading={false}
        error={null}
        onRefresh={vi.fn()}
        onReplay={vi.fn()}
      />
    );

    expect(screen.getByText('Test flow title')).toBeInTheDocument();
    expect(screen.getByText(/Cross-server scenario text/)).toBeInTheDocument();
  });
});
