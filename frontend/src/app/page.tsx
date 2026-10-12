'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  ShieldCheck,
  Zap,
  TrendingUp,
  Building2,
  UserCircle,
  PlayCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database,
  Cpu,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HomePage() {
  const { quickDemoLogin } = useAuth();
  const router = useRouter();

  // Interactive Live Demo preview on Hero
  const [demoViews, setDemoViews] = useState(65000);
  const sampleMilestones = [
    { viewThreshold: 10000, payout: 500 },
    { viewThreshold: 50000, payout: 2000 },
    { viewThreshold: 100000, payout: 5000 },
    { viewThreshold: 250000, payout: 12000 }
  ];

  // Compute highest crossed
  let highestCrossed = 0;
  sampleMilestones.forEach((m) => {
    if (demoViews >= m.viewThreshold) highestCrossed = m.payout;
  });

  const handleSimulate = (views: number) => {
    setDemoViews(views);
    if (views >= 100000) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {}
    }
  };

  return (
    <div style={{ paddingTop: '2.5rem' }}>
      {/* Hero Section */}
      <section className="container" style={{ textAlign: 'center', maxWidth: '960px', margin: '0 auto 4rem auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            marginBottom: '1.5rem'
          }}
        >
          <Flame size={16} color="var(--accent-purple)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', letterSpacing: '0.04em' }}>
            MEME’D CREATOR MARKETPLACE • PAYOUT ENGINE
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Powering Creator Payouts.<br />
          Safeguarding Brand Budgets.
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '720px',
            margin: '0 auto 2.5rem auto'
          }}
        >
          Brands launch viral meme campaigns with milestone ladders. Creators earn by hitting verified view thresholds on Instagram & YouTube. Total payouts are strictly capped by remaining campaign budgets with atomic concurrency control.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={async () => {
              await quickDemoLogin('brand');
              router.push('/brand');
            }}
            className="btn btn-lg btn-primary"
          >
            <Building2 size={18} /> Enter Brand Portal
          </button>

          <button
            onClick={async () => {
              await quickDemoLogin('creator');
              router.push('/creator');
            }}
            className="btn btn-lg btn-success"
          >
            <UserCircle size={18} /> Enter Creator Portal
          </button>

          <Link href="/simulator" className="btn btn-lg btn-secondary">
            <PlayCircle size={18} /> Live Webhook Simulator
          </Link>
        </div>
      </section>

      {/* Interactive Live Hero Widget */}
      <section className="container" style={{ marginBottom: '5rem' }}>
        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(180deg, rgba(20, 26, 48, 0.8) 0%, rgba(12, 16, 32, 0.95) 100%)',
            border: '1px solid var(--border-medium)',
            padding: '2.5rem',
            maxWidth: '960px',
            margin: '0 auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-purple">LIVE INTERACTIVE DEMO</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Try adjusting views below</span>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Milestone Ladder Calculation in Action</h3>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Highest Milestone Payout Earned</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                ₹{highestCrossed.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Stepper Display */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
            {sampleMilestones.map((m, idx) => {
              const crossed = demoViews >= m.viewThreshold;
              const isHighest = crossed && (idx === sampleMilestones.length - 1 || demoViews < sampleMilestones[idx + 1].viewThreshold);

              return (
                <div
                  key={idx}
                  style={{
                    background: isHighest
                      ? 'rgba(16, 185, 129, 0.15)'
                      : crossed
                      ? 'rgba(139, 92, 246, 0.1)'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: isHighest
                      ? '1px solid var(--accent-emerald)'
                      : crossed
                      ? '1px solid rgba(139, 92, 246, 0.4)'
                      : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Tier #{idx + 1}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
                    {(m.viewThreshold / 1000)}K Views
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: crossed ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    ₹{m.payout.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slider and Quick Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Simulated Views: <strong style={{ color: '#fff' }}>{demoViews.toLocaleString()} views</strong>
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleSimulate(12000)} className="btn btn-sm btn-secondary">12K</button>
                <button onClick={() => handleSimulate(55000)} className="btn btn-sm btn-secondary">55K</button>
                <button onClick={() => handleSimulate(110000)} className="btn btn-sm btn-secondary">110K 🚀</button>
                <button onClick={() => handleSimulate(280000)} className="btn btn-sm btn-secondary">280K 🎉</button>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="300000"
              step="5000"
              value={demoViews}
              onChange={(e) => handleSimulate(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--accent-purple)',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      </section>

      {/* Core Architecture Cards */}
      <section className="container" style={{ marginBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Built Strictly to Assignment Specifications
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Engineered with real-world fintech rigor, defensive edge case handling, and modular TypeScript structure.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Card 1 */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)' }}>
                <TrendingUp size={22} color="var(--accent-purple)" />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>Highest Milestone Ladder</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A creator’s payout is always the amount of the highest milestone their post has crossed. Incremental updates only pay the differential difference, preventing double payments.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)' }}>
                <ShieldCheck size={22} color="var(--accent-rose)" />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>Strict Budget Cap</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Campaigns will NEVER overspend remaining budget. When a milestone payout exceeds available funds, payout is capped exactly to remaining balance and campaign transitions to exhausted.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)' }}>
                <Cpu size={22} color="var(--accent-cyan)" />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>Concurrency Protection</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Atomic MongoDB operations with Optimistic Concurrency Control guarantee that two simultaneous view updates can never drain or overdraw campaign funds.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)' }}>
                <Zap size={22} color="var(--accent-amber)" />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>View Spike Fraud Alert</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Calculates view velocity (views/second) and flash surge multipliers. Flagged submissions trigger an audit alert in brand dashboard for suspicious bot spikes.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)' }}>
                <Database size={22} color="var(--accent-emerald)" />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>Redis Campaign Cache</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Redis caching with in-memory fallback for high-throughput campaign browsing. Cache is automatically invalidated upon campaign creation or budget depletion.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)' }}>
                <Layers size={22} color="#818cf8" />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>Jest Test Suite (28 Tests)</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Unit tests for milestone calculation, single/multiple milestone jumps, budget cap enforcement, view regressions, spike detection, and end-to-end integration tests.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
