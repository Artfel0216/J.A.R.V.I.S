import { NextResponse } from 'next/server'
import { activateChaosMonkey, getChaosStatus, resolveChaosChallenge, getChaosScoreboard, listChaosChallenges } from '@/lib/chaos-monkey'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'status'

  try {
    switch (type) {
      case 'status':
        return NextResponse.json(await getChaosStatus())
      case 'scoreboard':
        return NextResponse.json(await getChaosScoreboard())
      case 'challenges':
        return NextResponse.json(await listChaosChallenges())
      default:
        return NextResponse.json(await getChaosStatus())
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
      case 'activate':
        return NextResponse.json(await activateChaosMonkey(params.difficulty))
      case 'resolve':
        return NextResponse.json(await resolveChaosChallenge(params.answer))
      default:
        return NextResponse.json({ error: 'Ação não reconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
