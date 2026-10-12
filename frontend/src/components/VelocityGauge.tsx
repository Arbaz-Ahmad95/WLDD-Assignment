'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck, Zap, Gauge } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

interface VelocityGaugeProps {
  velocity: number; // views per second
  deltaViews: number;
  deltaTimeSec: number;
  isSpike: boolean;
  spikeReason?: string;
}

export default function VelocityGauge({
  velocity,
  deltaViews,
  deltaTimeSec,
  isSpike,
  spikeReason
}: VelocityGaugeProps) {
  // Map velocity (0 to 5000+) to a rotation angle (-90deg to +90deg)
  const clampedVelocity = Math.min(6000, Math.max(0, velocity));
  const percent = clampedVelocity / 6000;
  const rotationDeg = -90 + percent * 180;

  return (
    <div
      style={{
        background: isSpike ? '#fff1f2' : '#ffffff',
        border: isSpike ? '1.5px solid #f43f5e' : '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        boxShadow: isSpike ? '0 4px 15px rgba(244, 63, 94, 0.15)' : 'var(--shadow-xs)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Banner Tag */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Gauge size={16} color={isSpike ? '#e11d48' : 'var(--brand-primary)'} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            View Velocity Tachometer
          </span>
        </div>

        {isSpike ? (
          <span className="badge badge-rose" style={{ animation: 'sirenPulse 1s infinite alternate' }}>
            <AlertTriangle size={11} /> BOT SPIKE FLAGGED
          </span>
        ) : (
          <span className="badge badge-emerald">
            <ShieldCheck size={11} /> ORGANIC TRAFFIC
          </span>
        )}
      </div>

      {/* Speedometer Gauge Dial Graphic */}
      <div style={{ position: 'relative', width: '200px', height: '110px', marginTop: '0.5rem' }}>
        {/* Semicircular SVG Track */}
        <svg viewBox="0 0 200 110" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="75%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Gradient Active Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="251"
            strokeDashoffset={251 - percent * 251}
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>

        {/* Center Needle */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            width: '4px',
            height: '75px',
            background: isSpike ? '#e11d48' : '#0f172a',
            borderRadius: '2px',
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${rotationDeg}deg)`,
            transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        />

        {/* Needle Center Pin */}
        <div
          style={{
            position: 'absolute',
            bottom: '0px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '18px',
            height: '18px',
            background: isSpike ? '#e11d48' : '#0f172a',
            borderRadius: '50%',
            border: '3px solid #ffffff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
      </div>

      {/* Numeric Readouts */}
      <div style={{ textAlign: 'center', marginTop: '-0.25rem' }}>
        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: isSpike ? '#e11d48' : 'var(--text-primary)' }}>
          <AnimatedNumber value={Math.round(velocity)} suffix=" views/sec" />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
          Delta: <strong>+{deltaViews.toLocaleString()} views</strong> in <strong>{deltaTimeSec.toFixed(1)}s</strong>
        </div>
      </div>

      {/* Spike Reason Alert Message */}
      {isSpike && spikeReason && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--accent-rose-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.45rem 0.75rem',
            fontSize: '0.725rem',
            color: 'var(--accent-rose)',
            fontWeight: 600,
            textAlign: 'center',
            width: '100%'
          }}
        >
          {spikeReason}
        </div>
      )}
    </div>
  );
}
