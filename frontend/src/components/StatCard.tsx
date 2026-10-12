import React, { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: string;
  accentColor?: string;
}

export default function StatCard({
  label,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'var(--brand-primary)'
}: StatCardProps) {
  return (
    <div
      className="saas-card"
      style={{
        padding: '1.4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.85rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <div
          style={{
            padding: '0.45rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {icon}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {value}
        </div>
        {(subtitle || trend) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.3rem' }}>
            {trend && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: trend.startsWith('+') ? 'var(--accent-emerald)' : 'var(--text-muted)'
                }}
              >
                {trend}
              </span>
            )}
            {subtitle && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
