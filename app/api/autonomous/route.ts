import { NextResponse } from 'next/server'
import { checkMaintenance, triageUrgency, optimizeFinances, filterSpam } from '@/lib/autonomous-agent'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'maintenance'

  try {
    switch (type) {
      case 'maintenance':
        return NextResponse.json(await checkMaintenance())
      case 'finance':
        return NextResponse.json(await optimizeFinances())
      default:
        return NextResponse.json(await checkMaintenance())
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, senderName, messageContent } = body

    switch (action) {
      case 'triage':
        return NextResponse.json(await triageUrgency(senderName || 'Desconhecido', messageContent || ''))
      case 'spam':
        return NextResponse.json(await filterSpam(messageContent || ''))
      default:
        return NextResponse.json({ error: 'Ação desconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
