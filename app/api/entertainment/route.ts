import { NextResponse } from 'next/server'
import { syncAmbilight, startRPG, rpgChoice } from '@/lib/entertainment-immersion'

export async function GET() {
  return NextResponse.json({
    active: false,
    scenario: '',
    playerName: '',
    scene: '',
    choices: [],
    soundtrack: '',
    narrative: 'Nenhuma sessao de RPG ativa no momento. Peça ao J.A.R.V.I.S. para iniciar uma aventura!',
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, mode, mediaType, playerName, scenario, choiceIndex } = body

    switch (action) {
      case 'ambilight':
        return NextResponse.json(await syncAmbilight(mode || 'off', mediaType))
      case 'start-rpg':
        return NextResponse.json(await startRPG(playerName || 'Tony', scenario))
      case 'rpg-choice':
        return NextResponse.json(await rpgChoice(Number(choiceIndex) || 0))
      default:
        return NextResponse.json({ error: 'Acao desconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
