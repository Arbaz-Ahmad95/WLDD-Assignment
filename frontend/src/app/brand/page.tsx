'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { ICampaign, ISubmission, BrandStats } from '../../types';
import StatCard from '../../components/StatCard';
import BudgetBar from '../../components/BudgetBar';
import MilestoneLadderVisualizer from '../../components/MilestoneLadderVisualizer';
import CreateCampaignModal from '../../components/CreateCampaignModal';
import ViewSimulatorModal from '../../components/ViewSimulatorModal';
import {
  Building2,
  Plus,
  Coins,
  TrendingUp,
  Users,
  Eye,
  AlertTriangle,
  PlayCircle,
  Instagram,
  Youtube,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function BrandPage() {
  const { user, quickDemoLogin } = useAuth();
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [stats, setStats] = useState<BrandStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignSubmissions, setCampaignSubmissions] = useState<ISubmission[]>([]);
  const [simulatingSubmission, setSimulatingSubmission] = useState<ISubmission | null>(null);

  const fetchBrandData = async () => {
    setLoading(true);
    try {
      const res = await api.getBrandCampaigns();
      if (res.success) {
        setCampaigns(res.campaigns || []);
        setStats(res.stats || null);
        if (res.campaigns && res.campaigns.length > 0 && !selectedCampaignId) {
          setSelectedCampaignId(res.campaigns[0]._id);
        }
      }
    } catch {
      // If not logged in as brand, fallback to public campaigns
      try {
        const publicRes = await api.getLiveCampaigns();
        if (publicRes.success) {
          setCampaigns(publicRes.campaigns || []);
          if (publicRes.campaigns.length > 0 && !selectedCampaignId) {
            setSelectedCampaignId(publicRes.campaigns[0]._id);
          }
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandData();
  }, [user]);

  // When selected campaign changes, fetch its submissions
  useEffect(() => {
    if (selectedCampaignId) {
      api.getCampaignById(selectedCampaignId)
        .then((res) => {
          if (res.success) {
            setCampaignSubmissions(res.submissions || []);
          }
        })
        .catch(() => {});
    }
  }, [selectedCampaignId]);

  const selectedCampaign = campaigns.find((c) => c._id === selectedCampaignId) || campaigns[0];

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-purple">BRAND CONTROL CENTER</span>
            {user?.role === 'brand' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logged in as {user.name}</span>
            )}
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Campaign Performance & Budget Tracker</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Monitor real-time creator milestone payouts and enforce strict budget spending caps.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={fetchBrandData} className="btn btn-secondary" title="Refresh data">
            <RefreshCw size={15} /> Refresh
          </button>
          {user?.role === 'brand' ? (
            <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
              <Plus size={16} /> Create Campaign
            </button>
          ) : (
            <button
              onClick={async () => {
                await quickDemoLogin('brand');
                fetchBrandData();
              }}
              className="btn btn-primary"
            >
              <Building2 size={16} /> 1-Click Brand Demo Login
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <StatCard
          label="Total Budget Committed"
          value={stats ? `₹${stats.totalCommittedBudget.toLocaleString()}` : `₹${campaigns.reduce((s, c) => s + c.totalBudget, 0).toLocaleString()}`}
          subtitle="Across all brand campaigns"
          icon={<Coins size={20} color="var(--accent-purple)" />}
          accentColor="var(--accent-purple)"
        />

        <StatCard
          label="Budget Disbursed (Spent)"
          value={stats ? `₹${stats.totalSpentBudget.toLocaleString()}` : `₹${campaigns.reduce((s, c) => s + c.spentBudget, 0).toLocaleString()}`}
          subtitle="Earned by creator milestones"
          icon={<TrendingUp size={20} color="var(--accent-rose)" />}
          accentColor="var(--accent-rose)"
        />

        <StatCard
          label="Remaining Budget"
          value={stats ? `₹${stats.totalRemainingBudget.toLocaleString()}` : `₹${campaigns.reduce((s, c) => s + c.remainingBudget, 0).toLocaleString()}`}
          subtitle="Strict cap: cannot overspend"
          icon={<Coins size={20} color="var(--accent-emerald)" />}
          accentColor="var(--accent-emerald)"
        />

        <StatCard
          label="Creators & Submissions"
          value={stats ? stats.totalSubmissions : campaignSubmissions.length}
          subtitle="Active creator posts submitted"
          icon={<Users size={20} color="var(--accent-cyan)" />}
          accentColor="var(--accent-cyan)"
        />
      </div>

      {/* Main Campaign Management & Inspection Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Campaign List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Your Campaigns ({campaigns.length})</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-sm btn-outline"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              <Plus size={13} /> New
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No campaigns found.</p>
              <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
                Create First Campaign
              </button>
            </div>
          ) : (
            campaigns.map((c) => {
              const isSelected = selectedCampaignId === c._id;

              return (
                <div
                  key={c._id}
                  onClick={() => setSelectedCampaignId(c._id)}
                  className="glass-card"
                  style={{
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--accent-purple)' : undefined,
                    boxShadow: isSelected ? 'var(--shadow-glow)' : undefined,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.9rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {c.platform === 'Instagram' ? (
                        <Instagram size={18} color="#fb7185" />
                      ) : (
                        <Youtube size={18} color="#ef4444" />
                      )}
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>{c.name}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{c.platform} Campaign</div>
                      </div>
                    </div>

                    <span
                      className={`badge ${c.status === 'exhausted' ? 'badge-rose' : 'badge-purple'}`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {c.status}
                    </span>
                  </div>

                  {/* Budget Progress Bar */}
                  <BudgetBar
                    totalBudget={c.totalBudget}
                    spentBudget={c.spentBudget}
                    remainingBudget={c.remainingBudget}
                    status={c.status}
                  />

                  {/* Compact Milestone preview */}
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                      Milestone Ladder:
                    </span>
                    <MilestoneLadderVisualizer milestones={c.milestones} compact />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Campaign Submissions & Payout Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {selectedCampaign ? (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-cyan">{selectedCampaign.platform} CAMPAIGN</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {selectedCampaign._id}</span>
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedCampaign.name}</h2>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      if (campaignSubmissions.length > 0) {
                        setSimulatingSubmission(campaignSubmissions[0]);
                      }
                    }}
                    disabled={campaignSubmissions.length === 0}
                    className="btn btn-sm btn-primary"
                  >
                    <PlayCircle size={14} /> Test Views On First Post
                  </button>
                </div>
              </div>

              {/* Campaign Milestones Full Stepper */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Configured Milestone Ladder (Thresholds & Guaranteed Payouts)
                </h3>
                <MilestoneLadderVisualizer milestones={selectedCampaign.milestones} />
              </div>

              {/* Creator Submissions List */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    Creator Submissions ({campaignSubmissions.length})
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Total Views Driven: <strong>{campaignSubmissions.reduce((s, sub) => s + sub.currentViews, 0).toLocaleString()}</strong>
                  </span>
                </div>

                {campaignSubmissions.length === 0 ? (
                  <div
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px dashed var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '2.5rem',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem'
                    }}
                  >
                    No creator posts submitted for this campaign yet.
                    <div style={{ marginTop: '0.75rem' }}>
                      <Link href="/creator" className="btn btn-sm btn-secondary">
                        Switch to Creator Portal to Submit Post
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {campaignSubmissions.map((sub) => {
                      const creatorName = typeof sub.creatorId === 'object' ? sub.creatorId?.name : 'Creator';

                      return (
                        <div
                          key={sub._id}
                          style={{
                            background: 'var(--bg-tertiary)',
                            border: sub.isSpikeFlagged ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1.1rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '1rem'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: '340px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{creatorName}</span>
                              {sub.isSpikeFlagged && (
                                <span className="badge badge-rose" title={sub.spikeReason}>
                                  <AlertTriangle size={10} /> SPIKE FLAGGED
                                </span>
                              )}
                              {sub.isBudgetCapped && (
                                <span className="badge badge-amber" title="Payout was limited by remaining budget">
                                  BUDGET CAPPED
                                </span>
                              )}
                            </div>

                            <a
                              href={sub.postLink}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: '0.775rem',
                                color: 'var(--accent-cyan)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                wordBreak: 'break-all'
                              }}
                            >
                              {sub.postLink} <ExternalLink size={11} />
                            </a>
                            {sub.spikeReason && (
                              <span style={{ fontSize: '0.7rem', color: '#fb7185' }}>
                                ⚠️ {sub.spikeReason}
                              </span>
                            )}
                          </div>

                          {/* Views & Milestone Stats */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div>
                              <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Views</span>
                              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                                {sub.currentViews.toLocaleString()}
                              </div>
                            </div>

                            <div>
                              <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Milestone Payout</span>
                              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                                ₹{sub.currentPayout.toLocaleString()}
                              </div>
                            </div>

                            <button
                              onClick={() => setSimulatingSubmission({ ...sub, campaignId: selectedCampaign })}
                              className="btn btn-sm btn-secondary"
                              title="Simulate views on this submission"
                            >
                              <PlayCircle size={14} color="var(--accent-purple)" /> Simulate Views
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              Select a campaign to inspect its submissions and payout performance.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchBrandData}
      />

      <ViewSimulatorModal
        submission={simulatingSubmission}
        isOpen={!!simulatingSubmission}
        onClose={() => setSimulatingSubmission(null)}
        onSuccess={fetchBrandData}
      />
    </div>
  );
}
