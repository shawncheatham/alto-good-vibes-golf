import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface Round {
  id: string;
  course_name: string;
  game: string;
  status: string;
  holes: number;
  created_at: string;
  completed_at: string | null;
}

export default async function RoundHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: rounds } = await supabase
    .from('rounds')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const statusLabel = (status: string) => {
    if (status === 'complete') return { label: 'Complete', color: '#4ea869' }
    if (status === 'abandoned') return { label: 'Abandoned', color: '#9ca3af' }
    return { label: 'In Progress', color: '#ff6b35' }
  }

  return (
    <>
      {/* Header */}
      <header style={{ background: 'var(--gvg-grass-dark)', padding: '16px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 700, color: 'white', margin: 0 }}>
            Good Vibes Golf
          </h1>
          <nav style={{ display: 'flex', gap: 12 }}>
            <Link
              href="/round/create"
              style={{ color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 8, background: 'var(--gvg-accent)' }}
            >
              ⛳ New Round
            </Link>
            <Link
              href="/profile"
              style={{ color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.1)' }}
            >
              Profile
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main style={{ background: 'var(--gvg-gray-100)', minHeight: 'calc(100vh - 60px)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 700, color: 'var(--gvg-grass-dark)', margin: '0 0 8px' }}>
              Round History
            </h2>
            <p style={{ fontSize: 18, color: 'var(--gvg-gray-600)', margin: 0 }}>
              Track your games, celebrate your wins
            </p>
          </div>

          {!rounds || rounds.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 80, marginBottom: 24, opacity: 0.5 }}>⛳</div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--gvg-grass-dark)', marginBottom: 12 }}>
                No rounds yet
              </h3>
              <p style={{ fontSize: 16, color: 'var(--gvg-gray-600)', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 32px', padding: '0 16px' }}>
                Ready to play? Start your first round and track your games with friends.
              </p>
              <Link
                href="/round/create"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 32px', background: 'var(--gvg-accent)', color: 'white', fontSize: 18, fontWeight: 700, borderRadius: 8, textDecoration: 'none' }}
              >
                <span>Start a Round</span>
                <span>→</span>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(rounds as Round[]).map(round => {
                const { label, color } = statusLabel(round.status)
                const isAbandoned = round.status === 'abandoned'
                const href = round.status === 'complete' ? `/round/${round.id}/recap` : `/round/${round.id}/scorecard`
                return (
                  <Link
                    key={round.id}
                    href={href}
                    style={{
                      display: 'block',
                      background: 'white',
                      borderRadius: 16,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      padding: '20px 24px',
                      textDecoration: 'none',
                      opacity: isAbandoned ? 0.6 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--gvg-gray-900)', margin: '0 0 4px' }}>
                          {round.course_name}
                        </h3>
                        <p style={{ fontSize: 14, color: 'var(--gvg-gray-500)', margin: 0 }}>
                          {formatDate(round.created_at)} · Skins · {round.holes} holes
                        </p>
                      </div>
                      <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: `${color}20`, color: color, flexShrink: 0 }}>
                        {label}
                      </span>
                    </div>
                    {!isAbandoned && (
                      <div style={{ marginTop: 12, fontSize: 13, color: 'var(--gvg-gray-500)' }}>
                        {round.status === 'complete' ? '→ View recap' : '→ Continue round'}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
