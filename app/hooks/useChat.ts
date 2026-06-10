import { useState, useRef, useCallback, useEffect } from 'react'
import { Message } from '@/types'

export function useChat(initialConversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId)
  
  const abortRef = useRef<AbortController | null>(null)
  const conversationIdRef = useRef(conversationId)
  const isLoadingRef = useRef(isLoading)
  const messagesRef = useRef(messages) 

  useEffect(() => {
    conversationIdRef.current = conversationId
  }, [conversationId])

  useEffect(() => {
    isLoadingRef.current = isLoading
  }, [isLoading])

  useEffect(() => {
    messagesRef.current = messages 
  }, [messages])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoadingRef.current) return

    if (abortRef.current) {
      abortRef.current.abort()
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date(),
    }
    
    const assistantId = crypto.randomUUID()
    const assistantMsg: Message = {
      id: assistantId, 
      role: 'assistant', 
      content: '', 
      createdAt: new Date(),
    }

    const currentHistory = messagesRef.current

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setIsLoading(true)

    abortRef.current = new AbortController()

    const processLine = (rawLine: string) => {
      const line = rawLine.trim()
      if (!line || !line.startsWith('data: ')) return
      
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

        if (parsed.type === 'error' && parsed.content) {
          throw new Error(parsed.content)
        }
      } catch (err) {
        if (err instanceof Error && err.message) throw err

      }

    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content, 
          conversationId: conversationIdRef.current,
          history: currentHistory 
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || `Erro de comunicação com o servidor (${res.status})`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('ERR_STREAM_READ_FAILED')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          if (buffer.trim()) {
            processLine(buffer)
          }
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split(/\r?\n/)
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          processLine(line)
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        console.error('[STARK MAIN_FRAME] Erro no pipeline de IA:', err)
        const errorMessage = (err as Error).message
        
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: `Sistemas sobrecarregados. Nota: ${errorMessage}` }
            : m
        ))
      }
    } finally {
      setIsLoading(false)
    }
  }, []) 

  const loadConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`)
      if (!res.ok) return
      const data = await res.json()
      
      setConversationId(id)
      setMessages(data.messages.map((m: Message) => ({ 
        ...m, 
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
    setMessages(prev => [assistantMsg, ...prev]) 
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