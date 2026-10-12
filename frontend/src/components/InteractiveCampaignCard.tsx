'use client';

import React, { useState } from 'react';
import { ICampaign } from '../types';
import BudgetBar from './BudgetBar';
import MilestoneLadderVisualizer from './MilestoneLadderVisualizer';
import {
  Instagram,
  Youtube,
  Send,
  Eye,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface InteractiveCampaignCardProps {
  campaign: ICampaign;
  onSelect?: (campaign: ICampaign) => void;
  onSubmitPost?: (campaign: ICampaign) => void;
  onOpenDetails?: (campaign: ICampaign) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

export function getCampaignImage(name?: string): string {
  if (!name) return '/images/hero.jpg';
  const lower = name.toLowerCase();
  if (lower.includes('swiggy') || lower.includes('craving') || lower.includes('food')) {
    return '/images/swiggy.jpg';
  }
  if (lower.includes('nike') || lower.includes('pegasus') || lower.includes('sports')) {
    return '/images/nike.jpg';
  }
  if (lower.includes('spotify') || lower.includes('music') || lower.includes('beats')) {
    return '/images/spotify.jpg';
  }
  return '/images/hero.jpg';
}

export default function InteractiveCampaignCard({
  campaign,
  onSelect,
  onSubmitPost,
  onOpenDetails,
  isSelected = false,
  showActions = true
}: InteractiveCampaignCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const imageSrc = getCampaignImage(campaign.name);

  return (
    <div
      className={`saas-card interactive-image-card ${isSelected ? 'glow-active' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect && onSelect(campaign)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderColor: isSelected ? 'var(--brand-primary)' : undefined,
        boxShadow: isSelected ? '0 0 0 2px var(--brand-primary), var(--shadow-md)' : undefined,
        cursor: onSelect || onOpenDetails ? 'pointer' : 'default',
        overflow: 'hidden'
      }}
    >
      {/* Interactive Visual Artwork Banner */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '160px',
          overflow: 'hidden',
          backgroundColor: '#0f172a'
        }}
      >
        <img
          src={imageSrc}
          alt={campaign.name}
          className="card-img"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />

        {/* Sheen sweep effect on hover */}
        <div className="sheen-overlay" />

        {/* Gradient dark vignette at bottom of image for readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.1) 50%, rgba(0,0,0,0) 100%)',
            pointerEvents: 'none'
          }}
        />

        {/* Top Badges Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'none'
          }}
        >
          {/* Platform Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.725rem',
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              color: campaign.platform === 'Instagram' ? '#e11d48' : '#dc2626'
            }}
          >
            {campaign.platform === 'Instagram' ? <Instagram size={13} /> : <Youtube size={13} />}
            <span>{campaign.platform}</span>
          </div>

          {/* Live Status Beacon */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#ffffff'
            }}
          >
            {campaign.status === 'active' && <span className="pulsing-beacon" />}
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {campaign.status}
            </span>
          </div>
        </div>

        {/* Bottom Banner Stats on Image */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '14px',
            right: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'none',
            color: '#ffffff'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.9 }}>
            Budget Available:
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#34d399' }}>
            ₹{campaign.remainingBudget.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Card Content Details */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.95rem', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              marginBottom: '0.25rem'
            }}
          >
            {campaign.name}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Brand: {typeof campaign.brandId === 'object' ? campaign.brandId?.name : 'Verified Enterprise Brand'}
          </p>
        </div>

        {/* Budget Bar */}
        <BudgetBar
          totalBudget={campaign.totalBudget}
          spentBudget={campaign.spentBudget}
          remainingBudget={campaign.remainingBudget}
          status={campaign.status}
        />

        {/* Milestone Ladder Chips */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Milestone Payout Ladder:
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', fontWeight: 700 }}>
              {campaign.milestones.length} Tiers
            </span>
          </div>
          <MilestoneLadderVisualizer milestones={campaign.milestones} compact />
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            {onOpenDetails && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(campaign);
                }}
                className="btn btn-sm btn-secondary"
                style={{ flex: 1 }}
                title="View full brief and interactive milestone calculator"
              >
                <Eye size={13} color="var(--brand-primary)" />
                <span>Interactive Brief</span>
              </button>
            )}

            {onSubmitPost && (
              <button
                type="button"
                disabled={campaign.remainingBudget <= 0}
                onClick={(e) => {
                  e.stopPropagation();
                  onSubmitPost(campaign);
                }}
                className={`btn btn-sm ${campaign.remainingBudget > 0 ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1 }}
              >
                <Send size={13} />
                <span>{campaign.remainingBudget > 0 ? 'Submit Post' : 'Exhausted'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
