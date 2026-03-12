'use client'

import { useEffect } from 'react'

interface Props {
  tier: string
  userEmail?: string
}

function bmcUrl(levelId: number, email?: string) {
  const base = `https://www.buymeacoffee.com/golfvibes/membership?level=${levelId}`
  if (email) return `${base}&email=${encodeURIComponent(email)}`
  return base
}

export default function MembershipClient({ tier, userEmail }: Props) {
  // Prevent body scroll when modal open — not needed here, just placeholder
  useEffect(() => {}, [])

  const groundsKeeperUrl = bmcUrl(309472, userEmail)
  const playersClubUrl = bmcUrl(309474, userEmail)

  const isOnPaidTier = tier === 'grounds_keeper' || tier === 'players_club'

  return (
    <div
      style={{
        background: '#f3f4f6',
        minHeight: 'calc(100vh - 60px)',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 36,
              fontWeight: 700,
              color: '#1a4d2e',
              marginBottom: 12,
            }}
          >
            Choose Your Plan
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 480, margin: '0 auto' }}>
            Start free, upgrade anytime. Cancel whenever you want.
          </p>
        </div>

        {/* Tier cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
            marginBottom: 48,
          }}
        >
          {/* Free tier */}
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#1a4d2e',
                  marginBottom: 4,
                }}
              >
                Free
              </h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>$0</span>
                <span style={{ fontSize: 14, color: '#6b7280' }}>/mo</span>
              </div>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
                Get started with the essentials.
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
              {['🎯 Skins game', 'Round history', 'Score tracking'].map(item => (
                <li key={item} style={{ fontSize: 14, color: '#374151', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                  {item}
                </li>
              ))}
            </ul>

            <button
              disabled
              style={{
                width: '100%',
                padding: '12px',
                background: '#e5e7eb',
                color: '#9ca3af',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'default',
              }}
            >
              {tier === 'free' ? 'Current Plan' : 'Free Plan'}
            </button>
          </div>

          {/* Grounds Keeper */}
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(255,107,53,0.2)',
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              border: '2px solid #ff6b35',
              position: 'relative',
            }}
          >
            {/* Most Popular badge */}
            <div
              style={{
                position: 'absolute',
                top: -14,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#ff6b35',
                color: 'white',
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 16px',
                borderRadius: 99,
                whiteSpace: 'nowrap',
              }}
            >
              Most Popular
            </div>

            <div style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#1a4d2e',
                  marginBottom: 4,
                }}
              >
                Grounds Keeper
              </h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>$3</span>
                <span style={{ fontSize: 14, color: '#6b7280' }}>/mo</span>
              </div>
              <p style={{ fontSize: 12, color: '#ff6b35', fontWeight: 600, marginBottom: 12 }}>
                7-day free trial
              </p>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
                Unlock all standard game formats.
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
              {[
                '🎯 Everything in Free',
                '⛳ Nassau',
                '🤝 Match Play',
                '📊 Stableford',
                'Priority support',
              ].map(item => (
                <li key={item} style={{ fontSize: 14, color: '#374151', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                  {item}
                </li>
              ))}
            </ul>

            {tier === 'grounds_keeper' ? (
              <button
                disabled
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#e5e7eb',
                  color: '#9ca3af',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'default',
                }}
              >
                Current Plan
              </button>
            ) : (
              <a
                href={groundsKeeperUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  background: '#ff6b35',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                }}
              >
                {userEmail ? 'Start Free Trial' : 'Sign Up to Upgrade'}
              </a>
            )}
          </div>

          {/* Players Club */}
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              border: '2px solid #2d7a4f',
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#1a4d2e',
                  marginBottom: 4,
                }}
              >
                Players Club
              </h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>$8</span>
                <span style={{ fontSize: 14, color: '#6b7280' }}>/mo</span>
              </div>
              <p style={{ fontSize: 12, color: '#2d7a4f', fontWeight: 600, marginBottom: 12 }}>
                7-day free trial
              </p>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
                Everything, including custom formats & side bets.
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
              {[
                '🎯 Everything in Grounds Keeper',
                '✨ Custom game formats',
                '💰 Side bets',
                'Early access to new features',
                'Priority support',
              ].map(item => (
                <li key={item} style={{ fontSize: 14, color: '#374151', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                  {item}
                </li>
              ))}
            </ul>

            {tier === 'players_club' ? (
              <button
                disabled
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#e5e7eb',
                  color: '#9ca3af',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'default',
                }}
              >
                Current Plan
              </button>
            ) : (
              <a
                href={playersClubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  background: '#2d7a4f',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                }}
              >
                {userEmail ? 'Start Free Trial' : 'Sign Up to Upgrade'}
              </a>
            )}
          </div>
        </div>

        {/* Manage on BMC */}
        {isOnPaidTier && (
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <a
              href="https://www.buymeacoffee.com/golfvibes"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2d7a4f', fontSize: 14, fontWeight: 600, textDecoration: 'underline' }}
            >
              Manage your subscription on Buy Me a Coffee →
            </a>
          </div>
        )}

        {/* Login CTA for unauthenticated users */}
        {!userEmail && (
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              textAlign: 'center',
              marginBottom: 48,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <p style={{ color: '#374151', fontSize: 15, marginBottom: 16 }}>
              Log in to upgrade your plan with your email pre-filled.
            </p>
            <a
              href="/login"
              style={{
                display: 'inline-block',
                padding: '10px 28px',
                background: '#1a4d2e',
                color: 'white',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Log In
            </a>
          </div>
        )}

        {/* FAQ */}
        <div
          style={{
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: 32,
          }}
        >
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 22,
              fontWeight: 700,
              color: '#1a4d2e',
              marginBottom: 24,
            }}
          >
            Frequently Asked Questions
          </h2>

          {[
            {
              q: 'How does the 7-day free trial work?',
              a: "Start any paid plan and you won't be charged for 7 days. Cancel anytime during the trial and you'll never pay a cent.",
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Yes — cancel anytime directly on Buy Me a Coffee. Your access ends immediately upon cancellation.',
            },
            {
              q: 'What happens to my rounds if I downgrade?',
              a: "Your round history is always safe. You'll just lose access to premium game formats going forward. Existing rounds stay on your account forever.",
            },
            {
              q: 'Why do you use Buy Me a Coffee for payments?',
              a: "Buy Me a Coffee handles all the billing complexity so we can focus on building a great golf app. It's secure, trusted, and easy to manage.",
            },
          ].map(({ q, a }) => (
            <div key={q} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{q}</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
