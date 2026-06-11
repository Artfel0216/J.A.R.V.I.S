'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { Message } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Volume2, RotateCcw } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'

const playActionBeep = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.setValueAtTime(1500, ctx.currentTime)
    osc.type = 'square'
    gain.gain.setValueAtTime(0.01, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  } catch (e) {
  }
}

const GlitchStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes hudGlitch {
      0% { opacity: 1; transform: translate(0) }
      2% { opacity: 0.8; transform: translate(-1px, 1px) }
      4% { opacity: 1; transform: translate(1px, -1px) }
      6% { opacity: 0.9; transform: translate(0) }
      8% { opacity: 1; transform: translate(1px, 1px) }
      10% { opacity: 1; transform: translate(0) }
      100% { opacity: 1; transform: translate(0) }
    }
    .animate-hud-glitch { animation: hudGlitch 6s infinite random; }
  `}} />
)

const MessageBubbleComponent = ({ message }: { message: Message }) => {
  const isJarvis = message.role === 'assistant'
  const [copied, setCopied] = useState(false)

  const formattedTime = useMemo(() => {
    try {
      if (!message.createdAt) return format(new Date(), 'HH:mm:ss', { locale: ptBR })
      return format(new Date(message.createdAt), 'HH:mm:ss', { locale: ptBR })
    } catch {
      return '--:--:--'
    }
  }, [message.createdAt])

  const handleCopy = useCallback(() => {
    playActionBeep()
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [message.content])

  const handleSpeak = useCallback(() => {
    playActionBeep()
    const utterance = new SpeechSynthesisUtterance(message.content)
    utterance.lang = 'pt-BR'
    window.speechSynthesis.speak(utterance)
  }, [message.content])

  return (
    <article 
      className={cn(
        'relative flex gap-4 max-w-[90%] md:max-w-[85%] group select-text mb-4',
        isJarvis ? 'self-start' : 'self-end flex-row-reverse'
      )}
    >
      <GlitchStyles />

      <motion.div 
        whileHover={{ scale: 1.08, rotate: isJarvis ? 0 : 5 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-mono font-black shrink-0 mt-0.5 shadow-lg select-none cursor-default transition-colors duration-300 z-10',
          isJarvis
            ? 'border-amber-500/50 text-amber-400 bg-amber-950/30 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-hud-glitch group-hover:border-amber-400/80'
            : 'border-red-500/50 text-red-400 bg-red-950/30 shadow-[0_0_15px_rgba(220,38,38,0.2)] group-hover:border-red-400/80'
        )}
      >
        {isJarvis ? 'J' : 'S'}
      </motion.div>

      <div className="flex flex-col gap-1.5 max-w-full relative">
        
        <div 
          className={cn(
            'text-[9px] font-mono tracking-[2px] uppercase font-bold opacity-70 select-none animate-hud-glitch',
            isJarvis ? 'text-amber-500/90' : 'text-red-500/90 text-right'
          )}
        >
          {isJarvis ? '// J.A.R.V.I.S.' : '// Senhor Stark'}
        </div>

        <div className="relative">
          
          {isJarvis && message.content && (
            <div className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-1 z-20 translate-y-2 group-hover:translate-y-0">
              <div className="bg-red-950/90 border border-amber-500/30 backdrop-blur-md rounded-md p-1 shadow-[0_0_10px_rgba(245,158,11,0.2)] flex items-center gap-1">
                <button onClick={handleSpeak} className="p-1.5 text-amber-500/60 hover:text-amber-400 hover:bg-amber-900/40 rounded transition-colors" title="Reproduzir Áudio">
                  <Volume2 size={14} />
                </button>
                <button className="p-1.5 text-amber-500/60 hover:text-amber-400 hover:bg-amber-900/40 rounded transition-colors" title="Regerar (Exemplo)">
                  <RotateCcw size={14} />
                </button>
                <button onClick={handleCopy} className="p-1.5 text-amber-500/60 hover:text-amber-400 hover:bg-amber-900/40 rounded transition-colors" title="Copiar">
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          )}

          <div 
            className={cn(
              'px-5 py-4 rounded-2xl text-[15px] leading-relaxed border transition-all duration-300 shadow-xl font-sans tracking-wide max-w-full overflow-hidden relative z-0',
              isJarvis
                ? 'bg-[#1a0505]/80 backdrop-blur-sm border-red-900/40 border-l-2 border-l-amber-500 text-amber-50/90 group-hover:border-red-800/60 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                : 'bg-red-950/20 backdrop-blur-sm border-red-900/50 border-r-2 border-r-red-500 text-red-50/90 group-hover:border-red-800/70 group-hover:shadow-[0_0_20px_rgba(220,38,38,0.1)]'
            )}
          >
            {message.content ? (
              <div className="wrap-break-word whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    strong: ({ children }) => (
                      <strong className="text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="text-red-300 italic">{children}</em>
                    ),
                    // 5. Terminal de Código Otimizado e Tematizado
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <div className="relative mt-4 mb-4 rounded-lg overflow-hidden border border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                          <div className="flex items-center justify-between px-4 py-1.5 bg-red-950/80 border-b border-red-900/50">
                            <span className="text-[10px] font-mono text-amber-500/70 uppercase tracking-widest">{match[1]}</span>
                          </div>
                          <SyntaxHighlighter
                            style={vscDarkPlus as any}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              background: 'rgba(20, 5, 5, 0.8)', 
                              padding: '1rem',
                              fontSize: '0.85rem',
                            }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className="bg-red-900/40 text-amber-300 border border-red-500/30 px-1.5 py-0.5 rounded font-mono text-xs mx-0.5 inline-block" {...props}>
                          {children}
                        </code>
                      )
                    },
                    p: ({ children }) => <p className="m-0 mb-3 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside marker:text-amber-600 mb-3">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside marker:text-amber-600 mb-3">{children}</ol>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex gap-1.5 items-center py-2 px-1" aria-label="Processando diretriz">
                {[0, 150, 300].map(d => (
                  <span 
                    key={d} 
                    className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-bounce" 
                    style={{ animationDelay: `${d}ms`, animationDuration: '0.8s' }} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div 
          className={cn(
            "text-[9px] font-mono text-red-700/60 px-1 uppercase tracking-wider select-none",
            !isJarvis && "text-right"
          )}
        >
          <span>{formattedTime}</span>
          <span className="text-red-900/50 font-bold ml-1">
            {isJarvis ? '// TOWER_NODE_ACK' : '// STARK_CORE_SEND'}
          </span>
        </div>
      </div>
    </article>
  )
}

export const MessageBubble = React.memo(MessageBubbleComponent, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.role === nextProps.message.role
  )
})