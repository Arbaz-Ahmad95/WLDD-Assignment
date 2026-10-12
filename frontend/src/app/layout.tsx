import type { Metadata } from 'next';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'Meme’d — Creator Marketplace Campaign & Payout Tracker',
  description: 'Real-time creator milestone payouts and strict campaign budget tracker for Instagram & YouTube campaigns.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔥</text></svg>" />
      </head>
      <body>
        <ToastProvider>
          <AuthProvider>
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 140px)', paddingBottom: '3rem' }}>
              {children}
            </main>
            <footer
              style={{
                borderTop: '1px solid var(--border-subtle)',
                padding: '2rem 0',
                background: 'rgba(8, 10, 17, 0.95)',
                color: 'var(--text-muted)',
                fontSize: '0.8rem'
              }}
            >
              <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, color: '#fff' }}>Meme’d</span>
                  <span>— Campaign Payout Tracker System</span>
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
