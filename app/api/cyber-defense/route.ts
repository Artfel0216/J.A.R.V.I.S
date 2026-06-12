import { NextResponse } from 'next/server'
import { getHoneypotStatus, triggerCleanSlate, getCleanSlateStatus, deactivateCleanSlate, blockIntruder, getNetworkThreatScore } from '@/lib/cyber-defense'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'honeypot'

  try {
    switch (type) {
      case 'honeypot':
        return NextResponse.json(await getHoneypotStatus())
      case 'clean-slate':
        return NextResponse.json(await getCleanSlateStatus())
      case 'threat-score':
        return NextResponse.json(await getNetworkThreatScore())
      default:
        return NextResponse.json(await getHoneypotStatus())
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, ...params } = body

    switch (action) {
      case 'triggerCleanSlate':
        return NextResponse.json(await triggerCleanSlate())
      case 'deactivateCleanSlate':
        return NextResponse.json(await deactivateCleanSlate(params.biometricVerified, params.password))
      case 'blockIntruder':
        return NextResponse.json(await blockIntruder(params.macAddress))
      default:
        return NextResponse.json({ error: 'Ação não reconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
