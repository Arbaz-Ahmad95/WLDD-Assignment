'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Sparkles,
  Award,
  Instagram,
  Youtube,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import AnimatedNumber from '../components/AnimatedNumber';

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
  let activeTier = -1;
  sampleMilestones.forEach((m, idx) => {
    if (demoViews >= m.viewThreshold) {
      highestCrossed = m.payout;
      activeTier = idx;
    }
  });

  const handleSimulate = (views: number) => {
    setDemoViews(views);
    if (views >= 50000) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.65 } });
      } catch {}
    }
  };

  return (
    <div style={{ paddingTop: '2rem' }}>
      {/* Hero Header & 3D Illustration Split Showcase */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3rem', alignItems: 'center' }}>
          <div>
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
                fontSize: 'clamp(2.4rem, 4vw, 3.4rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: '1.15rem',
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em'
              }}
            >
              Predictable Creator Payouts.<br />
              Guaranteed Budget Caps.
            </h1>

            <p
              style={{
                fontSize: '1.075rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '2rem'
              }}
            >
              Brands launch viral meme and clip campaigns on Instagram and YouTube with custom milestone ladders. Creators submit posts and earn verified payouts with atomic concurrency protection and bot fraud detection.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
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
          </div>

          {/* Meaningful 3D Hero Artwork Showcase with Floating Elements */}
          <div style={{ position: 'relative' }}>
            <div
              className="saas-card floating-card"
              style={{
                overflow: 'hidden',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid #cbd5e1',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative'
              }}
            >
              <img
                src="/images/hero.jpg"
                alt="Meme'd Creator Marketplace Architecture"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: 'var(--radius-xl)'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Live Campaign Payout Engine: Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Milestone Ladder & Post Simulation Widget */}
      <section className="container" style={{ marginBottom: '4.5rem' }}>
        <div
          className="saas-card"
          style={{
            padding: '2rem 2.25rem',
            background: '#ffffff',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                <span className="badge badge-purple">INTERACTIVE BENCH</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time milestone ladder calculation</span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Simulate Post Views & Guaranteed Payouts</h3>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Highest Milestone Payout Earned</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                <AnimatedNumber value={highestCrossed} prefix="₹" />
              </div>
            </div>
          </div>

          {/* Stepper Display */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {sampleMilestones.map((m, idx) => {
              const crossed = demoViews >= m.viewThreshold;
              const isHighest = idx === activeTier;

              return (
                <div
                  key={idx}
                  className={isHighest ? 'milestone-active-pop glow-active' : ''}
                  style={{
                    background: isHighest
                      ? 'var(--accent-emerald-bg)'
                      : crossed
                      ? '#f5f3ff'
                      : 'var(--bg-tertiary)',
                    border: isHighest
                      ? '2px solid var(--accent-emerald)'
                      : crossed
                      ? '1px solid #c7d2fe'
                      : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    textAlign: 'center',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Tier #{idx + 1}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {(m.viewThreshold / 1000)}K Views
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: crossed ? 'var(--accent-emerald)' : 'var(--text-secondary)' }}>
                    ₹{m.payout.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Slider & Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'var(--bg-tertiary)', padding: '1.1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Drag slider to simulate views: <strong style={{ color: 'var(--text-primary)' }}><AnimatedNumber value={demoViews} suffix=" views" /></strong>
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button onClick={() => handleSimulate(12000)} className="btn btn-sm btn-secondary">12K (Tier 1)</button>
                <button onClick={() => handleSimulate(55000)} className="btn btn-sm btn-secondary">55K (Tier 2)</button>
                <button onClick={() => handleSimulate(110000)} className="btn btn-sm btn-secondary">110K 🚀</button>
                <button onClick={() => handleSimulate(280000)} className="btn btn-sm btn-secondary">280K 🎉</button>
              </div>
            </div>

            <input
              type="range"
              className="interactive-slider"
              min="0"
              max="300000"
              step="5000"
              value={demoViews}
              onChange={(e) => handleSimulate(Number(e.target.value))}
            />

            {/* Liquid Progress Bar */}
            <div style={{ height: '5px', width: '100%', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                className="animated-liquid-bar"
                style={{
                  height: '100%',
                  width: `${Math.min(100, Math.round((demoViews / 250000) * 100))}%`,
                  borderRadius: '999px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaign Artworks Grid */}
      <section className="container" style={{ marginBottom: '4.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Live Brand Campaigns On Meme’d</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Real campaigns accepting creator post links with verified milestone payouts
            </p>
          </div>
          <Link href="/creator" className="btn btn-sm btn-secondary">
            View All Marketplace Campaigns →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Campaign 1: Swiggy */}
          <div className="saas-card interactive-image-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '180px', background: '#fff7ed' }}>
              <img
                src="/images/swiggy.jpg"
                alt="Swiggy Campaign"
                className="card-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="sheen-overlay" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-rose"><Instagram size={11} /> Instagram Reels</span>
                <span className="badge badge-emerald">₹44,500 Budget Left</span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Swiggy Midnight Craving Meme Blitz</h4>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Post your funniest late night food order reel. Milestones up to ₹12,000!
              </p>
            </div>
            <Link href="/creator" className="btn btn-sm btn-primary" style={{ width: '100%' }}>
              Submit Post Link
            </Link>
          </div>

          {/* Campaign 2: Nike */}
          <div className="saas-card interactive-image-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '180px', background: '#f0f9ff' }}>
              <img
                src="/images/nike.jpg"
                alt="Nike Campaign"
                className="card-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="sheen-overlay" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-rose" style={{ background: '#fef2f2', color: '#dc2626' }}><Youtube size={11} /> YouTube Shorts</span>
                <span className="badge badge-emerald">₹70,000 Budget Left</span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Nike Pegasus YouTube Shorts Challenge</h4>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Athletic fitness & running speed edits. Top milestone unlocks ₹25,000!
              </p>
            </div>
            <Link href="/creator" className="btn btn-sm btn-primary" style={{ width: '100%' }}>
              Submit Post Link
            </Link>
          </div>

          {/* Campaign 3: Spotify */}
          <div className="saas-card interactive-image-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '180px', background: '#ecfdf5' }}>
              <img
                src="/images/spotify.jpg"
                alt="Spotify Campaign"
                className="card-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="sheen-overlay" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-rose"><Instagram size={11} /> Instagram Reels</span>
                <span className="badge badge-emerald">₹18,700 Budget Left</span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Spotify India Beats & Memes Wave</h4>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Use trending Spotify India audios in funny memes. Milestones up to ₹4,500!
              </p>
            </div>
            <Link href="/creator" className="btn btn-sm btn-primary" style={{ width: '100%' }}>
              Submit Post Link
            </Link>
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
            Engineered with modular TypeScript services, atomic MongoDB operations, and high-coverage Jest test suites.
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
