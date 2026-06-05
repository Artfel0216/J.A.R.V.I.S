'use client'

import { useState, useRef, KeyboardEvent, useEffect } from 'react'
import { Mic, MicOff, Send, Volume2, VolumeX, Square, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  conversationId?: string | null
  onStreamStart?: () => void
  onStreamChunk?: (text: string) => void
  onStreamDone?: (finalText: string) => void
  onMetaUpdate?: (conversationId: string) => void
  onError?: (error: string) => void
  
  // Controles de Voz recebidos do Pai
  onVoiceToggle: () => void
  onTtsToggle: () => void
  isListening: boolean
  isSpeaking: boolean
  ttsEnabled: boolean
  voiceSupported: boolean
}

export function InputBar({
  conversationId,
  onStreamStart,
  onStreamChunk,
  onStreamDone,
  onMetaUpdate,
  onError,
  onVoiceToggle,
  onTtsToggle,
  isListening,
  isSpeaking,
  ttsEnabled,
  voiceSupported
}: Props) {
  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cancela qualquer requisição ativa se o componente for desmontado
  useEffect(() => {
    return () => abortControllerRef.current?.abort()
  }, [])

  const handleSend = async () => {
    if (!value.trim() || isLoading) return

    const currentMessage = value.trim()
    setValue('')
    setIsLoading(true)
    onStreamStart?.()

    // Inicializa o AbortController para permitir cancelar a requisição instantaneamente
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          conversationId: conversationId || undefined
        }),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error('ReadableStream não suportado pelo servidor.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedResponse = ''

      // Processa o stream Server-Sent Events (SSE) vindo da API
      while (true) {
        const { value: chunk, done } = await reader.read()
        if (done) break

        const decodedChunk = decoder.decode(chunk, { stream: true })
        const lines = decodedChunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const rawJson = line.slice(6).trim()
              if (!rawJson) continue
              
              const parsed = JSON.parse(rawJson)

              if (parsed.type === 'meta' && parsed.conversationId) {
                onMetaUpdate?.(parsed.conversationId)
              } else if (parsed.type === 'text' && parsed.content) {
                accumulatedResponse += parsed.content
                onStreamChunk?.(parsed.content)
              } else if (parsed.type === 'done') {
                onStreamDone?.(accumulatedResponse)
              } else if (parsed.type === 'error') {
                throw new Error(parsed.content)
              }
            } catch (e) {
              // Ignora falhas parciais de parsing de linhas incompletas no buffer do stream
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('[Streaming Error]:', err)
        onError?.(err.message || 'Falha ao processar comando.')
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const handleAbort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
      onError?.('Conexão encerrada pelo comando do Operador.')
    }
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <footer className="w-full max-w-5xl mx-auto px-4 py-6 transition-all duration-500">
      {/* Container Principal Holográfico */}
      <div className={cn(
        "relative rounded-2xl border bg-slate-950/60 backdrop-blur-xl p-3 transition-all duration-500 shadow-2xl",
        isLoading ? "border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)]" : "border-slate-800/80 hover:border-slate-700/80",
        isListening && "border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
      )}>
        
        {/* Linha de Carregamento Animada (Scanning Line) */}
        {isLoading && (
          <div className="absolute top-0 left-4 right-4 h-px bg-linear-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
        )}

        <div className="flex items-center gap-3">
          {/* Botão de Microfone com Radar de Pulso */}
          <button
            onClick={onVoiceToggle}
            disabled={!voiceSupported}
            className={cn(
              'relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 border bg-slate-900/50',
              isListening
                ? 'border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)] bg-red-950/20'
                : 'border-slate-800 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 hover:scale-105 active:scale-95',
              !voiceSupported && 'opacity-20 cursor-not-allowed'
            )}
            title="Ativar Captação Biométrica de Voz"
          >
            {isListening && (
              <span className="absolute inset-0 rounded-xl bg-red-500/20 animate-ping opacity-75" />
            )}
            {isListening ? <MicOff size={18} className="animate-bounce" /> : <Mic size={18} />}
          </button>

          {/* Campo de Texto Interno */}
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={handleKey}
              disabled={isLoading}
              placeholder={isListening ? "J.A.R.V.I.S. está ouvindo..." : "Transmitir diretriz, Senhor..."}
              className="w-full h-12 bg-slate-950/40 border border-slate-800/80 rounded-xl px-4 text-sm text-slate-100 placeholder:text-slate-500 font-mono tracking-wide focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300 disabled:opacity-40"
              autoComplete="off"
              spellCheck={false}
            />
            {isLoading && (
              <Loader2 size={16} className="absolute right-4 text-cyan-400 animate-spin" />
            )}
          </div>

          {/* Controle de Text-to-Speech (Voz de Resposta) */}
          <button
            onClick={onTtsToggle}
            title={ttsEnabled ? 'Mutar Saída de Áudio' : 'Ativar Sintetizador de Voz'}
            className={cn(
              "w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300 bg-slate-900/50 active:scale-95",
              ttsEnabled 
                ? "border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]" 
                : "border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700"
            )}
          >
            {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Botão de Envio / Abortar Interativo */}
          {isLoading ? (
            <button
              onClick={handleAbort}
              className="h-12 px-5 bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20 rounded-xl font-mono text-xs tracking-widest transition-all duration-300 flex items-center gap-2 shrink-0 active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
            >
              <Square size={14} className="fill-red-400/20" /> INTERROMPER
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!value.trim()}
              className={cn(
                "h-12 px-5 font-mono text-xs tracking-widest transition-all duration-300 flex items-center gap-2 shrink-0 rounded-xl border bg-slate-900/50 active:scale-95",
                value.trim()
                  ? "border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  : "border-slate-800 text-slate-600 cursor-not-allowed opacity-40"
              )}
            >
              <Send size={12} /> PROCESSAR
            </button>
          )}
        </div>

        {/* Barra de Status Inferior Futurista */}
        <div className="flex justify-between items-center mt-3 px-1 text-[10px] font-mono tracking-wider text-slate-500">
          <div className="flex items-center gap-2">
            <span className={cn("w-1.5 h-1.5 rounded-full", isLoading ? "bg-cyan-400 animate-ping" : "bg-emerald-500")} />
            <span>SYSTEM LINK: READY</span>
            <span className="text-slate-700">|</span>
            <span>{voiceSupported ? 'AUDIO NODE: ACTIVE' : 'AUDIO NODE: OFFLINE'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {isSpeaking && (
              <span className="text-cyan-400 animate-pulse flex items-center gap-1.5">
                <span className="inline-block w-1 h-2 bg-cyan-400 animate-[bounce_1s_infinite_100ms]" />
                <span className="inline-block w-1 h-3 bg-cyan-400 animate-[bounce_1s_infinite_300ms]" />
                <span className="inline-block w-1 h-1 bg-cyan-400 animate-[bounce_1s_infinite_500ms]" />
                SINAL DE ÁUDIO ATIVO
              </span>
            )}
            <span className="text-slate-600 font-bold">SECURE ENCRYPTION // AES-256</span>
          </div>
        </div>
      </div>
    </footer>
  )
}