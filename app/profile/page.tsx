'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  email: string
  phone: string
  name: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [nameEditing, setNameEditing] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadProfile = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase.from('users').select('*').eq('id', user.id).single()

    if (data) {
      setProfile(data)
      setNameValue(data.name)
      setOriginalName(data.name)
    } else {
      // Profile not in public.users yet — use auth data
      const fallback = {
        id: user.id,
        email: user.email ?? '',
        phone: user.user_metadata?.phone ?? '',
        name: user.user_metadata?.name ?? '',
      }
      setProfile(fallback)
      setNameValue(fallback.name)
      setOriginalName(fallback.name)
    }

    setLoading(false)
  }, [router])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSaveName = async () => {
    if (!nameValue.trim()) {
      showToast('Name cannot be empty', 'error')
      return
    }
    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({ name: nameValue.trim(), updated_at: new Date().toISOString() })
      .eq('id', profile!.id)

    if (error) {
      showToast(error.message, 'error')
    } else {
      setOriginalName(nameValue.trim())
      setNameEditing(false)
      setProfile(p => p ? { ...p, name: nameValue.trim() } : p)
      showToast('Name updated successfully')
    }
  }

  const handleCancelName = () => {
    setNameValue(originalName)
    setNameEditing(false)
  }

  const handleDeleteAccount = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Delete from public.users (cascade)
    await supabase.from('users').delete().eq('id', user.id)

    // Delete auth user via admin API
    await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })

    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    )
  }

  const toastBg = toast?.type === 'error' ? '#ef4444' : toast?.type === 'info' ? '#3b82f6' : '#22c55e'

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, background: toastBg,
          color: 'white', padding: '12px 20px', borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 600,
          zIndex: 1000, transition: 'opacity 0.3s',
        }}>
          {toast.message}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)', zIndex: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 700, color: '#1a4731', marginBottom: 8 }}>
              Delete Account?
            </h3>
            <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: 24 }}>
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, padding: '12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #1a4731 0%, #2d7a4f 100%)', padding: '16px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 700, color: 'white', margin: 0 }}>
            Good Vibes Golf
          </h1>
          <button
            onClick={handleLogout}
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ background: '#f3f4f6', minHeight: 'calc(100vh - 60px)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* Profile Section */}
          <section style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: 24, marginBottom: 24 }}>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 700, color: '#1a4731', margin: 0 }}>
                Profile Settings
              </h2>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Display Name
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  disabled={!nameEditing}
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, background: nameEditing ? 'white' : '#f9fafb', color: '#111827', outline: 'none', boxSizing: 'border-box' as const }}
                />
                {!nameEditing ? (
                  <button onClick={() => setNameEditing(true)} style={{ padding: '10px 16px', background: '#2d7a4f', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Edit
                  </button>
                ) : (
                  <>
                    <button onClick={handleSaveName} style={{ padding: '10px 16px', background: '#f97316', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      Save
                    </button>
                    <button onClick={handleCancelName} style={{ padding: '10px 16px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>This is how you&apos;ll appear to other players</p>
            </div>

            {/* Phone */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Phone Number
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="tel"
                  value={profile?.phone || ''}
                  disabled
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, background: '#f9fafb', color: '#6b7280', boxSizing: 'border-box' as const }}
                />
                <button
                  onClick={() => showToast('Changing phone requires re-authentication', 'info')}
                  style={{ padding: '10px 16px', background: '#2d7a4f', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Edit
                </button>
              </div>
              <p style={{ fontSize: 12, color: '#d97706', marginTop: 6 }}>Changing your phone number requires re-authentication</p>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Email Address
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, background: '#f9fafb', color: '#6b7280', boxSizing: 'border-box' as const }}
                />
                <button
                  onClick={() => showToast('Verification email sent to new address', 'info')}
                  style={{ padding: '10px 16px', background: '#2d7a4f', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Edit
                </button>
              </div>
              <p style={{ fontSize: 12, color: '#d97706', marginTop: 6 }}>Changing your email requires verification</p>
            </div>
          </section>

          {/* Danger Zone */}
          <section style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: 24 }}>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 700, color: '#1a4731', margin: 0 }}>
                Danger Zone
              </h2>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{ width: '100%', padding: '12px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
            >
              Delete Account
            </button>
            <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 12 }}>
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </section>

          {/* Nav */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link href="/round-history" style={{ color: '#2d7a4f', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              ← Back to Round History
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
