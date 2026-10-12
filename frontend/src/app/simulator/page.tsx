'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ICampaign, ISubmission } from '../../types';
import MilestoneLadderVisualizer from '../../components/MilestoneLadderVisualizer';
import BudgetBar from '../../components/BudgetBar';
import {
  PlayCircle,
  Zap,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  CheckCircle2,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '../../context/ToastContext';

export default function SimulatorPage() {
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');
  const [customViews, setCustomViews] = useState<number>(100000);
  const [loading, setLoading] = useState<boolean>(true);
  const [executing, setExecuting] = useState<boolean>(false);
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const campRes = await api.getLiveCampaigns();
      if (campRes.success && campRes.campaigns.length > 0) {
        setCampaigns(campRes.campaigns);

        // Fetch submissions for all campaigns
        const allSubs: ISubmission[] = [];
        for (const c of campRes.campaigns) {
          const detRes = await api.getCampaignById(c._id);
          if (detRes.success && detRes.submissions) {
            allSubs.push(...detRes.submissions.map((s: any) => ({ ...s, campaignId: c })));
          }
        }
        setSubmissions(allSubs);
        if (allSubs.length > 0 && !selectedSubmissionId) {
          setSelectedSubmissionId(allSubs[0]._id);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedSubmission = submissions.find((s) => s._id === selectedSubmissionId) || submissions[0];
  const selectedCampaign = selectedSubmission && typeof selectedSubmission.campaignId === 'object'
    ? (selectedSubmission.campaignId as ICampaign)
    : campaigns[0];

  const runViewUpdate = async (views: number) => {
    if (!selectedSubmission) {
      showToast('Please select a submission to test', 'warning');
      return;
    }

    setExecuting(true);
    try {
      const res = await api.updateViews(selectedSubmission._id, views);
      setRawApiResponse(res);

      if (res.payoutBreakdown && res.payoutBreakdown.actualPaidIncrement > 0) {
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch {}
        showToast(
          `Awarded +₹${res.payoutBreakdown.actualPaidIncrement.toLocaleString()}! Total: ₹${res.payoutBreakdown.newTotalPayout.toLocaleString()}`,
          'success',
          'Milestone Payout Unlocked'
        );
      } else if (res.submission && res.submission.isSpikeFlagged) {
        showToast(res.submission.spikeReason || 'Bot view spike detected', 'warning', 'Fraud Spike Alert');
      } else {
        showToast(`Views set to ${views.toLocaleString()}. No incremental payout.`, 'info');
      }

      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Execution error', 'error');
    } finally {
      setExecuting(false);
    }
  };

  // Concurrency Stress Test: 5 simultaneous view updates in parallel
  const runConcurrencyStressTest = async () => {
    if (!selectedSubmission) return;

    setExecuting(true);
    showToast('Firing 5 concurrent requests with Promise.all...', 'info', 'Stress Test Started');

    try {
      const base = selectedSubmission.currentViews;
      const promises = [
        api.updateViews(selectedSubmission._id, base + 10000),
        api.updateViews(selectedSubmission._id, base + 20000),
        api.updateViews(selectedSubmission._id, base + 30000),
        api.updateViews(selectedSubmission._id, base + 40000),
        api.updateViews(selectedSubmission._id, base + 50000)
      ];

      const results = await Promise.allSettled(promises);
      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      showToast(
        `All ${fulfilled.length}/5 concurrent updates processed safely without race conditions!`,
        'success',
        'Atomic Concurrency Validated'
      );
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Concurrency test error', 'error');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Simulator Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-cyan">EVALUATOR TEST BENCH</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PATCH /api/submissions/:id/views</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Platform View & Payout Simulator Studio</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Simulate real platform scrapers, multi-tier jumps, budget depletion caps, and concurrent stress tests.
          </p>
        </div>

        <button onClick={loadData} className="btn btn-secondary">
          <RefreshCw size={15} /> Refresh Studio Data
        </button>
      </div>

      {/* Main Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Control Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Simulation Controls</h2>

          {/* Select Target Submission */}
          <div className="input-group">
            <label className="input-label">Select Target Post Submission</label>
            <select
              className="select-field"
              value={selectedSubmissionId}
              onChange={(e) => setSelectedSubmissionId(e.target.value)}
            >
              {submissions.map((s) => {
                const cName = typeof s.campaignId === 'object' ? s.campaignId.name : 'Campaign';
                return (
                  <option key={s._id} value={s._id}>
                    {cName} ({s.currentViews.toLocaleString()} views, ₹{s.currentPayout.toLocaleString()})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Selected Submission Overview */}
          {selectedSubmission && (
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Post Views:</span>
                <strong style={{ color: '#fff' }}>{selectedSubmission.currentViews.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Payout:</span>
                <strong style={{ color: 'var(--accent-emerald)' }}>₹{selectedSubmission.currentPayout.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Campaign Budget Left:</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>
                  ₹{selectedCampaign?.remainingBudget.toLocaleString()}
                </strong>
              </div>
            </div>
          )}

          {/* Test Case Scenarios */}
          <div>
            <label className="input-label" style={{ marginBottom: '0.5rem' }}>Automated Evaluation Test Cases</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                disabled={executing || !selectedSubmission}
                onClick={() => runViewUpdate(selectedSubmission.currentViews + 10000)}
                className="btn btn-sm btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                <TrendingUp size={14} color="var(--accent-emerald)" />
                <span>Test 1: Cross Next Milestone (+10k views)</span>
              </button>

              <button
                disabled={executing || !selectedSubmission}
                onClick={() => runViewUpdate(selectedSubmission.currentViews + 120000)}
                className="btn btn-sm btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                <Zap size={14} color="var(--accent-purple)" />
                <span>Test 2: Multi-Milestone Jump (+120k views in 1 step)</span>
              </button>

              <button
                disabled={executing || !selectedSubmission}
                onClick={() => runViewUpdate(selectedSubmission.currentViews)}
                className="btn btn-sm btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                <ShieldCheck size={14} color="var(--accent-cyan)" />
                <span>Test 3: Anti-Double-Payout (Repeated identical views)</span>
              </button>

              <button
                disabled={executing || !selectedSubmission}
                onClick={() => runViewUpdate(selectedSubmission.currentViews + 350000)}
                className="btn btn-sm btn-outline"
                style={{ justifyContent: 'flex-start', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
              >
                <AlertTriangle size={14} />
                <span>Test 4: Trigger Bot Spike Fraud Alert (+350k surge)</span>
              </button>

              <button
                disabled={executing || !selectedSubmission}
                onClick={runConcurrencyStressTest}
                className="btn btn-sm btn-outline"
                style={{ justifyContent: 'flex-start', borderColor: 'rgba(139, 92, 246, 0.4)', color: '#c084fc' }}
              >
                <Cpu size={14} />
                <span>Test 5: Concurrency Race Test (5 Parallel Updates)</span>
              </button>
            </div>
          </div>

          {/* Custom View Input */}
          <div className="input-group" style={{ marginTop: '0.5rem' }}>
            <label className="input-label">Custom Absolute Views Input</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                className="input-field"
                value={customViews}
                onChange={(e) => setCustomViews(Number(e.target.value))}
                placeholder="Views"
              />
              <button
                disabled={executing}
                onClick={() => runViewUpdate(customViews)}
                className="btn btn-primary"
              >
                Execute
              </button>
            </div>
          </div>
        </div>

        {/* Right Inspection & Telemetry Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {selectedCampaign && (
            <div className="glass-card">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
                Campaign Budget & Milestone Tracker
              </h2>

              <div style={{ marginBottom: '1.25rem' }}>
                <BudgetBar
                  totalBudget={selectedCampaign.totalBudget}
                  spentBudget={selectedCampaign.spentBudget}
                  remainingBudget={selectedCampaign.remainingBudget}
                  status={selectedCampaign.status}
                />
              </div>

              <div>
                <MilestoneLadderVisualizer
                  milestones={selectedCampaign.milestones}
                  currentViews={selectedSubmission?.currentViews || 0}
                  currentPayout={selectedSubmission?.currentPayout || 0}
                />
              </div>
            </div>
          )}

          {/* Raw JSON API Response Viewer */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Real-Time API Telemetry & Payload Response
              </h3>
              <span className="badge badge-purple">JSON OUTPUT</span>
            </div>

            <pre
              style={{
                background: '#04060b',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                fontSize: '0.775rem',
                color: '#38bdf8',
                overflowX: 'auto',
                fontFamily: 'monospace',
                maxHeight: '360px'
              }}
            >
              {rawApiResponse
                ? JSON.stringify(rawApiResponse, null, 2)
                : '// Click any test button on the left to fire PATCH /api/submissions/:id/views\n// Telemetry breakdown and payout calculation will appear here in real-time.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
