'use client'

import { useEffect, useState, useCallback, useTransition } from 'react'
import { Conversation } from '@/types'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Visualizer } from './Visualizer'
import { VisualizerMode } from '@/types'
import { Trash2, Plus, RefreshCw, BarChart3, History, BrainCircuit } from 'lucide-react'

interface Props {
  mode: VisualizerMode
  activeId?: string | null
  onSelect: (id: string) => void
  onNew: () => void
}

interface ConvoItem extends Omit<Conversation, 'messages'> {
  messages: { content: string }[]
}

export function Sidebar({ mode, activeId, onSelect, onNew }: Props) {
  const [convos, setConvos] = useState<ConvoItem[]>([])
  const [metrics, setMetrics] = useState({ cpu: 22, mem: 47, net: 71 })
  const [isPending, startTransition] = useTransition()

  // 🚀 OTIMIZAÇÃO: Chamada de API encapsulada e reativa
  const loadConvos = useCallback(async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        // Transição suave para evitar trancadas na UI principal
        startTransition(() => {
          setConvos(data)
        })
      }
    } catch (error) {
      console.error('[STARK CLOUD] Falha ao sincronizar logs de dados:', error)
    }
  }, [])

  // Sincroniza sempre que carregar ou mudar o ID ativo
  useEffect(() => {
    loadConvos()
  }, [loadConvos, activeId])

  // Simulador de Telemetria Dinâmica (Diagnóstico Stark)
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.round(12 + Math.random() * 23),
        mem: Math.round(45 + Math.random() * 8),
        net: Math.round(60 + Math.random() * 25),
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Handler de exclusão otimizado com atualização otimista na UI
  const deleteConvo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Atualização otimista imediata para resposta instantânea ao clique
    setConvos(prev => prev.filter(c => c.id !== id))
    if (activeId === id) onNew()

    try {
      await fetch('/api/conversations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
    } catch (error) {
      console.error('[STARK CLOUD] Erro ao deletar registro:', error)
      loadConvos() // Reverte se falhar
    }
  }

  return (
    <aside className="w-72 flex flex-col gap-4 p-4 bg-slate-950/30 border-r border-slate-900/60 overflow-y-auto shrink-0 select-none scrollbar-none h-full relative z-20">
      
      {/* SEÇÃO 1: CORRELAÇÃO NEURAL (VISUALIZER VAD) */}
      <div className="relative p-4 rounded-2xl border border-slate-900/80 bg-slate-950/40 backdrop-blur-xl flex flex-col items-center gap-3 group transition-all duration-300 hover:border-cyan-500/20">
        <div className="flex items-center gap-1.5 self-start text-[9px] font-mono tracking-[2px] text-cyan-500/60 font-bold uppercase">
          <BrainCircuit size={12} className="text-cyan-500" />
          <span>INTERFACE NEURAL</span>
        </div>
        
        <div className="py-2 flex items-center justify-center w-full min-h-22.5">
          <Visualizer mode={mode} />
        </div>

        <div className="text-[9px] font-mono text-slate-500 tracking-[3px] uppercase font-semibold flex items-center gap-1.5">
          <span className={cn(
            "w-1 h-1 rounded-full",
            mode === 'idle' && "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]",
            mode === 'listening' && "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-ping",
            mode === 'thinking' && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"
          )} />
          {mode === 'idle' && 'AGUARDANDO DIRETRIZ'}
          {mode === 'listening' && 'CAPTANDO BIOMETRIA'}
          {mode === 'thinking' && 'PROCESSANDO RESPOSTA'}
          {mode === 'speaking' && 'SINTETIZANDO ÁUDIO'}
        </div>
      </div>

      {/* SEÇÃO 2: TELEMETRIA E DIAGNÓSTICO DO NÚCLEO */}
      <div className="p-4 rounded-2xl border border-slate-900/80 bg-slate-950/40 backdrop-blur-xl flex flex-col gap-3.5 transition-all duration-300 hover:border-cyan-500/10">
        <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-[2px] text-cyan-500/60 font-bold uppercase">
          <BarChart3 size={11} />
          <span>DIAGNÓSTICO CORE</span>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { id: 'cpu', label: 'FRAME_RATE_CPU', val: metrics.cpu, color: 'from-blue-600 to-cyan-400' },
            { id: 'mem', label: 'MEM_SYNAPTIC', val: metrics.mem, color: 'from-cyan-500 to-teal-400' },
            { id: 'net', label: 'STARK_LINK_NET', val: metrics.net, color: 'from-cyan-500 to-emerald-400' },
          ].map(m => (
            <div key={m.id} className="group/metric">
              <div className="flex justify-between text-[10px] font-mono mb-1.5 tracking-wide">
                <span className="text-slate-500 group-hover/metric:text-slate-400 transition-colors">{m.label}</span>
                <span className="text-cyan-400 font-bold tabular-nums drop-shadow-[0_0_4px_rgba(6,182,212,0.2)]">{m.val}%</span>
              </div>
              <div className="h-1 bg-slate-950 border border-slate-900/60 rounded-full overflow-hidden p-[0.5px]">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000 ease-out bg-linear-to-r", m.color)}
                  style={{ width: `${m.val}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO 3: HISTÓRICO DE DIRETRIZES */}
      <div className="p-4 rounded-2xl border border-slate-900/80 bg-slate-950/40 backdrop-blur-xl flex-1 flex flex-col min-h-0 transition-all duration-300 hover:border-cyan-500/10">
        <div className="flex items-center justify-between mb-3.5 shrink-0">
          <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-[2px] text-cyan-500/60 font-bold uppercase">
            <History size={11} />
            <span>HISTÓRICO_LOG</span>
          </div>
          <button 
            onClick={onNew} 
            className="text-[9px] font-mono font-bold tracking-widest text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/5 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 active:scale-95"
            title="Inicializar Nova Sequência"
          >
            <Plus size={10} /> NOVA
          </button>
        </div>

        {/* Viewport dos Itens de Log */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
          {isPending && convos.length === 0 && (
            <div className="flex items-center justify-center py-6 text-slate-600 animate-spin">
              <RefreshCw size={14} />
            </div>
          )}

          {convos.length === 0 && !isPending && (
            <div className="text-[10px] font-mono text-slate-600 text-center py-6 italic border border-dashed border-slate-900 rounded-xl">
              NENHUM REGISTRO ENCONTRADO
            </div>
          )}

          {convos.map(c => {
            const isSelected = activeId === c.id
            return (
              <div
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  'group relative flex flex-col gap-1 p-3 rounded-xl cursor-pointer border transition-all duration-300 text-left select-none overflow-hidden',
                  isSelected
                    ? 'border-cyan-500/30 bg-cyan-950/10 shadow-[0_0_15px_rgba(6,182,212,0.05)]'
                    : 'border-slate-900/60 hover:border-slate-800 hover:bg-slate-900/20'
                )}
              >
                {/* Indicador Lateral Ativo */}
                {isSelected && (
                  <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-cyan-400 rounded-r shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                )}

                <div className={cn(
                  "text-[11px] font-mono font-medium truncate pr-6 tracking-wide transition-colors",
                  isSelected ? "text-cyan-400" : "text-slate-300 group-hover:text-slate-200"
                )}>
                  {c.title || 'Diretriz sem Título'}
                </div>
                
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                  {formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true, locale: ptBR })}
                </div>

                {/* Botão Deletar Invisível de Alta Fusão */}
                <button
                  onClick={(e) => deleteConvo(c.id, e)}
                  className="absolute right-2.5 top-[50%] translate-y-[-50%] opacity-0 group-hover:opacity-100 p-1.5 rounded-lg border border-transparent text-slate-600 hover:text-red-400 hover:border-red-500/20 hover:bg-red-950/20 transition-all duration-200"
                  title="Expurgar Registro"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}