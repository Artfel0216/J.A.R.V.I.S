'use client'

import { useEffect, useState, useCallback, useTransition, useMemo, useRef, MouseEvent } from 'react'
import { Conversation, VisualizerMode } from '@/types'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Visualizer } from './Visualizer'
import { Trash2, Plus, RefreshCw, BarChart3, History, BrainCircuit, Search, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  mode: VisualizerMode
  activeId?: string | null
  onSelect: (id: string) => void
  onNew: () => void
}

interface ConvoItem extends Omit<Conversation, 'messages'> {
  messages: { content: string }[]
}

const playHUDFeedback = (type: 'select' | 'new' | 'delete' | 'overdrive') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    if (type === 'new') {
      osc.frequency.setValueAtTime(1200, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.1)
    } else if (type === 'overdrive') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(100, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.2)
      gain.gain.setValueAtTime(0.04, ctx.currentTime)
    } else if (type === 'delete') {
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15)
    } else {
      osc.frequency.setValueAtTime(1400, ctx.currentTime)
    }
    
    if (type !== 'overdrive') {
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.015, ctx.currentTime)
    }
    
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.25)
  } catch (e) {}
}

const RadarRing = ({ mode }: { mode: VisualizerMode }) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <motion.svg 
      viewBox="0 0 200 200" 
      className={cn(
        "w-48 h-48 opacity-20 transition-colors duration-500",
        mode === 'listening' ? "text-red-500" : "text-amber-500"
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="20 180" />
      <motion.path 
        d="M 100 2 A 98 98 0 0 1 198 100" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.svg>
    <div className="absolute inset-0 font-mono text-[6px] text-amber-500/20 p-1">
      <span className="absolute top-0 left-1/2 -translate-x-1/2">000°</span>
      <span className="absolute right-0 top-1/2 -translate-y-1/2">090°</span>
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2">180°</span>
      <span className="absolute left-0 top-1/2 -translate-y-1/2">270°</span>
    </div>
  </div>
)

export function Sidebar({ mode, activeId, onSelect, onNew }: Props) {
  const [convos, setConvos] = useState<ConvoItem[]>([])
  const [metrics, setMetrics] = useState({ cpu: 12, mem: 42, net: 88 })
  const [isOverdrive, setIsOverdrive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const loadConvos = useCallback(async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        startTransition(() => setConvos(data))
      }
    } catch (error) {}
  }, [])

  useEffect(() => { loadConvos() }, [loadConvos, activeId])

  useEffect(() => {
    if (isOverdrive) return 
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.round(10 + Math.random() * 15),
        mem: Math.round(40 + Math.random() * 5),
        net: Math.round(80 + Math.random() * 15),
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [isOverdrive])

  const triggerOverdrive = () => {
    if (isOverdrive) return
    setIsOverdrive(true)
    playHUDFeedback('overdrive')
    setMetrics({ cpu: 99, mem: 99, net: 99 })
    setTimeout(() => setIsOverdrive(false), 2000)
  }

  const filteredConvos = useMemo(() => {
    return convos.filter(c => 
      (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [convos, searchQuery])

  return (
    <aside className="w-72 flex flex-col gap-3 p-4 bg-[#0a0202]/90 border-r border-red-950/40 shrink-0 select-none h-full relative z-20 overflow-hidden">
      
      <section className="relative p-4 rounded-2xl border border-red-900/20 bg-red-950/5 flex flex-col items-center gap-3 overflow-hidden group shadow-inner">
        <RadarRing mode={mode} />
        
        <div className="flex items-center gap-1.5 self-start text-[9px] font-mono tracking-[3px] text-amber-500/50 font-bold uppercase z-10">
          <BrainCircuit size={12} className="text-amber-500" />
          <span>NEURAL_LINK_MK3</span>
        </div>
        
        <div className="py-2 flex items-center justify-center w-full min-h-27.5 z-10">
          <Visualizer mode={mode} />
        </div>

        <div className="text-[9px] font-mono text-red-100/40 tracking-[2px] uppercase z-10">
          {mode === 'idle' && '[ STATUS: STANDBY ]'}
          {mode === 'listening' && '[ CAPTANDO BIOMETRIA ]'}
          {mode === 'thinking' && '[ PROCESSANDO NÚCLEO ]'}
          {mode === 'speaking' && '[ TRANSMITINDO ÁUDIO ]'}
        </div>
      </section>

      <section 
        onClick={triggerOverdrive}
        className={cn(
          "p-4 rounded-2xl border transition-all duration-500 cursor-pointer flex flex-col gap-3 group relative overflow-hidden shadow-lg",
          isOverdrive ? "bg-red-600/20 border-red-500 shadow-red-500/20" : "bg-red-950/5 border-red-900/20 hover:border-amber-500/30"
        )}
      >
        {isOverdrive && <motion.div className="absolute inset-0 bg-red-500/10 animate-pulse" />}
        
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-[2px] text-amber-500/60 font-bold uppercase">
            <Zap size={11} className={cn(isOverdrive && "text-red-500 animate-bounce")} />
            <span>{isOverdrive ? 'CORE_OVERDRIVE_ACTIVE' : 'ARC_REACTOR_DIAG'}</span>
          </div>
          {isOverdrive && <span className="text-[8px] font-mono text-red-500 animate-pulse">!! RECALIBRATING !!</span>}
        </div>

        <div className="flex flex-col gap-2.5 z-10">
          {[
            { label: 'COGNITIVE_LOAD', val: metrics.cpu },
            { label: 'SYNAPTIC_POOL', val: metrics.mem },
            { label: 'TOWER_SAT_LINK', val: metrics.net },
          ].map(m => (
            <div key={m.label}>
              <div className="flex justify-between text-[10px] font-mono mb-1 tracking-tighter">
                <span className="text-red-200/30">{m.label}</span>
                <span className={cn("font-bold", isOverdrive ? "text-red-500" : "text-amber-400")}>{m.val}%</span>
              </div>
              <div className="h-1 bg-black rounded-full overflow-hidden border border-red-950/50">
                <motion.div 
                  initial={false}
                  animate={{ width: `${m.val}%`, backgroundColor: isOverdrive ? '#ef4444' : '#f59e0b' }}
                  className="h-full shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex-1 flex flex-col min-h-0 p-4 rounded-2xl border border-red-900/20 bg-red-950/5 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/10 shadow-md">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-[2px] text-amber-500/60 font-bold uppercase">
            <History size={11} />
            <span>SECURE_LOGS</span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { playHUDFeedback('new'); onNew(); }} 
            className="text-[9px] font-mono font-bold text-amber-400 border border-amber-500/20 hover:bg-amber-500/10 px-2.5 py-1 rounded-lg"
          >
            <Plus size={10} className="inline mr-1" /> NOVA
          </motion.button>
        </div>

        <div className="relative mb-3 group shrink-0">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-500/40 group-focus-within:text-amber-400 transition-colors">
            <Search size={10} />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="// SEARCH_LOG:"
            className="w-full bg-red-950/20 border border-red-900/30 rounded-lg py-2 pl-8 pr-2 text-[10px] font-mono text-amber-100 placeholder:text-red-900 focus:outline-none focus:border-amber-500/50 focus:bg-red-950/40 transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-600/20 hover:scrollbar-thumb-amber-500/40 scrollbar-track-transparent">
          <div className="flex flex-col gap-2 relative">
            <AnimatePresence mode="popLayout">
              {filteredConvos.map(c => {
                const isSelected = activeId === c.id
                function handleDelete(id: string, e: MouseEvent<HTMLButtonElement>) {
                  (async () => {
                    try {
                      startTransition(() => setConvos(prev => prev.filter(x => x.id !== id)))

                      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
                      if (!res.ok) {
                        await loadConvos()
                      }
                    } catch (err) {
                      await loadConvos()
                    }
                  })()
                }

                return (
                  <motion.div
                    layout
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => { playHUDFeedback('select'); onSelect(c.id); }}
                    className={cn(
                      'group relative flex flex-col gap-1 p-3 rounded-xl cursor-pointer border transition-all duration-300',
                      isSelected ? 'border-amber-500/40 bg-amber-950/10' : 'border-red-950/40 hover:border-red-900/40 hover:bg-red-950/10'
                    )}
                  >
                    {isSelected && <motion.div layoutId="active" className="absolute left-0 top-3 bottom-3 w-0.5 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />}
                    
                    <div className={cn("text-[11px] font-mono truncate pr-6 tracking-wide", isSelected ? "text-amber-400 font-bold" : "text-red-100/70 group-hover:text-red-100/90")}>
                      {c.title || 'DIRETRIZ_SEM_TÍTULO'}
                    </div>
                    
                    <div className="text-[8px] font-mono text-red-900/60 uppercase tracking-[1.5px]">
                      {formatDistanceToNow(parseISO(c.updatedAt as string), { addSuffix: true, locale: ptBR })}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); playHUDFeedback('delete'); handleDelete(c.id, e); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-red-900/50 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </aside>
  )
}