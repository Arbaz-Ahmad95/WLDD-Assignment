'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Sparkles, Instagram, Youtube } from 'lucide-react';
import { IMilestone } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCampaignModal({ isOpen, onClose, onSuccess }: CreateCampaignModalProps) {
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<'Instagram' | 'YouTube'>('Instagram');
  const [totalBudget, setTotalBudget] = useState('50000');
  const [milestones, setMilestones] = useState<IMilestone[]>([
    { viewThreshold: 10000, payout: 500 },
    { viewThreshold: 50000, payout: 2000 },
    { viewThreshold: 100000, payout: 5000 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    const last = milestones[milestones.length - 1];
    const nextViews = last ? last.viewThreshold * 2 : 10000;
    const nextPayout = last ? last.payout * 2 : 500;
    setMilestones([...milestones, { viewThreshold: nextViews, payout: nextPayout }]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) {
      showToast('A campaign must have at least one milestone tier.', 'warning');
      return;
    }
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: 'viewThreshold' | 'payout', value: string) => {
    const num = Math.max(0, Number(value));
    const updated = [...milestones];
    updated[index][field] = num;
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a campaign name', 'warning');
      return;
    }

    const budgetNum = Number(totalBudget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      showToast('Please enter a valid campaign budget', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createCampaign({
        name: name.trim(),
        platform,
        totalBudget: budgetNum,
        milestones
      });
      showToast(`Campaign "${name}" launched successfully!`, 'success', 'Campaign Created');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to create campaign', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Create Brand Campaign</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Define performance milestones and total budget spending cap
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-outline"
            style={{ borderRadius: '50%', padding: '0.35rem', border: 'none' }}
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Campaign Name */}
          <div className="input-group">
            <label className="input-label">Campaign Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Swiggy Viral Late Night Meme Blitz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Platform Toggle */}
          <div className="input-group">
            <label className="input-label">Target Platform</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setPlatform('Instagram')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: platform === 'Instagram' ? '1.5px solid #e11d48' : '1px solid var(--border-subtle)',
                  background: platform === 'Instagram' ? 'var(--accent-rose-bg)' : '#ffffff',
                  color: platform === 'Instagram' ? '#e11d48' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                <Instagram size={16} /> Instagram Reels
              </button>

              <button
                type="button"
                onClick={() => setPlatform('YouTube')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: platform === 'YouTube' ? '1.5px solid #dc2626' : '1px solid var(--border-subtle)',
                  background: platform === 'YouTube' ? '#fef2f2' : '#ffffff',
                  color: platform === 'YouTube' ? '#dc2626' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                <Youtube size={16} /> YouTube Shorts
              </button>
            </div>
          </div>

          {/* Total Budget */}
          <div className="input-group">
            <label className="input-label">Total Campaign Budget (₹ INR)</label>
            <input
              type="number"
              className="input-field"
              placeholder="50000"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              min="500"
              required
            />
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              Campaign automatically freezes further payouts when this budget limit is exhausted.
            </span>
          </div>

          {/* Milestone Ladder Builder */}
          <div style={{ marginTop: '1.1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.55rem' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>
                Milestone Ladder (Threshold → Highest Payout)
              </label>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="btn btn-sm btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
              >
                <Plus size={12} /> Add Milestone Tier
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '35px 1fr 1fr 35px',
                    gap: '0.5rem',
                    alignItems: 'center',
                    background: 'var(--bg-tertiary)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                    #{idx + 1}
                  </span>
                  <div>
                    <input
                      type="number"
                      className="input-field"
                      style={{ padding: '0.4rem 0.55rem', fontSize: '0.825rem', background: '#ffffff' }}
                      value={m.viewThreshold}
                      onChange={(e) => handleMilestoneChange(idx, 'viewThreshold', e.target.value)}
                      placeholder="Views"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      className="input-field"
                      style={{ padding: '0.4rem 0.55rem', fontSize: '0.825rem', background: '#ffffff' }}
                      value={m.payout}
                      onChange={(e) => handleMilestoneChange(idx, 'payout', e.target.value)}
                      placeholder="₹ Payout"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(idx)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              <Sparkles size={15} /> {isSubmitting ? 'Launching...' : 'Launch Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
