'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Flame, Sparkles, Building2, UserCircle, LogOut, PlayCircle, BarChart3, CheckCircle2 } from 'lucide-react';

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
        background: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        {/* Brand Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
            }}
          >
            <Flame size={20} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              Meme’d<span style={{ color: 'var(--brand-primary)' }}>.</span>
            </span>
            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
              PAYOUT ENGINE
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Link
            href="/"
            className={`btn btn-sm ${pathname === '/' ? 'btn-secondary' : 'btn-outline'}`}
            style={{
              fontWeight: pathname === '/' ? 700 : 500,
              borderColor: pathname === '/' ? 'var(--brand-primary)' : undefined,
              color: pathname === '/' ? 'var(--brand-primary)' : undefined,
              background: pathname === '/' ? 'var(--brand-light)' : undefined
            }}
          >
            <Sparkles size={14} /> Overview
          </Link>

          <Link
            href="/brand"
            className={`btn btn-sm ${pathname.startsWith('/brand') ? 'btn-secondary' : 'btn-outline'}`}
            style={{
              fontWeight: pathname.startsWith('/brand') ? 700 : 500,
              borderColor: pathname.startsWith('/brand') ? 'var(--brand-primary)' : undefined,
              color: pathname.startsWith('/brand') ? 'var(--brand-primary)' : undefined,
              background: pathname.startsWith('/brand') ? 'var(--brand-light)' : undefined
            }}
          >
            <Building2 size={14} /> Brand Portal
          </Link>

          <Link
            href="/creator"
            className={`btn btn-sm ${pathname.startsWith('/creator') ? 'btn-secondary' : 'btn-outline'}`}
            style={{
              fontWeight: pathname.startsWith('/creator') ? 700 : 500,
              borderColor: pathname.startsWith('/creator') ? 'var(--accent-emerald)' : undefined,
              color: pathname.startsWith('/creator') ? 'var(--accent-emerald)' : undefined,
              background: pathname.startsWith('/creator') ? 'var(--accent-emerald-bg)' : undefined
            }}
          >
            <UserCircle size={14} /> Creator Portal
          </Link>

          <Link
            href="/simulator"
            className={`btn btn-sm ${pathname === '/simulator' ? 'btn-secondary' : 'btn-outline'}`}
            style={{
              fontWeight: pathname === '/simulator' ? 700 : 500,
              borderColor: pathname === '/simulator' ? 'var(--accent-cyan)' : undefined,
              color: pathname === '/simulator' ? 'var(--accent-cyan)' : undefined,
              background: pathname === '/simulator' ? 'var(--accent-cyan-bg)' : undefined
            }}
          >
            <PlayCircle size={14} /> Simulator Studio
          </Link>
        </nav>

        {/* Quick Demo Switcher / Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.3rem 0.65rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                <span
                  className={`badge ${user.role === 'brand' ? 'badge-purple' : 'badge-emerald'}`}
                  style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}
                >
                  {user.role}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name.split(' ')[0]}
                </span>
              </div>

              <button
                onClick={() => logout()}
                className="btn btn-sm btn-outline"
                title="Sign out"
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
                <Building2 size={13} color="var(--brand-primary)" /> Demo Brand
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
