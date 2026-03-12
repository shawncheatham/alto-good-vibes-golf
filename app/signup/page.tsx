'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { phone, name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📧</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--gvg-grass-dark)', marginBottom: '8px' }}>
              Check your email
            </h2>
            <p style={{ color: 'var(--gvg-gray-600)', lineHeight: 1.6 }}>
              We sent a magic link to <strong>{email}</strong>. Click the link to create your account.
              <br /><br />
              <small style={{ color: 'var(--gvg-gray-500)' }}>
                Didn&apos;t receive it? Check your spam folder or{' '}
                <button
                  onClick={() => setSent(false)}
                  style={{ color: 'var(--gvg-grass)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  try again
                </button>
              </small>
            </p>
          </div>
        </div>
        <style>{authStyles}</style>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">Good Vibes Golf</div>
          <div className="auth-tagline">Track your rounds. Play better golf.</div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              className="form-input"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
            <div className="form-hint">We&apos;ll only use this to verify your account</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              className="form-input"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <div className="form-hint">This is how you&apos;ll appear to other players</div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-toggle">
          Already have an account?{' '}
          <Link href="/login">Log in</Link>
        </div>
      </div>
      <style>{authStyles}</style>
    </div>
  )
}

const authStyles = `
  .auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a4731 0%, #2d7a4f 100%);
    padding: 16px;
  }
  .auth-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    padding: 32px;
    width: 100%;
    max-width: 420px;
  }
  .auth-header {
    text-align: center;
    margin-bottom: 32px;
  }
  .auth-logo {
    font-family: 'Outfit', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #1a4731;
    margin-bottom: 8px;
  }
  .auth-tagline {
    font-size: 14px;
    color: #6b7280;
  }
  .form-group {
    margin-bottom: 20px;
  }
  .form-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
  }
  .form-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 16px;
    font-family: inherit;
    box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;
    outline: none;
  }
  .form-input:focus {
    border-color: #2d7a4f;
    box-shadow: 0 0 0 3px rgba(45,122,79,0.1);
  }
  .form-hint {
    font-size: 12px;
    color: #6b7280;
    margin-top: 6px;
  }
  .btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 12px 24px;
    background: #f97316;
    color: white;
    font-size: 16px;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s, transform 0.15s;
  }
  .btn-primary:hover:not(:disabled) {
    background: #ea6700;
    transform: translateY(-1px);
  }
  .btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  .auth-toggle {
    text-align: center;
    margin-top: 24px;
    font-size: 14px;
    color: #4b5563;
  }
  .auth-toggle a {
    color: #2d7a4f;
    font-weight: 600;
    text-decoration: none;
  }
  .auth-toggle a:hover {
    text-decoration: underline;
  }
  .error-message {
    background: #fef2f2;
    border: 1px solid #ef4444;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 16px;
    font-size: 14px;
    color: #ef4444;
  }
`
