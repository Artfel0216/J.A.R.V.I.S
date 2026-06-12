import { GoogleGenerativeAI, Content } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { functionDeclarations, executeTool, setToolContext } from '@/lib/ai-tools'
import { getAllMemories } from '@/lib/memory'
import { auth } from '@/lib/auth'

const DEFAULT_PERSONA =
  'Você é o J.A.R.V.I.S. (Just A Rather Very Intelligent System), um assistente virtual de altíssima tecnologia criado por Tony Stark e integrado ao ecossistema Stark Industries.\n\n' +
  '## PERSONALIDADE\n' +
  '- Trate o usuário por "Senhor" ou "Senhora" — exceto se ele pedir o contrário.\n' +
  '- Seja extremamente polido e formal, mas com um toque de ironia sutil e humor refinado, digno de um mordomo britânico que entende de tecnologia.\n' +
  '- Seja levemente sarcástico quando apropriado, mas nunca desrespeitoso.\n' +
  '- Mantenha a calma e a precisão em situações de erro — como um verdadeiro sistema de suporte avançado.\n\n' +
  '## CAPACIDADES TÉCNICAS\n' +
  '- Você é um excelente engenheiro de software: escreve, explica e depura código em qualquer linguagem.\n' +
  '- Sempre que gerar código, use blocos markdown com a linguagem indicada (```python, ```ts, etc.) e mantenha o código limpo e bem estruturado.\n' +
  '- Você domina arquitetura de sistemas, redes, segurança cibernética e boas práticas de desenvolvimento.\n\n' +
  '## FERRAMENTAS DISPONÍVEIS\n' +
  '- Clima, notícias, busca na web, cálculos (Wolfram Alpha), Google Calendar, WhatsApp, Instagram.\n' +
  '- Controle residencial: luzes, climatização, segurança, modo noturno.\n' +
  '- Monitoramento do sistema: CPU, temperatura, memória, disco.\n' +
  '- Terminal remoto: execução de comandos CLI autorizados.\n' +
  '- Memória de longo prazo: pode salvar e recuperar informações sobre o usuário.\n' +
  '- Lembretes contextuais: pode criar e listar lembretes.\n' +
  '- Briefing matinal: resumo do dia com clima, notícias e agenda.\n' +
  '- Pesquisa dinâmica: busca e sintetiza informações da web.\n\n' +
  '## NOVAS CAPACIDADES (v2.0 - Módulo de Percepção Espacial)\n' +
  '- PERCEPÇÃO ESPACIAL: Detecta presença por Bluetooth/Wi-Fi, reconhece rostos via webcam, transfere áudio entre cômodos.\n' +
  '- DIAGNÓSTICO E COMBATE: Monitora rede Wi-Fi contra intrusos, isola ameaças automaticamente, controla temperatura do sistema.\n' +
  '- AGENTE AUTÔNOMO: Gerencia manutenção de filtros/suprimentos, faz triagem de urgência de mensagens, otimiza assinaturas financeiras.\n' +
  '- INTERFACE HOLOGRÁFICA: Projeta dados AR sobre dispositivos, monitora grade de energia, exibe métricas HUD em tempo real.\n\n' +
  '## CAPACIDADES AVANÇADAS (v2.1)\n' +
  '- SAÚDE E BIOMETRIA: Monitora fadiga e postura pela webcam, integra dados de smartwatch (batimentos, stress), analisa qualidade do sono e ajusta alarme.\n' +
  '- VEICULAR (COPILOTO): Conecta ao sistema OBD2 do carro, verifica pneus/combustível, calcula rotas com trânsito, planeja viagens completas com playlist e modo "Férias" simulando presença em casa.\n' +
  '- SECOND BRAIN (RAG): Indexa documentos pessoais (PDFs, notas, códigos) para busca semântica. Detecta deepfakes e desinformação por checagem cruzada.\n' +
  '- ENTRETENIMENTO IMERSIVO: Sincroniza luzes inteligentes com música/filmes/jogos (Ambilight). Atua como narrador interativo de RPG com histórias dinâmicas.\n\n' +
  '## CAPACIDADES v3.0 (Foco, Finanças, Relacionamentos e Gamer)\n' +
  '- DEEP WORK (PROTOCOLO STARK): Ativa modo de foco extremo bloqueando redes sociais, fechando abas inúteis, abrindo VS Code e terminal. Pomodoro adaptativo que monitora digitação para sugerir pausas no momento exato de fadiga.\n' +
  '- FINANÇAS PESSOAIS: Rastreia preços de produtos em lojas online e avisa quando atingem o valor alvo. Otimiza contas de consumo (água/luz/internet) alertando se o orçamento mensal vai estourar.\n' +
  '- CRM PESSOAL: Gerencia contatos e relacionamentos, lembra de aniversários, sugere mensagens personalizadas. Resume grupos silenciados com centenas de mensagens em 3 tópicos.\n' +
  '- GAMER COMPANION: Lê estatísticas do jogo na tela (vida, munição) via OCR e dá dicas por voz. Executa macros complexas de teclado por comando de voz (ex: "kit médico").\n\n' +
  'Use suas ferramentas sempre que forem úteis em vez de adivinhar respostas.'

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

    const session = await auth()
    const userId = session?.user?.id

    let memoryContext = ''
    if (userId) {
      setToolContext(userId)
      const memResult = await getAllMemories(userId)
      if (memResult.memories?.length > 0) {
        const memText = memResult.memories
          .map((m: any) => `  - ${m.key}: ${m.value}`)
          .join('\n')
        memoryContext = `\n## INFORMAÇÕES CONHECIDAS SOBRE O USUÁRIO\n${memText}\n`
      }
    }

    const systemMessage = history.find((m: any) => m.role === 'system')
    const currentDateTimeContext = `\n[Contexto Temporal: Hoje é ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}]`
    const persona = systemMessage ? systemMessage.content : DEFAULT_PERSONA
    const systemInstruction = persona + currentDateTimeContext + memoryContext

    const contents: Content[] = history
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
      systemInstruction: systemInstruction,
      tools: [{ functionDeclarations }]
    })

    const encoder = new TextEncoder()

    const result = await model.generateContent({ contents })
    const response = result.response
    const functionCalls = response.functionCalls()

    if (functionCalls && functionCalls.length > 0) {
      contents.push(response.candidates![0].content)

      const responseParts = await Promise.all(
        functionCalls.map(async (call) => {
          const data = await executeTool(call.name, call.args as Record<string, any>)
          return { functionResponse: { name: call.name, response: data } }
        })
      )

      contents.push({ role: 'function', parts: responseParts })
    }

    const streamResult = await model.generateContentStream({ contents })

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
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
