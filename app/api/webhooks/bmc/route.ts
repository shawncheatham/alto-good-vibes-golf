import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const BMC_LEVEL_MAP: Record<number, string> = {
  309472: 'grounds_keeper',
  309474: 'players_club',
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature-sha256') ?? ''
  const secret = process.env.BMC_WEBHOOK_SECRET ?? ''

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  const sigBuffer = Buffer.from(signature)
  const expBuffer = Buffer.from(expected)

  if (
    sigBuffer.length !== expBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expBuffer)
  ) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = payload.type as string
  const supporter = payload.supporter as Record<string, unknown> | undefined
  const email = supporter?.email as string | undefined

  if (!email) {
    return NextResponse.json({ error: 'No supporter email' }, { status: 400 })
  }

  const supabase = getAdminClient()

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, bmc_supporter_id')
    .eq('email', email)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const bmcSupporterId = (payload.supporter_id ?? payload.id) as string | undefined

  if (eventType === 'membership.started' || eventType === 'membership.updated') {
    // Idempotency: skip if already set to same supporter id
    if (bmcSupporterId && user.bmc_supporter_id === String(bmcSupporterId)) {
      return NextResponse.json({ ok: true })
    }

    const levelId = (payload.membership_level_id ?? (payload.membership as Record<string, unknown>)?.level_id) as number | undefined
    const tier = levelId ? (BMC_LEVEL_MAP[levelId] ?? 'grounds_keeper') : 'grounds_keeper'

    await supabase
      .from('users')
      .update({
        tier,
        bmc_supporter_id: bmcSupporterId ? String(bmcSupporterId) : user.bmc_supporter_id,
        tier_updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    return NextResponse.json({ ok: true })
  }

  if (eventType === 'membership.cancelled') {
    await supabase
      .from('users')
      .update({
        tier: 'free',
        tier_updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true, note: 'unhandled event type' })
}
