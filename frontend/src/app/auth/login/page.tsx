'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Flame, Lock, Mail, Building2, UserCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, quickDemoLogin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push('/');
    } catch {
      // toast is handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="saas-card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem 2.25rem', background: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--brand-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.85rem',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
            }}
          >
            <Flame size={22} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Sign in to Meme’d</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Access your Brand or Creator dashboard
          </p>
        </div>

        {/* Quick Demo Logins for Evaluators */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.45rem' }}>
            Instant 1-Click Demo Logins
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={async () => {
                await quickDemoLogin('brand');
                router.push('/brand');
              }}
              className="btn btn-sm btn-secondary"
            >
              <Building2 size={14} color="var(--brand-primary)" /> Demo Brand
            </button>
            <button
              type="button"
              onClick={async () => {
                await quickDemoLogin('creator');
                router.push('/creator');
              }}
              className="btn btn-sm btn-secondary"
            >
              <UserCircle size={14} color="var(--accent-emerald)" /> Demo Creator
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>OR CONTINUE WITH EMAIL</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'} <ArrowRight size={15} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
