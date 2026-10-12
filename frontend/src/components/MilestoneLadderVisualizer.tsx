'use client';

import React from 'react';
import { IMilestone } from '../types';
import { CheckCircle2, Lock, TrendingUp, Sparkles } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

interface MilestoneLadderVisualizerProps {
  milestones: IMilestone[];
  currentViews?: number;
  currentPayout?: number;
  compact?: boolean;
}

export default function MilestoneLadderVisualizer({
  milestones,
  currentViews = 0,
  compact = false
}: MilestoneLadderVisualizerProps) {
  if (!milestones || milestones.length === 0) {
    return <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No milestones set</div>;
  }

  // Sort ascending
  const sorted = [...milestones].sort((a, b) => a.viewThreshold - b.viewThreshold);

  // Find highest crossed
  let highestCrossedIndex = -1;
  for (let i = 0; i < sorted.length; i++) {
    if (currentViews >= sorted[i].viewThreshold) {
      highestCrossedIndex = i;
    }
  }

  const nextMilestone = highestCrossedIndex < sorted.length - 1 ? sorted[highestCrossedIndex + 1] : null;
  const currentTierThreshold = highestCrossedIndex >= 0 ? sorted[highestCrossedIndex].viewThreshold : 0;
  const nextTierThreshold = nextMilestone ? nextMilestone.viewThreshold : (sorted[sorted.length - 1].viewThreshold || 1);

  // Compute progress percentage between current tier and next tier
  let tierProgressPercent = 0;
  if (nextMilestone) {
    const range = nextTierThreshold - currentTierThreshold;
    const progressIntoRange = Math.max(0, currentViews - currentTierThreshold);
    tierProgressPercent = Math.min(100, Math.round((progressIntoRange / range) * 100));
  } else if (highestCrossedIndex === sorted.length - 1) {
    tierProgressPercent = 100;
  }

  const viewsToNext = nextMilestone ? Math.max(0, nextMilestone.viewThreshold - currentViews) : 0;

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
        {sorted.map((m, idx) => {
          const isCrossed = idx <= highestCrossedIndex;
          const isHighest = idx === highestCrossedIndex;

          return (
            <div
              key={idx}
              className={isHighest ? 'milestone-active-pop' : ''}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.725rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                background: isHighest
                  ? 'var(--accent-emerald-bg)'
                  : isCrossed
                  ? 'var(--brand-light)'
                  : 'var(--bg-tertiary)',
                border: isHighest
                  ? '1.5px solid var(--accent-emerald)'
                  : isCrossed
                  ? '1px solid #c7d2fe'
                  : '1px solid var(--border-subtle)',
                color: isHighest ? 'var(--accent-emerald)' : isCrossed ? 'var(--brand-primary)' : 'var(--text-muted)',
                fontWeight: isHighest ? 700 : 500,
                transition: 'all 0.25s ease'
              }}
            >
              {isCrossed ? (
                <CheckCircle2 size={11} style={{ animation: isHighest ? 'checkBounce 0.4s ease' : undefined }} />
              ) : (
                <Lock size={10} />
              )}
              <span>{(m.viewThreshold / 1000).toFixed(0)}k</span>
              <span style={{ fontWeight: 700 }}>₹{m.payout.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Visual Milestone Stepper */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${sorted.length}, 1fr)`,
          gap: '0.65rem'
        }}
      >
        {sorted.map((m, idx) => {
          const isCrossed = idx <= highestCrossedIndex;
          const isHighest = idx === highestCrossedIndex;
          const isNext = idx === highestCrossedIndex + 1;

          return (
            <div
              key={idx}
              className={isHighest ? 'milestone-active-pop glow-active' : ''}
              style={{
                background: isHighest
                  ? 'var(--accent-emerald-bg)'
                  : isCrossed
                  ? '#f5f3ff'
                  : '#ffffff',
                border: isHighest
                  ? '2px solid var(--accent-emerald)'
                  : isCrossed
                  ? '1px solid #c7d2fe'
                  : isNext
                  ? '1.5px dashed #cbd5e1'
                  : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                position: 'relative',
                boxShadow: isHighest ? '0 4px 12px rgba(5, 150, 105, 0.15)' : 'var(--shadow-xs)',
                transition: 'all 0.25s ease'
              }}
            >
              {/* Badge for Highest Achieved */}
              {isHighest && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-9px',
                    right: '8px',
                    background: 'var(--accent-emerald)',
                    color: '#ffffff',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    padding: '1px 7px',
                    borderRadius: '999px',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 4px rgba(5, 150, 105, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  <Sparkles size={8} /> ACTIVE TIER
                </div>
              )}

              {/* Threshold View */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.725rem', fontWeight: 600, color: isCrossed ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                  Tier {idx + 1}
                </span>
                {isCrossed ? (
                  <CheckCircle2
                    size={15}
                    color="var(--accent-emerald)"
                    style={{ animation: isHighest ? 'checkBounce 0.4s ease' : undefined }}
                  />
                ) : (
                  <Lock size={12} color="var(--text-muted)" />
                )}
              </div>

              {/* View Target */}
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {m.viewThreshold >= 1000 ? `${(m.viewThreshold / 1000).toLocaleString()}K Views` : `${m.viewThreshold} Views`}
              </div>

              {/* Payout */}
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: isCrossed ? 'var(--accent-emerald)' : 'var(--text-secondary)'
                }}
              >
                ₹{m.payout.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Track & Next Target Banner */}
      {nextMilestone ? (
        <div
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 0.95rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.775rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309' }}>
              <TrendingUp size={14} />
              <span>
                Next milestone: <strong>{nextMilestone.viewThreshold.toLocaleString()} views</strong> (Reward: <strong>₹{nextMilestone.payout.toLocaleString()}</strong>)
              </span>
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong>+{viewsToNext.toLocaleString()} views needed</strong> ({tierProgressPercent}%)
            </span>
          </div>

          {/* Animated Liquid Progress Bar towards next tier */}
          <div
            style={{
              width: '100%',
              height: '6px',
              background: '#e2e8f0',
              borderRadius: '999px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${tierProgressPercent}%`,
                background: 'linear-gradient(90deg, #4f46e5 0%, #10b981 100%)',
                borderRadius: '999px',
                transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </div>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--accent-emerald-bg)',
            border: '1px solid var(--accent-emerald-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.6rem 0.85rem',
            fontSize: '0.775rem',
            color: 'var(--accent-emerald)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Sparkles size={14} /> Top Tier Unlocked! Maximum campaign milestone achieved.
        </div>
      )}
    </div>
  );
}
