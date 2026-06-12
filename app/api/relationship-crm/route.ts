import { NextResponse } from 'next/server'
import { getContactReminders, summarizeConversation, getUpcomingEvents, sendGreetingMessage } from '@/lib/relationship-crm'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'contacts'
  const groupName = searchParams.get('group') || ''

  try {
    switch (type) {
      case 'contacts':
        return NextResponse.json(await getContactReminders())
      case 'events':
        return NextResponse.json(await getUpcomingEvents())
      case 'summary':
        return NextResponse.json(await summarizeConversation(groupName || 'Grupo da Familia'))
      default:
        return NextResponse.json(await getContactReminders())
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, contactName } = body

    switch (action) {
      case 'greet':
        return NextResponse.json(await sendGreetingMessage(contactName || ''))
      default:
        return NextResponse.json({ error: 'Acao desconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
