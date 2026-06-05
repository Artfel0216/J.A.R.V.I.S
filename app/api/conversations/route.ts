import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50) 
    const page = parseInt(searchParams.get('page') || '1', 10)
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

    return new Response(JSON.stringify(conversations), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro no servidor'
    console.error('[API Conversations] Error:', error)
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}