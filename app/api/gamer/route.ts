import { NextResponse } from 'next/server'
import { readScreen, executeVoiceMacro, startGameSession, endGameSession, listMacros } from '@/lib/gamer-companion'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'macros'
  const game = searchParams.get('game') || ''
  const gameTitle = searchParams.get('gameTitle') || ''

  try {
    switch (type) {
      case 'macros':
        return NextResponse.json(await listMacros(game || undefined))
      case 'screen':
        return NextResponse.json(await readScreen(gameTitle || undefined))
      default:
        return NextResponse.json(await listMacros())
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, commandName, gameTitle, startTime } = body

    switch (action) {
      case 'macro':
        return NextResponse.json(await executeVoiceMacro(commandName || ''))
      case 'start-game':
        return NextResponse.json(await startGameSession(gameTitle || 'Jogo'))
      case 'end-game':
        return NextResponse.json(await endGameSession(startTime || ''))
      default:
        return NextResponse.json({ error: 'Acao desconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
