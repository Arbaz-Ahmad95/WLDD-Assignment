'use client';

import React, { useState } from 'react';
import { X, Send, Instagram, Youtube, ExternalLink } from 'lucide-react';
import { ICampaign } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

interface SubmitPostModalProps {
  campaign: ICampaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmitPostModal({ campaign, isOpen, onClose, onSuccess }: SubmitPostModalProps) {
  const [postLink, setPostLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen || !campaign) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postLink.trim()) {
      showToast('Please enter your post URL', 'warning');
      return;
    }

    // Platform validation
    if (campaign.platform === 'Instagram' && !postLink.includes('instagram.com') && !postLink.includes('instagr.am')) {
      showToast('This campaign requires an Instagram post or reel link', 'error');
      return;
    }

    if (campaign.platform === 'YouTube' && !postLink.includes('youtube.com') && !postLink.includes('youtu.be')) {
      showToast('This campaign requires a YouTube video or short link', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitPost({
        campaignId: campaign._id,
        postLink: postLink.trim()
      });
      showToast('Post submitted successfully! Views & payouts will now be tracked.', 'success', 'Submission Accepted');
      setPostLink('');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Submit Creator Post</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Submit your published Reel or Short to start unlocking milestones
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-outline"
            style={{ borderRadius: '50%', padding: '0.4rem', border: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Campaign Summary Pill */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {campaign.platform === 'Instagram' ? (
              <Instagram size={20} color="#fb7185" />
            ) : (
              <Youtube size={20} color="#ef4444" />
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>{campaign.name}</div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                Platform: {campaign.platform} | Budget Remaining: ₹{campaign.remainingBudget.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">
              Your {campaign.platform} Post / Reel / Short URL
            </label>
            <input
              type="url"
              className="input-field"
              placeholder={
                campaign.platform === 'Instagram'
                  ? 'https://instagram.com/reel/C...'
                  : 'https://youtube.com/shorts/...'
              }
              value={postLink}
              onChange={(e) => setPostLink(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              Make sure your post is public so views can be synced from the platform.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              <Send size={15} /> {isSubmitting ? 'Submitting...' : 'Submit Post Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
