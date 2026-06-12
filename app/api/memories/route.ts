import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { saveMemory, getMemory, searchMemories, getAllMemories, deleteMemory } from '@/lib/memory'

export async function GET(req: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const url = new URL(req.url)
    const key = url.searchParams.get('key')
    const query = url.searchParams.get('q')

    if (key) {
      const result = await getMemory(userId, key)
      return NextResponse.json(result)
    }
    if (query) {
      const result = await searchMemories(userId, query)
      return NextResponse.json(result)
    }
    const result = await getAllMemories(userId)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const { key, value, category } = await req.json()
    const result = await saveMemory(userId, key, value, category)
    return NextResponse.json(result, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const url = new URL(req.url)
    const key = url.searchParams.get('key')
    if (!key) return NextResponse.json({ error: 'Parâmetro "key" é obrigatório.' }, { status: 400 })

    const result = await deleteMemory(userId, key)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
