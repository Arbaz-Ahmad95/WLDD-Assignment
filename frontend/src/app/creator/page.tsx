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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-emerald">CREATOR MARKETPLACE</span>
            {user?.role === 'creator' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logged in as {user.name}</span>
            )}
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Creator Earnings & Campaign Marketplace</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Submit your Instagram Reels & YouTube Shorts. Cross view milestones to unlock instant guaranteed payouts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={fetchCreatorData} className="btn btn-secondary">
            <RefreshCw size={15} /> Refresh
          </button>
          {!user && (
            <button
              onClick={async () => {
                await quickDemoLogin('creator');
                fetchCreatorData();
              }}
              className="btn btn-success"
            >
              <UserCircle size={16} /> 1-Click Creator Demo Login
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <StatCard
          label="Total Earnings Withdrawn"
          value={`₹${totalEarnings.toLocaleString()}`}
          subtitle="Highest milestones crossed"
          icon={<Coins size={20} color="var(--accent-emerald)" />}
          accentColor="var(--accent-emerald)"
        />

        <StatCard
          label="Total Verified Views"
          value={totalViews.toLocaleString()}
          subtitle="Generated across all campaigns"
          icon={<Eye size={20} color="var(--accent-cyan)" />}
          accentColor="var(--accent-cyan)"
        />

        <StatCard
          label="Submitted Posts"
          value={submissions.length}
          subtitle="Actively tracking payouts"
          icon={<TrendingUp size={20} color="var(--accent-purple)" />}
          accentColor="var(--accent-purple)"
        />

        <StatCard
          label="Marketplace Campaigns"
          value={campaigns.length}
          subtitle="Open for submissions"
          icon={<Award size={20} color="var(--accent-amber)" />}
          accentColor="var(--accent-amber)"
        />
      </div>

      {/* SECTION 1: MY SUBMISSIONS & EARNINGS TRACKER */}
      {submissions.length > 0 && (
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>My Submissions & Payout Progress</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Track live views and see exactly which milestone payout tier you've crossed.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {submissions.map((sub) => {
              const camp = typeof sub.campaignId === 'object' ? (sub.campaignId as ICampaign) : null;

              return (
                <div
                  key={sub._id}
                  className="glass-card"
                  style={{
                    padding: '1.5rem',
                    border: sub.isSpikeFlagged ? '1px solid rgba(244, 63, 94, 0.4)' : undefined
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {camp?.platform === 'Instagram' ? (
                        <Instagram size={22} color="#fb7185" />
                      ) : (
                        <Youtube size={22} color="#ef4444" />
                      )}
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                          {camp?.name || 'Campaign Post'}
                        </div>
                        <a
                          href={sub.postLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--accent-cyan)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          {sub.postLink} <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Views</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                          {sub.currentViews.toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payout Earned</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                          ₹{sub.currentPayout.toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => setSimulatingSubmission({ ...sub, campaignId: camp || sub.campaignId })}
                        className="btn btn-sm btn-primary"
                      >
                        <PlayCircle size={15} /> Simulate Views
                      </button>
                    </div>
                  </div>

                  {sub.isSpikeFlagged && (
                    <div
                      style={{
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.5rem 0.75rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.775rem',
                        color: '#fb7185'
                      }}
                    >
                      <AlertTriangle size={15} />
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Browse Live Campaigns</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Choose a brand campaign, submit your content link, and get paid as views climb.
            </p>
          </div>

          {/* Platform Filters */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['All', 'Instagram', 'YouTube'].map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`btn btn-sm ${platformFilter === p ? 'btn-secondary' : 'btn-outline'}`}
                style={{
                  border: platformFilter === p ? '1px solid var(--accent-purple)' : undefined,
                  fontWeight: platformFilter === p ? 700 : 500
                }}
              >
                {p === 'Instagram' && <Instagram size={13} />}
                {p === 'YouTube' && <Youtube size={13} />}
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Campaign Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {campaigns.map((camp) => (
            <div
              key={camp._id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {camp.platform === 'Instagram' ? (
                      <span className="badge badge-rose"><Instagram size={11} /> Instagram Reels</span>
                    ) : (
                      <span className="badge badge-rose" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                        <Youtube size={11} /> YouTube Shorts
                      </span>
                    )}
                    <span className="badge badge-purple">{camp.status}</span>
                  </div>

                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    ₹{camp.remainingBudget.toLocaleString()} Available
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem', color: '#fff' }}>
                  {camp.name}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Brand: {typeof camp.brandId === 'object' ? camp.brandId?.name : 'Verified Brand'}
                </p>

                {/* Budget Bar */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <BudgetBar
                    totalBudget={camp.totalBudget}
                    spentBudget={camp.spentBudget}
                    remainingBudget={camp.remainingBudget}
                    status={camp.status}
                  />
                </div>

                {/* Milestone Stepper */}
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
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
                  <Send size={15} /> {camp.remainingBudget > 0 ? 'Submit Post Link' : 'Budget Exhausted'}
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
