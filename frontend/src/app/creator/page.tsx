'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { ICampaign, ISubmission, CreatorStats } from '../../types';
import StatCard from '../../components/StatCard';
import BudgetBar from '../../components/BudgetBar';
import MilestoneLadderVisualizer from '../../components/MilestoneLadderVisualizer';
import SubmitPostModal from '../../components/SubmitPostModal';
import ViewSimulatorModal from '../../components/ViewSimulatorModal';
import {
  UserCircle,
  Coins,
  Eye,
  TrendingUp,
  Instagram,
  Youtube,
  Send,
  PlayCircle,
  ExternalLink,
  Award,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export default function CreatorPage() {
  const { user, quickDemoLogin } = useAuth();
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [submittingCampaign, setSubmittingCampaign] = useState<ICampaign | null>(null);
  const [simulatingSubmission, setSimulatingSubmission] = useState<ISubmission | null>(null);

  const fetchCreatorData = async () => {
    setLoading(true);
    try {
      // 1. Fetch live campaigns
      const campRes = await api.getLiveCampaigns(platformFilter === 'All' ? undefined : platformFilter);
      if (campRes.success) {
        setCampaigns(campRes.campaigns || []);
      }

      // 2. Fetch creator submissions & earnings if logged in
      if (user) {
        const subRes = await api.getCreatorEarnings();
        if (subRes.success) {
          setSubmissions(subRes.submissions || []);
          setStats(subRes.stats || null);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatorData();
  }, [user, platformFilter]);

  // Aggregate stats fallback
  const totalEarnings = stats ? stats.totalEarnings : submissions.reduce((s, sub) => s + sub.currentPayout, 0);
  const totalViews = stats ? stats.totalViews : submissions.reduce((s, sub) => s + sub.currentViews, 0);

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Creator Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem' }}>
            <span className="badge badge-emerald">CREATOR MARKETPLACE</span>
            {user?.role === 'creator' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logged in as {user.name}</span>
            )}
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Creator Earnings & Campaign Marketplace</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Submit your Instagram Reels & YouTube Shorts. Cross view milestones to unlock guaranteed payouts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button onClick={fetchCreatorData} className="btn btn-secondary">
            <RefreshCw size={14} /> Refresh
          </button>
          {!user && (
            <button
              onClick={async () => {
                await quickDemoLogin('creator');
                fetchCreatorData();
              }}
              className="btn btn-primary"
            >
              <UserCircle size={16} /> 1-Click Creator Demo Login
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard
          label="Total Earnings Earned"
          value={`₹${totalEarnings.toLocaleString()}`}
          subtitle="Highest milestones crossed"
          icon={<Coins size={18} color="var(--accent-emerald)" />}
          accentColor="var(--accent-emerald)"
        />

        <StatCard
          label="Total Verified Views"
          value={totalViews.toLocaleString()}
          subtitle="Generated across campaigns"
          icon={<Eye size={18} color="var(--accent-cyan)" />}
          accentColor="var(--accent-cyan)"
        />

        <StatCard
          label="Submitted Posts"
          value={submissions.length}
          subtitle="Actively tracking milestones"
          icon={<TrendingUp size={18} color="var(--brand-primary)" />}
          accentColor="var(--brand-primary)"
        />

        <StatCard
          label="Live Campaigns"
          value={campaigns.length}
          subtitle="Open for creator submissions"
          icon={<Award size={18} color="var(--accent-amber)" />}
          accentColor="var(--accent-amber)"
        />
      </div>

      {/* SECTION 1: MY SUBMISSIONS & EARNINGS TRACKER */}
      {submissions.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>My Submissions & Payout Progress</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Track verified views and check your active payout milestone level.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {submissions.map((sub) => {
              const camp = typeof sub.campaignId === 'object' ? (sub.campaignId as ICampaign) : null;

              return (
                <div
                  key={sub._id}
                  className="saas-card"
                  style={{
                    padding: '1.4rem',
                    border: sub.isSpikeFlagged ? '1px solid var(--accent-rose-border)' : undefined
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      {camp?.platform === 'Instagram' ? (
                        <Instagram size={20} color="#e11d48" />
                      ) : (
                        <Youtube size={20} color="#dc2626" />
                      )}
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                          {camp?.name || 'Campaign Post'}
                        </div>
                        <a
                          href={sub.postLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.775rem',
                            color: 'var(--brand-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          {sub.postLink} <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div>
                        <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Views</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {sub.currentViews.toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payout Earned</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                          ₹{sub.currentPayout.toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => setSimulatingSubmission({ ...sub, campaignId: camp || sub.campaignId })}
                        className="btn btn-sm btn-secondary"
                      >
                        <PlayCircle size={14} color="var(--brand-primary)" /> Simulate Views
                      </button>
                    </div>
                  </div>

                  {sub.isSpikeFlagged && (
                    <div
                      style={{
                        background: 'var(--accent-rose-bg)',
                        border: '1px solid var(--accent-rose-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.5rem 0.75rem',
                        marginBottom: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        fontSize: '0.775rem',
                        color: 'var(--accent-rose)'
                      }}
                    >
                      <AlertTriangle size={14} />
                      <span><strong>Spike Anomaly Flagged:</strong> {sub.spikeReason}</span>
                    </div>
                  )}

                  {/* Milestone Progression Visualizer */}
                  {camp?.milestones && (
                    <MilestoneLadderVisualizer
                      milestones={camp.milestones}
                      currentViews={sub.currentViews}
                      currentPayout={sub.currentPayout}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: BROWSE LIVE CAMPAIGNS MARKETPLACE */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Browse Live Campaigns</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Choose a brand campaign, submit your content link, and get paid as verified views climb.
            </p>
          </div>

          {/* Platform Filters */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {['All', 'Instagram', 'YouTube'].map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`btn btn-sm ${platformFilter === p ? 'btn-secondary' : 'btn-outline'}`}
                style={{
                  borderColor: platformFilter === p ? 'var(--brand-primary)' : undefined,
                  color: platformFilter === p ? 'var(--brand-primary)' : undefined,
                  background: platformFilter === p ? 'var(--brand-light)' : undefined,
                  fontWeight: platformFilter === p ? 700 : 500
                }}
              >
                {p === 'Instagram' && <Instagram size={12} />}
                {p === 'YouTube' && <Youtube size={12} />}
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Campaign Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.25rem' }}>
          {campaigns.map((camp) => (
            <div
              key={camp._id}
              className="saas-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.15rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    {camp.platform === 'Instagram' ? (
                      <span className="badge badge-rose"><Instagram size={11} /> Instagram Reels</span>
                    ) : (
                      <span className="badge badge-rose" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                        <Youtube size={11} /> YouTube Shorts
                      </span>
                    )}
                    <span className="badge badge-purple">{camp.status}</span>
                  </div>

                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    ₹{camp.remainingBudget.toLocaleString()} Available
                  </span>
                </div>

                <h3 style={{ fontSize: '1.075rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                  {camp.name}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  Brand: {typeof camp.brandId === 'object' ? camp.brandId?.name : 'Verified Brand'}
                </p>

                {/* Budget Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <BudgetBar
                    totalBudget={camp.totalBudget}
                    spentBudget={camp.spentBudget}
                    remainingBudget={camp.remainingBudget}
                    status={camp.status}
                  />
                </div>

                {/* Milestone Stepper */}
                <div style={{ marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Milestone Payout Ladder:
                  </span>
                  <MilestoneLadderVisualizer milestones={camp.milestones} compact />
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  disabled={camp.remainingBudget <= 0}
                  onClick={() => {
                    if (!user) {
                      quickDemoLogin('creator').then(() => setSubmittingCampaign(camp));
                    } else {
                      setSubmittingCampaign(camp);
                    }
                  }}
                  className={`btn ${camp.remainingBudget > 0 ? 'btn-primary' : 'btn-outline'}`}
                  style={{ width: '100%' }}
                >
                  <Send size={14} /> {camp.remainingBudget > 0 ? 'Submit Post Link' : 'Budget Exhausted'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <SubmitPostModal
        campaign={submittingCampaign}
        isOpen={!!submittingCampaign}
        onClose={() => setSubmittingCampaign(null)}
        onSuccess={fetchCreatorData}
      />

      <ViewSimulatorModal
        submission={simulatingSubmission}
        isOpen={!!simulatingSubmission}
        onClose={() => setSimulatingSubmission(null)}
        onSuccess={fetchCreatorData}
      />
    </div>
  );
}
