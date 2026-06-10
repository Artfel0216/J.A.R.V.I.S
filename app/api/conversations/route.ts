import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      console.error('[STARK SECURITY] Tentativa de ler arquivos de log sem credenciais válidas.')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    
    const rawLimit = parseInt(searchParams.get('limit') || '20', 10)
    const rawPage = parseInt(searchParams.get('page') || '1', 10)
    
    const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 20 : rawLimit), 50) 
    const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage)
    const skip = (page - 1) * limit

    const conversations = await prisma.conversation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: skip,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, 
        },
      },
    })

    return NextResponse.json(conversations, {
      status: 200,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro no servidor'
    console.error('[STARK ARCHIVE ERROR] Falha ao recuperar logs da memória central:', error)
    
    return NextResponse.json({ error: message }, { status: 500 })
  }
}