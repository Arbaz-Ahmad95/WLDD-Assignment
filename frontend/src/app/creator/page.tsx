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
import InteractiveCampaignCard, { getCampaignImage } from '../../components/InteractiveCampaignCard';
import CampaignDetailModal from '../../components/CampaignDetailModal';
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
  AlertTriangle,
  Sparkles
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
  const [detailCampaign, setDetailCampaign] = useState<ICampaign | null>(null);

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
              const thumb = getCampaignImage(camp?.name);

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          position: 'relative',
                          width: '56px',
                          height: '56px',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          flexShrink: 0,
                          boxShadow: 'var(--shadow-xs)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <img src={thumb} alt="Campaign" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            background: 'rgba(0,0,0,0.75)',
                            borderRadius: '3px',
                            padding: '1px 3px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {camp?.platform === 'Instagram' ? (
                            <Instagram size={10} color="#f43f5e" />
                          ) : (
                            <Youtube size={10} color="#ef4444" />
                          )}
                        </div>
                      </div>

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
              Choose a brand campaign, explore the interactive brief and ladder, and submit your content.
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

        {/* Interactive Campaign Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {campaigns.map((camp) => (
            <InteractiveCampaignCard
              key={camp._id}
              campaign={camp}
              onOpenDetails={(c) => setDetailCampaign(c)}
              onSubmitPost={(c) => {
                if (!user) {
                  quickDemoLogin('creator').then(() => setSubmittingCampaign(c));
                } else {
                  setSubmittingCampaign(c);
                }
              }}
            />
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

      <CampaignDetailModal
        campaign={detailCampaign}
        isOpen={!!detailCampaign}
        onClose={() => setDetailCampaign(null)}
        onSubmitPost={(c) => {
          if (!user) {
            quickDemoLogin('creator').then(() => setSubmittingCampaign(c));
          } else {
            setSubmittingCampaign(c);
          }
        }}
      />
    </div>
  );
}
