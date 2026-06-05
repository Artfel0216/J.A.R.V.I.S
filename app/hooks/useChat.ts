'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Message } from '@/types'

export function useChat(initialConversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId)
  
  const abortRef = useRef<AbortController | null>(null)
  
  // Refs de sincronização para blindar o useCallback contra re-criações desnecessárias
  const conversationIdRef = useRef(conversationId)
  const isLoadingRef = useRef(isLoading)

  // Mantém as referências sempre atualizadas com o estado do React
  useEffect(() => {
    conversationIdRef.current = conversationId
  }, [conversationId])

  useEffect(() => {
    isLoadingRef.current = isLoading
  }, [isLoading])

  // Limpa requisições pendentes se o componente for desmontado do DOM
  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    // Validação usando a referência para evitar travas por closures antigas
    if (!content.trim() || isLoadingRef.current) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date(),
    }
    
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    const assistantId = crypto.randomUUID()
    setMessages(prev => [...prev, {
      id: assistantId, 
      role: 'assistant', 
      content: '', 
      createdAt: new Date(),
    }])

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content, 
          conversationId: conversationIdRef.current // Usa a referência imutável na renderização
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error('ERR_NETWORK_DISCONNECT')

      const reader = res.body?.getReader()
      if (!reader) throw new Error('ERR_STREAM_READ_FAILED')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        // 🚀 CORREÇÃO: Processa qualquer dado restante no buffer antes de encerrar
        if (done) {
          if (buffer.trim().startsWith('data: ')) {
            processLine(buffer, assistantId)
          }
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          processLine(line, assistantId)
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        console.error('[STARK MAIN_FRAME] Erro no pipeline de IA:', err)
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'Sistemas de processamento cognitivo sobrecarregados. Falha de uplink, Senhor.' }
            : m
        ))
      }
    } finally {
      setIsLoading(false)
    }
  }, []) // 🚀 CORREÇÃO: Array de dependências completamente limpo! O hook nunca é recriado.

  // Função utilitária interna para parsear linhas SSE de forma segura
  const processLine = (line: string, assistantId: string) => {
    if (!line.startsWith('data: ')) return
    try {
      const parsed = JSON.parse(line.slice(6))
      if (parsed.type === 'meta' && parsed.conversationId) {
        setConversationId(parsed.conversationId)
      }
      if (parsed.type === 'text' && parsed.content) {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: m.content + parsed.content } : m
        ))
      }
    } catch {
      // Ignora fragmentos JSON incompletos do streaming
    }
  }

  const loadConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`)
      if (!res.ok) return
      const data = await res.json()
      
      setConversationId(id)
      setMessages(data.messages.map((m: Message) => ({ 
        ...m, 
        createdAt: new Date(m.createdAt) 
      })))
    } catch (error) {
      console.error('[STARK MEMORY] Falha ao recuperar logs da ID:', id)
    }
  }, [])

  const newConversation = useCallback(() => {
    setConversationId(undefined)
    setMessages([])
  }, [])

  const prependAssistantMessage = useCallback((content: string) => {
    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      createdAt: new Date(),
    }
    setMessages(prev => [assistantMsg, ...prev]) // Insere no início do log (Prepend)
  }, [])

  const abort = useCallback(() => {
    abortRef.current?.abort()
    setIsLoading(false)
  }, [])

  return { 
    messages, 
    isLoading, 
    conversationId, 
    sendMessage, 
    loadConversation, 
    newConversation, 
    prependAssistantMessage, 
    abort 
  }
}