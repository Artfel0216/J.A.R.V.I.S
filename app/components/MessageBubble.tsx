'use client'

import { Message } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useMemo } from 'react'

function formatContentSecure(text: string) {
  if (!text) return []
  
  // Regex para capturar Bold (**), Italic (*) e Inline Code (`)
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\n)/g
  const parts = text.split(regex)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="text-cyan-400 font-bold drop-shadow-[0_0_6px_rgba(34,211,238,0.2)]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="text-slate-300 italic">{part.slice(1, -1)}</em>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="bg-cyan-950/40 text-cyan-300 border border-cyan-500/20 px-1.5 py-0.5 rounded font-mono text-xs mx-0.5">
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part === '\n') {
      return <br key={index} />
    }
    return part
  })
}

export function MessageBubble({ message }: { message: Message }) {
  const isJarvis = message.role === 'assistant'

  // Memoiza o conteúdo formatado para evitar reprocessamento de texto em re-renders do chat
  const formattedContent = useMemo(() => {
    return formatContentSecure(message.content)
  }, [message.content])

  // Trata a data de criação com fallback seguro para evitar estouros de objeto Date
  const formattedTime = useMemo(() => {
    try {
      const date = message.createdAt ? new Date(message.createdAt) : new Date()
      return format(date, 'HH:mm:ss', { locale: ptBR })
    } catch {
      return '00:00:00'
    }
  }, [message.createdAt])

  return (
    <div className={cn(
      'flex gap-4 max-w-[85%] animate-[fadeIn_0.4s_ease-out] group select-text',
      isJarvis ? 'self-start' : 'self-end flex-row-reverse'
    )}>
      
      {/* AVATAR BIOMÉTRICO (J.A.R.V.I.S. vs OPERADOR) */}
      <div className={cn(
        'w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-mono font-black shrink-0 mt-0.5 transition-all duration-300 group-hover:scale-105 select-none',
        isJarvis
          ? 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
          : 'border-amber-500/40 text-amber-400 bg-amber-950/20 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
      )}>
        {isJarvis ? 'J' : 'S'}
      </div>

      {/* BLOCO DE TRANSMISSÃO DE DADOS */}
      <div className="flex flex-col gap-1.5">
        
        {/* Metadados de Identificação do Canal */}
        <div className={cn(
          'text-[8px] font-mono tracking-[2px] uppercase font-bold opacity-60',
          isJarvis ? 'text-cyan-500' : 'text-amber-500 text-right'
        )}>
          {isJarvis ? '// COGNITIVE_RESPONSE_SYS' : '// OPERATOR_DIRECTIVE'}
        </div>

        <div className={cn(
          'px-4 py-3 rounded-2xl text-sm leading-relaxed border transition-all duration-300 shadow-lg font-sans tracking-wide',
          isJarvis
            ? 'bg-slate-950/40 border-slate-900 border-l-2 border-l-cyan-500 text-slate-200 group-hover:border-slate-800 group-hover:border-l-cyan-400'
            : 'bg-amber-950/5 border-slate-900 border-r-2 border-r-amber-500 text-slate-200 group-hover:border-slate-800 group-hover:border-r-amber-400'
        )}>
          {message.content ? (
            <p className="whitespace-pre-wrap wrap-break-word">{formattedContent}</p>
          ) : (
            /* Pulsador de Processamento Quântico (Pensando...) */
            <div className="flex gap-1.5 items-center py-2 px-1">
              {[0, 150, 300].map(d => (
                <span 
                  key={d} 
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-bounce" 
                  style={{ animationDelay: `${d}ms`, animationDuration: '0.8s' }} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Timestamp de Telemetria Inferior */}
        <div className={cn(
          "text-[8px] font-mono text-slate-600 px-1 uppercase tracking-wider",
          !isJarvis && "text-right"
        )}>
          {formattedTime} <span className="text-slate-800">// TOWER_NODE_ACK</span>
        </div>
      </div>
    </div>
  )
}