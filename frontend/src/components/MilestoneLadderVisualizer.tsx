import React from 'react';
import { IMilestone } from '../types';
import { CheckCircle2, Lock, TrendingUp } from 'lucide-react';

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
                  ? '1px solid var(--accent-emerald-border)'
                  : isCrossed
                  ? '1px solid #c7d2fe'
                  : '1px solid var(--border-subtle)',
                color: isHighest ? 'var(--accent-emerald)' : isCrossed ? 'var(--brand-primary)' : 'var(--text-muted)'
              }}
            >
              {isCrossed ? <CheckCircle2 size={11} /> : <Lock size={10} />}
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
              style={{
                background: isHighest
                  ? 'var(--accent-emerald-bg)'
                  : isCrossed
                  ? '#f5f3ff'
                  : '#ffffff',
                border: isHighest
                  ? '1.5px solid var(--accent-emerald)'
                  : isCrossed
                  ? '1px solid #c7d2fe'
                  : isNext
                  ? '1px dashed #cbd5e1'
                  : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                position: 'relative',
                boxShadow: isHighest ? '0 2px 4px rgba(5, 150, 105, 0.1)' : 'var(--shadow-xs)',
                transition: 'all 0.2s ease'
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
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '999px',
                    textTransform: 'uppercase'
                  }}
                >
                  UNLOCKED
                </div>
              )}

              {/* Threshold View */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.725rem', fontWeight: 600, color: isCrossed ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                  Tier {idx + 1}
                </span>
                {isCrossed ? (
                  <CheckCircle2 size={14} color="var(--accent-emerald)" />
                ) : (
                  <Lock size={12} color="var(--text-muted)" />
                )}
              </div>

              {/* View Target */}
              <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {m.viewThreshold >= 1000 ? `${(m.viewThreshold / 1000).toLocaleString()}K Views` : `${m.viewThreshold} Views`}
              </div>

              {/* Payout */}
              <div
                style={{
                  fontSize: '0.825rem',
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

      {/* Next Target Banner */}
      {nextMilestone && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--accent-amber-bg)',
            border: '1px solid var(--accent-amber-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.6rem 0.85rem',
            fontSize: '0.775rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309' }}>
            <TrendingUp size={14} />
            <span>
              Next unlock at <strong>{nextMilestone.viewThreshold.toLocaleString()} views</strong> (Tier payout: ₹{nextMilestone.payout.toLocaleString()})
            </span>
          </div>
          <span style={{ color: 'var(--text-secondary)' }}>
            <strong>+{viewsToNext.toLocaleString()}</strong> views needed
          </span>
        </div>
      )}
    </div>
  );
}
