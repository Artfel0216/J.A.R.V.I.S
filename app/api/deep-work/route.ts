import { NextResponse } from 'next/server'
import { activateStarkProtocol, deactivateStarkProtocol, detectDistraction, getPomodoroStatus, startPomodoro, getWorkSessionStats } from '@/lib/deep-work'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'pomodoro'

  try {
    switch (type) {
      case 'pomodoro':
        return NextResponse.json(await getPomodoroStatus())
      case 'distraction':
        return NextResponse.json(await detectDistraction())
      case 'stats':
        return NextResponse.json(await getWorkSessionStats())
      default:
        return NextResponse.json(await getPomodoroStatus())
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body

    switch (action) {
      case 'activate-protocol':
        return NextResponse.json(await activateStarkProtocol())
      case 'deactivate-protocol':
        return NextResponse.json(await deactivateStarkProtocol())
      case 'start-pomodoro':
        return NextResponse.json(await startPomodoro())
      default:
        return NextResponse.json({ error: 'Acao desconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
