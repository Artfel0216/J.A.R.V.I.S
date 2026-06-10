import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [session, { id }] = await Promise.all([auth(), params])
    
    if (!session?.user?.id) {
      console.error('[STARK SECURITY] Tentativa de acesso bloqueada: Usuário não autenticado.')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
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
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
    }

    const chronologicalMessages = [...convo.messages].reverse()
    
    return NextResponse.json(
      {
        ...convo,
        messages: chronologicalMessages
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    console.error('[STARK MEMORY ERROR] Falha catastrófica ao recuperar registros do banco:', error)
    
    return NextResponse.json({ error: message }, { status: 500 })
  }
}