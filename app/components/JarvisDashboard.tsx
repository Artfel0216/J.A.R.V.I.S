'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Session } from 'next-auth'
import { useChat } from '@/hooks/useChat'
import { useSpeech } from '@/hooks/useSpeech'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { MessageBubble } from './MessageBubble'
import { InputBar } from './InputBar'
import { BootScreen } from './BootScreen'
import { VisualizerMode } from '@/types'
import { cn } from '@/lib/utils'

export function JarvisDashboard({ session }: { session: Session | null }) {
  const [booted, setBooted] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [vizMode, setVizMode] = useState<VisualizerMode>('idle')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const { 
    messages, 
    isLoading, 
    conversationId, 
    sendMessage, 
    loadConversation, 
    newConversation, 
    prependAssistantMessage, 
  } = useChat()
  
  const { 
    speak, 
    stopSpeaking, 
    startListening, 
    stopListening, 
    isListening, 
    isSpeaking, 
    isSupported 
  } = useSpeech()

  // 🚀 OTIMIZAÇÃO 1: Scroll instantâneo e inteligente baseado na frequência de mutação
  const scrollToBottom = useCallback((behavior: 'smooth' | 'instant' = 'smooth') => {
    chatEndRef.current?.scrollIntoView({ behavior })
  }, [])

  useEffect(() => {
    // Quando as mensagens mudam rápido (durante o stream), um scroll instantâneo consome menos CPU
    const mode = isLoading ? 'instant' : 'smooth'
    scrollToBottom(mode)
  }, [messages.length, isLoading, scrollToBottom])

  // 🚀 OTIMIZAÇÃO 2: Consolidação reativa dos modos do Reator HUD (Visualizer)
  useEffect(() => {
    if (isListening) setVizMode('listening')
    else if (isLoading) setVizMode('thinking')
    else if (isSpeaking) setVizMode('speaking')
    else setVizMode('idle')
  }, [isListening, isLoading, isSpeaking])

  // 🚀 OTIMIZAÇÃO 3: Proteção de disparo de áudio duplicado (Text-To-Speech Guardian)
  const lastAssistantRef = useRef('')
  useEffect(() => {
    if (!ttsEnabled || isLoading) return
    const last = messages.at(-1)
    if (!last || last.role !== 'assistant' || !last.content) return
    if (last.content === lastAssistantRef.current) return
    
    lastAssistantRef.current = last.content
    speak(last.content)
  }, [messages, isLoading, ttsEnabled, speak])

  // Health check sutil periódico
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health', { signal: AbortSignal.timeout(3000) }).catch(() => null)
        setIsOnline(!!res?.ok)
      } catch { 
        setIsOnline(false) 
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 15000) // Verifica a integridade a cada 15s
    return () => clearInterval(interval)
  }, [])

  const handleSend = useCallback(async (msg: string) => {
    stopSpeaking()
    await sendMessage(msg)
  }, [sendMessage, stopSpeaking])

  // Callbacks reativos integrados diretamente à arquitetura de Stream do InputBar
  const handleStreamChunk = useCallback((text: string) => {
    // Caso use o pipeline direto do InputBar
  }, [])

  const handleStreamDone = useCallback((finalText: string) => {
    // Finalização e salvamento concluído
  }, [])

  const handleMetaUpdate = useCallback((newId: string) => {
    if (conversationId !== newId) {
      loadConversation(newId)
    }
  }, [conversationId, loadConversation])

  const handleVoiceToggle = useCallback(() => {
    if (isListening) { 
      stopListening()
      return 
    }
    startListening(
      (text, isFinal) => {
        if (isFinal && text.trim()) {
          stopListening()
          handleSend(text.trim())
        }
      },
      () => setVizMode('idle')
    )
  }, [isListening, startListening, stopListening, handleSend])

  const handleSelectConvo = useCallback((id: string) => {
    newConversation()
    loadConversation(id)
  }, [loadConversation, newConversation])

  // Mensagem inicial de boas-vindas do J.A.R.V.I.S.
  const welcomeShown = useRef(false)
  useEffect(() => {
    if (!booted || welcomeShown.current || messages.length > 0) return
    welcomeShown.current = true
    prependAssistantMessage(
      'Bem-vindo, Senhor. Eu sou J.A.R.V.I.S., seu assistente operacional de inteligência artificial. Todos os módulos táticos e núcleos de processamento cognitivo da Stark Tower encontram-se plenamente calibrados para suas diretrizes.'
    )
  }, [booted, messages.length, prependAssistantMessage])

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-slate-100 overflow-hidden antialiased">
      
      {/* 🎬 ANIMAÇÃO DE BOOTUP CINEMATOGRÁFICA */}
      {!booted && <BootScreen onDone={() => setBooted(true)} />}

      {/* 🪐 CAMADA HOLOGRÁFICA TRIDIMENSIONAL DE BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Malha de Grade Dinâmica (Grid Layer) */}
        <div 
          className="absolute inset-0 opacity-[0.04] mix-blend-screen transition-opacity duration-1000" 
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '45px 45px',
            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)'
          }} 
        />
        {/* Linhas Intercaladas CRT (Scanlines Stark Industries) */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(6, 182, 212, 0.2) 50%)',
            backgroundSize: '100% 4px',
          }} 
        />
        {/* Iluminação de Brilho de Plasma de Fundo */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] rounded-full bg-cyan-500/5 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[140px]" />
      </div>

      {/* ESTRUTURA CORE DA INTERFACE */}
      <div className="relative z-10 flex flex-col h-screen w-full overflow-hidden">
        {/* Terminal Header */}
        <Header session={session} isOnline={isOnline} />

        {/* Corpo de Trabalho (Sidebar + Workspace Lateral) */}
        <div className="flex flex-1 w-full overflow-hidden">
          <Sidebar
            mode={vizMode}
            activeId={conversationId}
            onSelect={handleSelectConvo}
            onNew={newConversation}
          />

          {/* Área Principal de Comunicação */}
          <main className="flex-1 flex flex-col bg-linear-to-b from-transparent to-slate-950/20 overflow-hidden border-l border-slate-900/40">
            
            {/* Viewport de Mensagens */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
              
              {messages.length === 0 && booted && (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-[fadeIn_0.8s_ease-out]">
                  <div className="relative p-6 rounded-full border border-dashed border-cyan-500/10 mb-4 bg-slate-950/40">
                    <div className="absolute inset-2 rounded-full border border-cyan-500/5 animate-[ping_3s_infinite]" />
                    <span className="text-3xl font-mono font-black tracking-[12px] text-cyan-500/20 uppercase translate-x-1.5 select-none">
                      JARVIS
                    </span>
                  </div>
                  <h2 className="text-xs font-mono tracking-[4px] text-slate-500 uppercase">
                    Aguardando entrada de dados do Operador
                  </h2>
                </div>
              )}

              {/* Bolhas de Transmissão de Dados */}
              <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </div>
              
              <div ref={chatEndRef} />
            </div>

            {/* Central Terminal Input Bar */}
            <InputBar
              conversationId={conversationId}
              onStreamStart={() => setVizMode('thinking')}
              onStreamChunk={handleStreamChunk}
              onStreamDone={handleStreamDone}
              onMetaUpdate={handleMetaUpdate}
              onVoiceToggle={handleVoiceToggle}
              onTtsToggle={() => setTtsEnabled(prev => !prev)}
              isListening={isListening}
              isSpeaking={isSpeaking}
              ttsEnabled={ttsEnabled}
              voiceSupported={isSupported}
            />
          </main>
        </div>
      </div>
    </div>
  )
}