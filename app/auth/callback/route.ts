import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/round-history'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const user = data.user

      // Upsert public.users profile
      const { error: upsertError } = await supabase.from('users').upsert(
        {
          id: user.id,
          email: user.email!,
          phone: (user.user_metadata?.phone as string) ?? '',
          name: (user.user_metadata?.name as string) ?? '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

      if (upsertError) {
        console.error('Failed to upsert user profile:', upsertError.message)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
