import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'A variável GEMINI_API_KEY não está configurada no servidor.' },
        { status: 500 }
      )
    }

    const { message, history = [] } = await req.json()

    const genAI = new GoogleGenerativeAI(apiKey)

    const systemMessage = history.find((m: any) => m.role === 'system')
    const systemInstruction = systemMessage 
      ? systemMessage.content 
      : 'Você é o J.A.R.V.I.S., um assistente virtual avançado integrado ao ecossistema Stark. Seja prestativo, preciso e use um tom tecnológico.'

    const contents = history
      .filter((m: any) => m.role !== 'system')
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    })

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction
    })

    const result = await model.generateContentStream({ contents })

    const encoder = new TextEncoder()
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text()
            if (chunkText) {
              const data = JSON.stringify({ type: 'text', content: chunkText })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          const doneData = JSON.stringify({ type: 'done' })
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`))
        } catch (streamError: any) {
          console.error('[STREAM ERROR]', streamError)
          const errorData = JSON.stringify({ type: 'error', content: streamError.message })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', 
      },
    })

  } catch (error: any) {
    console.error('[GEMINI ROUTE ERROR]', error)
    
    const status = error.status || 500
    const message = status === 429 
      ? 'Limite de requisições atingido. O J.A.R.V.I.S. precisa descansar por alguns segundos.' 
      : (error.message || 'Falha interna ao processar IA.')

    return NextResponse.json({ error: message }, { status })
  }
}