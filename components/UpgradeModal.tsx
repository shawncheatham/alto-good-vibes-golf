'use client'

import { useEffect } from 'react'

interface Props {
  tier: 'grounds_keeper' | 'players_club'
  gameName: string
  userEmail?: string
  onClose: () => void
}

function bmcUrl(levelId: number, email?: string) {
  const base = `https://www.buymeacoffee.com/golfvibes/membership?level=${levelId}`
  if (email) return `${base}&email=${encodeURIComponent(email)}`
  return base
}

export default function UpgradeModal({ tier, gameName, userEmail, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const isGroundsKeeper = tier === 'grounds_keeper'
  const levelId = isGroundsKeeper ? 309472 : 309474
  const upgradeUrl = bmcUrl(levelId, userEmail)

  const title = isGroundsKeeper ? 'Unlock Standard Games' : 'Unlock Custom Games'
  const icon = isGroundsKeeper ? '☕' : '⛳'
  const price = isGroundsKeeper ? '$3' : '$8'
  const tierLabel = isGroundsKeeper ? 'Grounds Keeper' : 'Players Club'
  const accentColor = isGroundsKeeper ? '#ff6b35' : '#2d7a4f'

  const benefits = isGroundsKeeper
    ? ['Nassau', 'Match Play', 'Stableford', 'All future standard games', 'Priority support']
    : ['Custom game formats', 'Side bets', 'Early access to new features', 'Everything in Grounds Keeper', 'Priority support']

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 20,
          padding: 32,
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: 20,
            color: '#9ca3af',
            cursor: 'pointer',
            padding: 4,
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Icon */}
        <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 24,
            fontWeight: 700,
            color: '#1a4d2e',
            marginBottom: 8,
          }}
        >
          {title}
        </h2>

        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
          <strong style={{ color: '#374151' }}>{gameName}</strong> requires the{' '}
          <strong style={{ color: accentColor }}>{tierLabel}</strong> plan.
        </p>

        {/* Pricing */}
        <div
          style={{
            background: '#f9fafb',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 20,
            border: `2px solid ${accentColor}20`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>{price}</span>
            <span style={{ fontSize: 14, color: '#6b7280' }}>/mo</span>
          </div>
          <p style={{ fontSize: 12, color: accentColor, fontWeight: 600, margin: 0 }}>
            7-day free trial — cancel anytime
          </p>
        </div>

        {/* Benefits */}
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
          {benefits.map(b => (
            <li
              key={b}
              style={{
                fontSize: 14,
                color: '#374151',
                padding: '6px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ color: accentColor, fontWeight: 700 }}>✓</span>
              {b}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href={upgradeUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            width: '100%',
            padding: '14px',
            background: accentColor,
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'center',
            textDecoration: 'none',
            boxSizing: 'border-box',
            marginBottom: 12,
          }}
        >
          Upgrade to {tierLabel}
        </a>

        {/* Maybe Later */}
        <button
          onClick={onClose}
          style={{
            display: 'block',
            width: '100%',
            padding: '12px',
            background: 'none',
            border: 'none',
            fontSize: 14,
            color: '#9ca3af',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Maybe Later
        </button>
      </div>
    </div>
  )
}
