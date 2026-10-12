import type { Metadata } from 'next';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'Meme’d — Creator Marketplace Campaign & Payout Engine',
  description: 'Enterprise creator campaign management, milestone payouts, and campaign budget tracker for Instagram & YouTube.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎯</text></svg>" />
      </head>
      <body>
        <ToastProvider>
          <AuthProvider>
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 130px)', paddingBottom: '3.5rem' }}>
              {children}
            </main>
            <footer
              style={{
                borderTop: '1px solid var(--border-subtle)',
                padding: '2rem 0',
                background: '#ffffff',
                color: 'var(--text-muted)',
                fontSize: '0.825rem'
              }}
            >
              <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Meme’d Technologies</span>
                  <span>• Creator Marketplace & Campaign Payout Engine</span>
                </div>
                <div>
                  Built for WLDD Technical Evaluation • Express + TypeScript + Mongoose + Next.js + Redis
                </div>
              </div>
            </footer>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
