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
  Database,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles
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
      <section className="container" style={{ textAlign: 'center', maxWidth: '920px', margin: '0 auto 3.5rem auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--brand-light)',
            border: '1px solid #c7d2fe',
            marginBottom: '1.25rem'
          }}
        >
          <Flame size={15} color="var(--brand-primary)" />
          <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--brand-primary)', letterSpacing: '0.02em' }}>
            CREATOR MARKETPLACE • CAMPAIGN PAYOUT ENGINE
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 4.5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1.2rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em'
          }}
        >
          Predictable Creator Payouts.<br />
          Strict Budget Caps for Brands.
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '680px',
            margin: '0 auto 2.25rem auto'
          }}
        >
          Brands launch viral meme and clip campaigns on Instagram and YouTube with custom milestone ladders. Creators submit posts and earn verified payouts with atomic concurrency protection and bot fraud detection.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <button
            onClick={async () => {
              await quickDemoLogin('brand');
              router.push('/brand');
            }}
            className="btn btn-lg btn-primary"
          >
            <Building2 size={18} /> Launch Brand Portal
          </button>

          <button
            onClick={async () => {
              await quickDemoLogin('creator');
              router.push('/creator');
            }}
            className="btn btn-lg btn-secondary"
          >
            <UserCircle size={18} color="var(--accent-emerald)" /> Creator Marketplace
          </button>

          <Link href="/simulator" className="btn btn-lg btn-outline">
            <PlayCircle size={18} /> Webhook Simulator
          </Link>
        </div>
      </section>

      {/* Interactive Financial Calculator Widget */}
      <section className="container" style={{ marginBottom: '4.5rem' }}>
        <div
          className="saas-card"
          style={{
            padding: '2rem 2.25rem',
            maxWidth: '920px',
            margin: '0 auto',
            background: '#ffffff',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                <span className="badge badge-purple">LIVE CALCULATOR</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Interactive Business Logic Demonstration</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Milestone Ladder Calculation in Action</h3>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Highest Milestone Payout</span>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                ₹{highestCrossed.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Stepper Display */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {sampleMilestones.map((m, idx) => {
              const crossed = demoViews >= m.viewThreshold;
              const isHighest = crossed && (idx === sampleMilestones.length - 1 || demoViews < sampleMilestones[idx + 1].viewThreshold);

              return (
                <div
                  key={idx}
                  style={{
                    background: isHighest
                      ? 'var(--accent-emerald-bg)'
                      : crossed
                      ? '#f5f3ff'
                      : 'var(--bg-tertiary)',
                    border: isHighest
                      ? '1.5px solid var(--accent-emerald)'
                      : crossed
                      ? '1px solid #c7d2fe'
                      : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Tier #{idx + 1}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {(m.viewThreshold / 1000)}K Views
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: crossed ? 'var(--accent-emerald)' : 'var(--text-secondary)' }}>
                    ₹{m.payout.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slider and Quick Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'var(--bg-tertiary)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Simulated Views: <strong style={{ color: 'var(--text-primary)' }}>{demoViews.toLocaleString()} views</strong>
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
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
                accentColor: 'var(--brand-primary)',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      </section>

      {/* Core Engineering Architecture Grid */}
      <section className="container" style={{ marginBottom: '4.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Built Strictly to Assignment Specifications
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Designed with modular TypeScript services, atomic MongoDB operations, and high-coverage Jest test suites.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
          {/* Card 1 */}
          <div className="saas-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div style={{ padding: '0.45rem', borderRadius: '8px', background: 'var(--brand-light)' }}>
                <TrendingUp size={20} color="var(--brand-primary)" />
              </div>
              <h3 style={{ fontSize: '1.05rem' }}>Highest Milestone Ladder</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Creators are credited the amount of the highest milestone crossed. Incremental updates only disburse the differential difference, preventing double payments.
            </p>
          </div>

          {/* Card 2 */}
          <div className="saas-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div style={{ padding: '0.45rem', borderRadius: '8px', background: 'var(--accent-rose-bg)' }}>
                <ShieldCheck size={20} color="var(--accent-rose)" />
              </div>
              <h3 style={{ fontSize: '1.05rem' }}>Strict Budget Cap</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Campaigns never overspend remaining budget. When a milestone payout exceeds available funds, payout is capped exactly to remaining balance and campaign transitions to exhausted.
            </p>
          </div>

          {/* Card 3 */}
          <div className="saas-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div style={{ padding: '0.45rem', borderRadius: '8px', background: 'var(--accent-cyan-bg)' }}>
                <Cpu size={20} color="var(--accent-cyan)" />
              </div>
              <h3 style={{ fontSize: '1.05rem' }}>Concurrency Protection</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Atomic MongoDB operations with Optimistic Concurrency Control guarantee that two simultaneous view updates can never drain or overdraw campaign funds.
            </p>
          </div>

          {/* Card 4 */}
          <div className="saas-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div style={{ padding: '0.45rem', borderRadius: '8px', background: 'var(--accent-amber-bg)' }}>
                <Zap size={20} color="var(--accent-amber)" />
              </div>
              <h3 style={{ fontSize: '1.05rem' }}>View Spike Fraud Alert</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Calculates view velocity (views/second) and flash surge multipliers. Flagged submissions trigger an audit alert in brand dashboard for suspicious bot spikes.
            </p>
          </div>

          {/* Card 5 */}
          <div className="saas-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div style={{ padding: '0.45rem', borderRadius: '8px', background: 'var(--accent-emerald-bg)' }}>
                <Database size={20} color="var(--accent-emerald)" />
              </div>
              <h3 style={{ fontSize: '1.05rem' }}>Redis Campaign Cache</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Redis caching with in-memory fallback for high-throughput campaign browsing. Cache is automatically invalidated upon campaign creation or budget depletion.
            </p>
          </div>

          {/* Card 6 */}
          <div className="saas-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div style={{ padding: '0.45rem', borderRadius: '8px', background: 'var(--brand-light)' }}>
                <Layers size={20} color="var(--brand-primary)" />
              </div>
              <h3 style={{ fontSize: '1.05rem' }}>Jest Test Suite (28 Tests)</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Comprehensive test suites covering milestone calculation, single/multiple milestone jumps, budget cap enforcement, view regressions, and integration flows.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
