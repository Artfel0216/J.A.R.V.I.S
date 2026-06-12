import { NextResponse } from 'next/server'
import { searchKnowledge, checkDeepfake } from '@/lib/second-brain'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'search'
  const query = searchParams.get('query') || ''

  try {
    switch (type) {
      case 'search':
        return NextResponse.json(await searchKnowledge(query))
      default:
        return NextResponse.json(await searchKnowledge(query))
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, urlOrText } = body

    switch (action) {
      case 'deepfake':
        return NextResponse.json(await checkDeepfake(urlOrText || ''))
      default:
        return NextResponse.json({ error: 'Acao desconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
