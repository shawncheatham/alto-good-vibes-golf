import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import MembershipClient from './MembershipClient'

export default async function MembershipPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let tier = 'free'
  let userEmail: string | undefined

  if (user) {
    userEmail = user.email ?? undefined
    const { data } = await supabase
      .from('users')
      .select('tier')
      .eq('id', user.id)
      .single()
    if (data?.tier) tier = data.tier
  }

  return (
    <>
      {/* Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, #1a4d2e 0%, #2d7a4f 100%)',
          padding: '16px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 22,
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
            }}
          >
            Good Vibes Golf
          </Link>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {user ? (
              <Link
                href="/round-history"
                style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
              >
                My Rounds
              </Link>
            ) : (
              <Link
                href="/login"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(4px)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>

      <MembershipClient tier={tier} userEmail={userEmail} />
    </>
  )
}
