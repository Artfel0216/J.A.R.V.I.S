'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Session } from 'next-auth'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@/hooks/useChat'
import { useSpeech } from '@/hooks/useSpeech'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { MessageBubble } from './MessageBubble'
import { InputBar } from './InputBar'
import { BootScreen } from './BootScreen'
import { SmartHomePanel } from './SmartHomePanel'
import { VisualizerMode } from '@/types'

function useHealthCheck(intervalMs = 15000) {
  const [isOnline, setIsOnline] = useState(true)

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
    const interval = setInterval(checkHealth, intervalMs)
    return () => clearInterval(interval)
  }, [intervalMs])

  return isOnline
}

const playSystemBeep = (type: 'boot' | 'send' = 'send') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.frequency.setValueAtTime(type === 'boot' ? 1200 : 800, ctx.currentTime)
    if (type === 'boot') {
      osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.1)
    }
    
    osc.type = 'sine'
    
    gain.gain.setValueAtTime(0.02, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.15)
  } catch (e) {
  }
}

const BackgroundHologram = React.memo(() => (
  <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
    <div 
      className="absolute inset-0 opacity-[0.06] mix-blend-screen" 
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(245, 158, 11, 0.4) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(220, 38, 38, 0.4) 1px, transparent 1px)
        `,
        backgroundSize: '45px 45px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)'
      }} 
    />
    <div 
      className="absolute inset-0 opacity-[0.03]" 
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(220, 38, 38, 0.4) 50%)',
        backgroundSize: '100% 4px',
      }} 
    />
    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] rounded-full bg-red-600/10 blur-[140px]" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[140px]" />
  </div>
))
BackgroundHologram.displayName = 'BackgroundHologram'

export function JarvisDashboard({ session }: { session: Session | null }) {
  const [booted, setBooted] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [vizMode, setVizMode] = useState<VisualizerMode>('idle')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const isOnline = useHealthCheck()

  const { 
    messages, 
    isLoading, 
    conversationId, 
    sendMessage, 
    loadConversation, 
    newConversation, 
    prependAssistantMessage, 
    abort,
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

  // Cleanup de TTS
  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [stopSpeaking])

  const scrollToBottom = useCallback((behavior: 'smooth' | 'instant' = 'smooth') => {
    chatEndRef.current?.scrollIntoView({ behavior })
  }, [])

  useEffect(() => {
    const mode = isLoading ? 'instant' : 'smooth'
    scrollToBottom(mode)
  }, [messages.length, isLoading, scrollToBottom])

  useEffect(() => {
    if (isListening) setVizMode('listening')
    else if (isLoading) setVizMode('thinking')
    else if (isSpeaking) setVizMode('speaking')
    else setVizMode('idle')
  }, [isListening, isLoading, isSpeaking])

  const lastAssistantRef = useRef('')
  useEffect(() => {
    if (!ttsEnabled || isLoading) return
    const last = messages.at(-1)
    if (!last || last.role !== 'assistant' || !last.content) return
    if (last.content === lastAssistantRef.current) return
    
    lastAssistantRef.current = last.content
    speak(last.content)
  }, [messages, isLoading, ttsEnabled, speak])

  const handleSend = useCallback(async (msg: string) => {
    playSystemBeep('send') 
    stopSpeaking()
    await sendMessage(msg)
  }, [sendMessage, stopSpeaking])

  const handleSelectConvo = useCallback((id: string) => {
    newConversation()
    loadConversation(id)
  }, [loadConversation, newConversation])

  const welcomeShown = useRef(false)
  useEffect(() => {
    if (!booted || welcomeShown.current || messages.length > 0) return
    welcomeShown.current = true
    playSystemBeep('boot') 
    prependAssistantMessage(
      'Bem-vindo, Senhor. Eu sou J.A.R.V.I.S., seu assistente operacional de inteligência artificial. Todos os módulos táticos e núcleos de processamento cognitivo da Stark Tower encontram-se plenamente calibrados para suas diretrizes.'
    )
  }, [booted, messages.length, prependAssistantMessage])

  async function handleVoiceToggle(): Promise<void> {
    if (!isSupported) return
    playSystemBeep('send')

    if (isListening) {
      stopListening()
    } else {
      startListening(async (text, isFinal) => {
        if (!isFinal) return
        stopSpeaking()
        await sendMessage(text)
      }, () => {
        setVizMode('idle')
      })
    }
  }

  const glowStyles = useMemo(() => {
    switch (vizMode) {
      case 'listening': return 'shadow-[0_0_40px_rgba(220,38,38,0.3)] border-red-500/40'
      case 'thinking': return 'shadow-[0_0_30px_rgba(245,158,11,0.3)] border-amber-500/40'
      case 'speaking': return 'shadow-[0_0_30px_rgba(245,158,11,0.5)] border-amber-400/60'
      case 'idle': default: return 'shadow-[0_0_15px_rgba(220,38,38,0.1)] border-red-900/30'
    }
  }, [vizMode])

  return (
    <div className="relative min-h-screen w-full bg-[#0a0202] text-red-50 overflow-hidden antialiased">
      
      {!booted && <BootScreen onDone={() => setBooted(true)} />}

      <BackgroundHologram />

      <SmartHomePanel />

      <AnimatePresence>
        {booted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 flex flex-col h-screen w-full overflow-hidden"
          >
            <div className="absolute top-20 left-4 font-mono text-[10px] text-amber-500/40 leading-tight pointer-events-none select-none z-50">
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}>SYS.CORE.INIT: OK</motion.div>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}>MK-III_ARMOR_LINK: ACTIVE</motion.div>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 }}>PWR_OUT: 100% | ARC_REACT: STABLE</motion.div>
            </div>

            <div className="absolute bottom-24 right-4 font-mono text-[10px] text-amber-500/40 leading-tight text-right pointer-events-none select-none z-50">
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 }}>TARGET_ACQUISITION: STANDBY</motion.div>
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.3 }}>LAT: 34.0205 N | LON: -118.8056 W</motion.div>
            </div>

            <Header session={session} isOnline={isOnline} />

            <div className="flex flex-1 w-full overflow-hidden">
              <Sidebar
                mode={vizMode}
                activeId={conversationId}
                onSelect={handleSelectConvo}
                onNew={newConversation}
              />

              <main className={`flex-1 flex flex-col bg-linear-to-b from-transparent to-red-950/10 overflow-hidden border-l transition-all duration-700 ease-in-out ${glowStyles}`}>
                
                <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-amber-600/50 hover:scrollbar-thumb-amber-500 scrollbar-track-transparent">
                  
                  {messages.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="flex-1 flex flex-col items-center justify-center text-center"
                    >
                      <div className="relative p-6 rounded-full border border-dashed border-amber-500/30 mb-4 bg-red-950/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                        <span className="text-3xl font-mono font-black tracking-[12px] text-amber-500/60 uppercase translate-x-1.5 select-none drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                          JARVIS
                        </span>
                      </div>
                      <h1 
                        className="text-xs font-mono tracking-[4px] text-amber-500/80 uppercase animate-pulse"
                        aria-live="polite"
                      >
                        Aguardando entrada de dados do Operador
                      </h1>
                    </motion.div>
                  )}

                  <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
                    <AnimatePresence>
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        >
                          <MessageBubble message={msg} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  <div ref={chatEndRef} />
                </div>

                <div className="relative z-20">
                  <InputBar
                    conversationId={conversationId}
                    onSubmit={handleSend}
                    onAbort={abort}
                    onVoiceToggle={handleVoiceToggle}
                    onTtsToggle={() => setTtsEnabled(prev => !prev)}
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    ttsEnabled={ttsEnabled}
                    voiceSupported={isSupported}
                  />
                </div>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}