'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Flame, Sparkles, Building2, UserCircle, LogOut, PlayCircle, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout, quickDemoLogin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(8, 10, 17, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--accent-gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
            }}
          >
            <Flame size={22} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
              Meme’d<span style={{ color: 'var(--accent-purple)' }}>.</span>
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
              PAYOUT TRACKER
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link
            href="/"
            className={`btn btn-sm ${pathname === '/' ? 'btn-secondary' : 'btn-outline'}`}
            style={{ border: pathname === '/' ? '1px solid var(--border-accent)' : undefined }}
          >
            <Sparkles size={14} /> Showcase
          </Link>

          <Link
            href="/brand"
            className={`btn btn-sm ${pathname.startsWith('/brand') ? 'btn-secondary' : 'btn-outline'}`}
            style={{ border: pathname.startsWith('/brand') ? '1px solid var(--accent-purple)' : undefined }}
          >
            <Building2 size={14} /> Brand Portal
          </Link>

          <Link
            href="/creator"
            className={`btn btn-sm ${pathname.startsWith('/creator') ? 'btn-secondary' : 'btn-outline'}`}
            style={{ border: pathname.startsWith('/creator') ? '1px solid var(--accent-emerald)' : undefined }}
          >
            <UserCircle size={14} /> Creator Portal
          </Link>

          <Link
            href="/simulator"
            className={`btn btn-sm ${pathname === '/simulator' ? 'btn-primary' : 'btn-outline'}`}
          >
            <PlayCircle size={14} /> Live View Simulator
          </Link>
        </nav>

        {/* HR & Quick Role Switcher / Auth State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                <span
                  className={`badge ${user.role === 'brand' ? 'badge-purple' : 'badge-emerald'}`}
                  style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}
                >
                  {user.role}
                </span>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name.split(' ')[0]}
                </span>
              </div>

              <button
                onClick={() => logout()}
                className="btn btn-sm btn-outline"
                title="Log out"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={async () => {
                  await quickDemoLogin('brand');
                  router.push('/brand');
                }}
                className="btn btn-sm btn-secondary"
                title="Quick 1-Click login as Demo Brand"
              >
                <Building2 size={13} color="var(--accent-purple)" /> Demo Brand
              </button>
              <button
                onClick={async () => {
                  await quickDemoLogin('creator');
                  router.push('/creator');
                }}
                className="btn btn-sm btn-secondary"
                title="Quick 1-Click login as Demo Creator"
              >
                <UserCircle size={13} color="var(--accent-emerald)" /> Demo Creator
              </button>
              <Link href="/auth/login" className="btn btn-sm btn-primary">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
