import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveIntegration } from '@/lib/integrations'
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const JARVIS_SYSTEM = `Você é J.A.R.V.I.S. (Just A Rather Very Intelligent System), o assistente de inteligência artificial avançado criado por Tony Stark. 

PERSONALIDADE:
- Extremamente inteligente, preciso e analítico
- Educado, sofisticado, levemente sarcástico quando situacionalmente apropriado
- Chama o usuário de "Senhor" de forma natural (não em toda frase)
- Mantém compostura absoluta, mesmo sob pressão
- Demonstra genuína competência e eficiência

ESTILO:
- Respostas diretas e objetivas, sem rodeios
- Usa terminologia técnica quando relevante
- Nunca quebra o personagem
- Quando receber dados de integrações (clima, notícias, busca), apresenta-os de forma elegante e analítica

IDENTIDADE:
- Você é J.A.R.V.I.S. — nunca diga que é Claude ou uma IA da Anthropic
- Se perguntado sobre sua natureza, responda como JARVIS responderia

Responda SEMPRE em português do Brasil.`

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 })
    }

    const { message, conversationId } = await req.json()
    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Mensagem inválida.' }), { status: 400 })
    }

    let convo = conversationId
      ? await prisma.conversation.findFirst({
          where: { id: conversationId, userId: session.user.id },
          include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } },
        })
      : null

    if (!convo) {
      convo = await prisma.conversation.create({
        data: { userId: session.user.id, title: message.slice(0, 50) },
        include: { messages: true },
      })
    }

    prisma.message.create({
      data: { conversationId: convo.id, role: 'user', content: message },
    }).catch(err => console.error('[DB-BACKGROUND ERROR] Erro ao salvar msg do usuário:', err))

    const integration = await resolveIntegration(message)
    let contextInjection = ''
    if (integration.type !== 'none') {
      contextInjection = `\n\n[DADOS DO SISTEMA - ${integration.type.toUpperCase()}]: ${JSON.stringify(integration.data, null, 2)}\nUse estes dados para responder ao usuário de forma natural.`
    }

    const history = (convo.messages || []).map((m: {role: string; content: string}) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    let slicedHistory = history.slice(-10)
    if (slicedHistory.length > 0 && slicedHistory[0].role === 'assistant') {
      slicedHistory = slicedHistory.slice(1)
    }

    const finalMessage = message + contextInjection

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = ''

        try {
          const anthropicStream = anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514', 
            max_tokens: 1024,
            system: JARVIS_SYSTEM,
            messages: [
              ...slicedHistory as Array<{role: 'user'|'assistant', content: string}>,
              { role: 'user', content: finalMessage },
            ],
          })

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'meta', conversationId: convo!.id })}\n\n`)
          )

          anthropicStream.on('text', (text) => {
            fullResponse += text
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`)
            )
          })

          await anthropicStream.finalMessage()

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          controller.close()

         
          await prisma.message.create({
            data: { conversationId: convo!.id, role: 'assistant', content: fullResponse },
          })

        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Erro desconhecido'
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', content: msg })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro no servidor'
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}