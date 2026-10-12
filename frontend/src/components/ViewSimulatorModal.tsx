'use client';

import React, { useState } from 'react';
import { X, Play, TrendingUp, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'var(--brand-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Zap size={18} color="var(--brand-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Platform View Simulator</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Simulates real-time YouTube / Instagram view webhook updates (PATCH /api/submissions/:id/views)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-outline"
            style={{ borderRadius: '50%', padding: '0.35rem', border: 'none' }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Current State Summary */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem'
          }}
        >
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Views</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {submission.currentViews.toLocaleString()}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Payout</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              ₹{submission.currentPayout.toLocaleString()}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Budget Remaining</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              ₹{campaign ? campaign.remainingBudget.toLocaleString() : 'N/A'}
            </div>
          </div>
        </div>

        {/* Quick Simulation Buttons */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="input-label" style={{ marginBottom: '0.45rem' }}>Quick View Jump Presets</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
            <button
              disabled={isUpdating}
              onClick={() => handleUpdate(submission.currentViews + 10000)}
              className="btn btn-sm btn-secondary"
            >
              <TrendingUp size={13} color="var(--brand-primary)" /> +10,000 Views (Tier 1)
            </button>
            <button
              disabled={isUpdating}
              onClick={() => handleUpdate(submission.currentViews + 50000)}
              className="btn btn-sm btn-secondary"
            >
              <TrendingUp size={13} color="var(--accent-emerald)" /> +50,000 Views (Tier Jump)
            </button>
            <button
              disabled={isUpdating}
              onClick={() => handleUpdate(submission.currentViews + 150000)}
              className="btn btn-sm btn-secondary"
            >
              <TrendingUp size={13} color="var(--accent-cyan)" /> +150,000 Views (Viral Wave)
            </button>
            <button
              disabled={isUpdating}
              onClick={() => handleUpdate(submission.currentViews + 350000)}
              className="btn btn-sm btn-outline"
              style={{ borderColor: 'var(--accent-rose-border)', color: 'var(--accent-rose)' }}
            >
              <AlertTriangle size={13} /> Trigger Bot Spike ⚡
            </button>
          </div>
        </div>

        {/* Custom View Input */}
        <div className="input-group">
          <label className="input-label">Set Exact Views</label>
          <div style={{ display: 'flex', gap: '0.45rem' }}>
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
              <Play size={15} /> {isUpdating ? 'Updating...' : 'Apply'}
            </button>
          </div>
        </div>

        {/* Live Calculation Feedback Card */}
        {lastResult && lastResult.payoutBreakdown && (
          <div
            style={{
              marginTop: '1.15rem',
              background: '#f8fafc',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              animation: 'modalIn 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                CALCULATION BREAKDOWN
              </span>
              {lastResult.payoutBreakdown.isBudgetCapped && (
                <span className="badge badge-rose">
                  <AlertTriangle size={10} /> BUDGET CAP REACHED
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Owed Differential Increment:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
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
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
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
