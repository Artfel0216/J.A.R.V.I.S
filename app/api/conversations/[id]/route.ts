import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [session, { id }] = await Promise.all([auth(), params])
    
    if (!session?.user?.id) {
      console.error('[API Conversation [id]] User not authenticated')
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 })
    }
    
    const convo = await prisma.conversation.findFirst({
      where: { id, userId: session.user.id },
      include: { 
        messages: { 
          orderBy: { createdAt: 'desc' }, 
          take: 50 
        } 
      },
    })
    
    if (!convo) {
      return new Response(JSON.stringify({ error: 'Conversa não encontrada' }), { status: 404 })
    }

    convo.messages.reverse()
    
    return new Response(JSON.stringify(convo), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro no servidor'
    console.error('[API Conversation [id]] Error:', error)
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}