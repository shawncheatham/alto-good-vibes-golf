import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function RoundHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #1a4731 0%, #2d7a4f 100%)', padding: '16px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 700, color: 'white', margin: 0 }}>
            Good Vibes Golf
          </h1>
          <nav style={{ display: 'flex', gap: 12 }}>
            <Link
              href="/round-history"
              style={{ color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
            >
              Rounds
            </Link>
            <Link
              href="/profile"
              style={{ color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}
            >
              Profile
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main style={{ background: '#f3f4f6', minHeight: 'calc(100vh - 60px)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 700, color: '#1a4731', margin: '0 0 8px' }}>
              Round History
            </h2>
            <p style={{ fontSize: 18, color: '#4b5563', margin: 0 }}>
              Track your games, celebrate your wins
            </p>
          </div>

          {/* Empty State */}
          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 80, marginBottom: 24, opacity: 0.5 }}>⛳</div>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 700, color: '#1a4731', marginBottom: 12 }}>
              No rounds yet
            </h3>
            <p style={{ fontSize: 16, color: '#4b5563', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 32px', padding: '0 16px' }}>
              Ready to play? Start your first round and track your games with friends.
              Every round tells a story — let&apos;s create yours.
            </p>
            <button
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 32px', background: '#f97316', color: 'white', fontSize: 18, fontWeight: 700, border: 'none', borderRadius: 8, cursor: 'not-allowed', opacity: 0.8 }}
              title="Round creation coming in Gate 4"
            >
              <span>Start a Round</span>
              <span>→</span>
            </button>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12 }}>Round creation coming soon</p>
          </div>
        </div>
      </main>
    </>
  )
}
