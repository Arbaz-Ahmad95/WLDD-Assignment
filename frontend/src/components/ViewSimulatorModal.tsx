'use client';

import React, { useState } from 'react';
import { X, Play, TrendingUp, AlertTriangle, Zap, CheckCircle2, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ISubmission, ICampaign } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

interface ViewSimulatorModalProps {
  submission: ISubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ViewSimulatorModal({
  submission,
  isOpen,
  onClose,
  onSuccess
}: ViewSimulatorModalProps) {
  const [targetViews, setTargetViews] = useState<number>(submission ? submission.currentViews + 10000 : 10000);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const { showToast } = useToast();

  if (!isOpen || !submission) return null;

  const campaign = typeof submission.campaignId === 'object' ? (submission.campaignId as ICampaign) : null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handleUpdate = async (viewsToSend: number) => {
    setIsUpdating(true);
    setLastResult(null);

    try {
      const res = await api.updateViews(submission._id, viewsToSend);
      if (res.success) {
        setLastResult(res);

        if (res.payoutBreakdown && res.payoutBreakdown.actualPaidIncrement > 0) {
          triggerConfetti();
          showToast(
            `Earned +₹${res.payoutBreakdown.actualPaidIncrement.toLocaleString()}! New total payout: ₹${res.payoutBreakdown.newTotalPayout.toLocaleString()}`,
            'success',
            'Milestone Unlocked!'
          );
        } else if (res.submission && res.submission.isSpikeFlagged) {
          showToast(
            res.submission.spikeReason || 'Unusual view surge detected!',
            'warning',
            'Fraud Spike Alert'
          );
        } else {
          showToast(
            `Views updated to ${viewsToSend.toLocaleString()}. No new milestone crossed.`,
            'info'
          );
        }

        onSuccess();
      }
    } catch (err: any) {
      showToast(err.message || 'View simulation failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Zap size={20} color="var(--accent-cyan)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Platform View Simulator</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Simulates real-time YouTube / Instagram view webhook updates (PATCH /api/submissions/:id/views)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-outline"
            style={{ borderRadius: '50%', padding: '0.4rem', border: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Current State Summary */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem'
          }}
        >
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Views</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
              {submission.currentViews.toLocaleString()}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Payout</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              ₹{submission.currentPayout.toLocaleString()}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Campaign Budget Left</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              ₹{campaign ? campaign.remainingBudget.toLocaleString() : 'N/A'}
            </div>
          </div>
        </div>

        {/* Quick Simulation Buttons */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="input-label" style={{ marginBottom: '0.5rem' }}>Quick View Jump Presets</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            <button
              disabled={isUpdating}
              onClick={() => handleUpdate(submission.currentViews + 10000)}
              className="btn btn-sm btn-secondary"
            >
              <TrendingUp size={14} color="var(--accent-purple)" /> +10,000 Views (Cross Tier 1)
            </button>
            <button
              disabled={isUpdating}
              onClick={() => handleUpdate(submission.currentViews + 50000)}
              className="btn btn-sm btn-secondary"
            >
              <TrendingUp size={14} color="var(--accent-emerald)" /> +50,000 Views (Tier Jump)
            </button>
            <button
              disabled={isUpdating}
              onClick={() => handleUpdate(submission.currentViews + 150000)}
              className="btn btn-sm btn-secondary"
            >
              <TrendingUp size={14} color="var(--accent-cyan)" /> +150,000 Views (Viral Wave)
            </button>
            <button
              disabled={isUpdating}
              onClick={() => handleUpdate(submission.currentViews + 350000)}
              className="btn btn-sm btn-outline"
              style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
              title="Simulates rapid massive spike to trigger anomaly detection"
            >
              <AlertTriangle size={14} /> Simulate Spike Surge ⚡
            </button>
          </div>
        </div>

        {/* Custom View Input */}
        <div className="input-group">
          <label className="input-label">Set Exact Views</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="number"
              className="input-field"
              value={targetViews}
              onChange={(e) => setTargetViews(Number(e.target.value))}
              placeholder="e.g. 100000"
            />
            <button
              disabled={isUpdating}
              onClick={() => handleUpdate(targetViews)}
              className="btn btn-primary"
            >
              <Play size={16} /> {isUpdating ? 'Updating...' : 'Apply'}
            </button>
          </div>
        </div>

        {/* Live Calculation Feedback Card */}
        {lastResult && lastResult.payoutBreakdown && (
          <div
            style={{
              marginTop: '1.25rem',
              background: 'rgba(16, 24, 48, 0.85)',
              border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              animation: 'modalIn 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-highlight)' }}>
                SIMULATION RESULT & BREAKDOWN
              </span>
              {lastResult.payoutBreakdown.isBudgetCapped && (
                <span className="badge badge-rose">
                  <AlertTriangle size={10} /> BUDGET CAP REACHED
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Owed Differential Increment:</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>
                  ₹{lastResult.payoutBreakdown.owedIncrement.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Actual Paid (Budget Capped):</span>
                <span style={{ fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  +₹{lastResult.payoutBreakdown.actualPaidIncrement.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>New Total Post Earnings:</span>
                <span style={{ fontWeight: 800, color: '#fff' }}>
                  ₹{lastResult.payoutBreakdown.newTotalPayout.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Campaign Budget Left:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  ₹{lastResult.payoutBreakdown.remainingCampaignBudget.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
