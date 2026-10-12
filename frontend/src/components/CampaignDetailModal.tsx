'use client';

import React, { useState } from 'react';
import { ICampaign } from '../types';
import { getCampaignImage } from './InteractiveCampaignCard';
import MilestoneLadderVisualizer from './MilestoneLadderVisualizer';
import BudgetBar from './BudgetBar';
import AnimatedNumber from './AnimatedNumber';
import {
  X,
  Instagram,
  Youtube,
  Send,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CampaignDetailModalProps {
  campaign: ICampaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitPost?: (campaign: ICampaign) => void;
}

export default function CampaignDetailModal({
  campaign,
  isOpen,
  onClose,
  onSubmitPost
}: CampaignDetailModalProps) {
  const [sliderViews, setSliderViews] = useState<number>(30000);

  if (!isOpen || !campaign) return null;

  const imageSrc = getCampaignImage(campaign.name);

  // Calculate earnings for the current sliderViews
  const sorted = [...campaign.milestones].sort((a, b) => a.viewThreshold - b.viewThreshold);
  let highestCrossed = 0;
  let highestTierIndex = -1;

  sorted.forEach((m, idx) => {
    if (sliderViews >= m.viewThreshold) {
      highestCrossed = m.payout;
      highestTierIndex = idx;
    }
  });

  const nextMilestone = highestTierIndex < sorted.length - 1 ? sorted[highestTierIndex + 1] : null;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderViews(val);
    // Trigger confetti if top tier reached
    if (sorted.length > 0 && val >= sorted[sorted.length - 1].viewThreshold && highestTierIndex !== sorted.length - 1) {
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const maxSliderValue = sorted.length > 0 ? sorted[sorted.length - 1].viewThreshold * 1.25 : 300000;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        {/* Full Bleed Image Header */}
        <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden' }}>
          <img
            src={imageSrc}
            alt={campaign.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.3) 60%, rgba(0,0,0,0) 100%)'
            }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="btn btn-sm"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              color: 'var(--text-primary)',
              borderRadius: '50%',
              padding: '0.4rem',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          {/* Overlay Details */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '20px',
              right: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              color: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: campaign.platform === 'Instagram' ? '#e11d48' : '#dc2626'
                }}
              >
                {campaign.platform === 'Instagram' ? <Instagram size={13} /> : <Youtube size={13} />}
                <span>{campaign.platform} Reels & Shorts</span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(15, 23, 42, 0.75)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#ffffff'
                }}
              >
                <span className="pulsing-beacon" />
                <span>ACCEPTING POSTS</span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
              {campaign.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '68vh', overflowY: 'auto' }}>
          {/* Campaign Budget Overview */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
              Campaign Budget Health
            </h4>
            <BudgetBar
              totalBudget={campaign.totalBudget}
              spentBudget={campaign.spentBudget}
              remainingBudget={campaign.remainingBudget}
              status={campaign.status}
            />
          </div>

          {/* Interactive Milestone Earnings Calculator */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="badge badge-purple" style={{ marginBottom: '0.25rem' }}>
                  <Sparkles size={11} /> LIVE REWARD SIMULATOR
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  Interactive Post Earnings Calculator
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Drag the slider to test payouts across milestone thresholds.
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Highest Milestone Payout
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  <AnimatedNumber value={highestCrossed} prefix="₹" />
                </div>
              </div>
            </div>

            {/* Slider */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Simulated Post Views:</span>
                <strong style={{ color: 'var(--brand-primary)', fontSize: '1rem' }}>
                  {sliderViews.toLocaleString()} views
                </strong>
              </div>
              <input
                type="range"
                className="interactive-slider"
                min="0"
                max={maxSliderValue}
                step="5000"
                value={sliderViews}
                onChange={handleSliderChange}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                <span>0 Views</span>
                <span>{(maxSliderValue / 2000).toFixed(0)}k Views</span>
                <span>{(maxSliderValue / 1000).toFixed(0)}k Views</span>
              </div>
            </div>

            {/* Milestone Ladder Reacting In Real-Time */}
            <div>
              <MilestoneLadderVisualizer
                milestones={campaign.milestones}
                currentViews={sliderViews}
                currentPayout={highestCrossed}
              />
            </div>
          </div>

          {/* Platform Safeguards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div
              style={{
                background: 'var(--accent-emerald-bg)',
                border: '1px solid var(--accent-emerald-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--accent-emerald)'
              }}
            >
              <ShieldCheck size={18} />
              <div>
                <strong>Strict Budget Capped:</strong>
                <div>Disbursements never exceed ₹{campaign.remainingBudget.toLocaleString()}</div>
              </div>
            </div>

            <div
              style={{
                background: 'var(--accent-cyan-bg)',
                border: '1px solid var(--accent-cyan-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--accent-cyan)'
              }}
            >
              <Zap size={18} />
              <div>
                <strong>Atomic OCC & Spike Filter:</strong>
                <div>Bot spikes &gt;2,000 views/sec flagged instantly</div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <button onClick={onClose} className="btn btn-secondary">
              Close Preview
            </button>
            {onSubmitPost && (
              <button
                disabled={campaign.remainingBudget <= 0}
                onClick={() => {
                  onClose();
                  onSubmitPost(campaign);
                }}
                className="btn btn-primary"
              >
                <Send size={15} /> Submit Post Link for Campaign
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
