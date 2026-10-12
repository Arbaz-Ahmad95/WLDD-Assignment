import React from 'react';
import { AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface BudgetBarProps {
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  status?: string;
}

export default function BudgetBar({
  totalBudget,
  spentBudget,
  remainingBudget,
  status = 'active'
}: BudgetBarProps) {
  const percentSpent = Math.min(100, Math.round((spentBudget / (totalBudget || 1)) * 100));

  let barColor = 'var(--accent-emerald)';
  let statusBadge = (
    <span className="badge badge-emerald">
      <CheckCircle size={10} /> {percentSpent}% Spent
    </span>
  );

  if (percentSpent >= 90 || remainingBudget <= 0) {
    barColor = 'var(--accent-rose)';
    statusBadge = (
      <span className="badge badge-rose">
        <AlertTriangle size={10} /> {remainingBudget <= 0 ? 'Exhausted' : `${percentSpent}% Depleted`}
      </span>
    );
  } else if (percentSpent >= 60) {
    barColor = 'var(--accent-amber)';
    statusBadge = (
      <span className="badge badge-amber">
        <Zap size={10} /> {percentSpent}% Spent
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Campaign Budget Cap
          </span>
          {statusBadge}
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          ₹{spentBudget.toLocaleString()} <span style={{ color: 'var(--text-muted)' }}>/ ₹{totalBudget.toLocaleString()}</span>
        </div>
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: '100%',
          height: '8px',
          background: '#e2e8f0',
          borderRadius: '999px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentSpent}%`,
            background: barColor,
            borderRadius: '999px',
            transition: 'width 0.5s ease'
          }}
        />
      </div>

      {/* Details Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>
          Disbursed: <strong style={{ color: 'var(--text-primary)' }}>₹{spentBudget.toLocaleString()}</strong>
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          Available: <strong style={{ color: remainingBudget > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>₹{remainingBudget.toLocaleString()}</strong>
        </span>
      </div>
    </div>
  );
}
