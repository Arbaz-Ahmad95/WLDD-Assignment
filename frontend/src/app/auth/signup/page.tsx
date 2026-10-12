'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { UserRole } from '../../../types';
import { Flame, Building2, UserCircle, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('creator');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signup(name, email, password, role);
      if (role === 'brand') {
        router.push('/brand');
      } else {
        router.push('/creator');
      }
    } catch {
      // toast is handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="saas-card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem 2.25rem', background: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create Your Account</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Join Meme’d as a Brand to sponsor or Creator to earn
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role Selector */}
          <div className="input-group">
            <label className="input-label">Select Account Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setRole('creator')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: role === 'creator' ? '1.5px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                  background: role === 'creator' ? 'var(--accent-emerald-bg)' : '#ffffff',
                  color: role === 'creator' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                <UserCircle size={16} /> Creator
              </button>

              <button
                type="button"
                onClick={() => setRole('brand')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: role === 'brand' ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  background: role === 'brand' ? 'var(--brand-light)' : '#ffffff',
                  color: role === 'brand' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                <Building2 size={16} /> Brand
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Full Name or Organization</label>
            <input
              type="text"
              className="input-field"
              placeholder={role === 'brand' ? 'e.g. Swiggy Brand Ops' : 'e.g. Rohan Sharma'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@domain.com"
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
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'} <ArrowRight size={15} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
