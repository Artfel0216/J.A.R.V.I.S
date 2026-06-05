'use client'

import { useEffect, useState } from 'react'
import { Terminal, Shield, Cpu, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { text: 'Acessando barramento de boot local...', duration: 500 },
  { text: 'Inicializando núcleo de processamento quântico...', duration: 800 },
  { text: 'Carregando base de dados sináptica (Anthropic API)...', duration: 900 },
  { text: 'Calibrando moduladores do sintetizador de voz...', duration: 600 },
  { text: 'Estabelecendo link de uplink seguro com servidores Stark...', duration: 1100 },
  { text: 'Injetando chaves criptográficas AES-256...', duration: 400 },
  { text: 'Verificando integridade biométrica dos sistemas...', duration: 500 },
  { text: 'J.A.R.V.I.S. online e pronto para o Senhor.', duration: 800 },
]

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [hexLog, setHexLog] = useState<string[]>([])

  // Efeito 1: Execução dos passos de boot com durações dinâmicas e realistas
  useEffect(() => {
    let currentStep = 0

    const runNextStep = () => {
      if (currentStep < STEPS.length - 1) {
        setTimeout(() => {
          currentStep++
          setStep(currentStep)
          runNextStep()
        }, STEPS[currentStep].duration)
      } else {
        // Encerramento suave com transições fluidas de opacidade
        setTimeout(() => {
          setDone(true)
          setTimeout(onDone, 700)
        }, 1000)
      }
    }

    runNextStep()
  }, [onDone])

  // Efeito 2: Cascata de logs hexadecimais simulando telemetria em tempo real
  useEffect(() => {
    if (done) return

    const generateLogs = () => {
      const hexChars = '0123456789ABCDEF'
      const newLogs = Array.from({ length: 4 }).map(() => {
        const addr = Array.from({ length: 4 }).map(() => hexChars[Math.floor(Math.random() * 16)]).join('')
        const val = Array.from({ length: 2 }).map(() => hexChars[Math.floor(Math.random() * 16)]).join('')
        return `0x${addr} :: SYS_STAT_OK // VAL_${val}`
      })
      
      setHexLog(newLogs)
    }

    const interval = setInterval(generateLogs, 150)
    return () => clearInterval(interval)
  }, [done])

  const progressPercent = Math.min(((step + 1) / STEPS.length) * 100, 100)

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-in-out",
      done ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
    )}>
      
      {/* Grade de fundo cibernética com pulso de luz central */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none mix-blend-screen" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} 
      />
      
      {/* Vinheta Holográfica nas bordas da tela */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#020617_90%)] pointer-events-none" />

      {/* PAINEL CENTRAL DE DIAGNÓSTICO */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 select-none text-center">
        
        {/* Núcleo do Reator Holográfico Animado */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/20 animate-[spin_30s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border border-cyan-500/40 animate-[spin_10s_linear_infinite_reverse]" />
          <div className="absolute inset-4 rounded-full border-2 border-cyan-500/10" />
          <div className="relative w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.6)] animate-pulse">
            <Activity size={16} className="text-cyan-400" />
          </div>
        </div>

        {/* Identidade de Sistema */}
        <h1 
          className="text-4xl font-mono font-black tracking-[16px] text-slate-100 uppercase translate-x-2 transition-all"
          style={{ textShadow: '0 0 25px rgba(6, 182, 212, 0.4)' }}
        >
          J.A.R.V.I.S.
        </h1>
        <p className="text-[8px] font-mono tracking-[3px] text-cyan-500/60 mt-2 uppercase">
          Autonomous Artificial Intelligence System
        </p>

        {/* LOG DE TELEMETRIA HEXADECIMAL LATERAL */}
        <div className="w-full bg-slate-950/60 border border-slate-900 rounded-xl p-3 my-8 font-mono text-[9px] text-left text-slate-500 h-20 overflow-hidden relative flex flex-col justify-center gap-1">
          <div className="absolute top-2 right-3 text-cyan-500/40 flex items-center gap-1">
            <Terminal size={10} />
            <span>DIAG_FEED</span>
          </div>
          {hexLog.map((log, index) => (
            <div key={index} className="opacity-70 truncate hover:text-cyan-400 transition-colors">
              {log}
            </div>
          ))}
        </div>

        {/* BARRA DE PROGRESSO STARK SEGMENTADA */}
        <div className="w-full flex flex-col gap-2">
          <div className="w-full h-1 bg-slate-950 border border-slate-900 rounded-full overflow-hidden p-px">
            <div
              className="h-full bg-linear-to-r from-blue-600 via-cyan-400 to-emerald-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          
          {/* Label Dinâmico de Inicialização */}
          <div className="h-4 font-mono text-[10px] text-cyan-400 tracking-wider font-medium truncate mt-1">
            {STEPS[step]?.text}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center font-mono text-[8px] text-slate-600 tracking-widest">
        <div className="flex items-center gap-1.5">
          <Cpu size={10} className="text-slate-700" />
          <span>STARK ENTERPRISES CORE_v4.72</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield size={10} className="text-slate-700" />
          <span>SECURITY LEVEL: ALPHA_MAX</span>
        </div>
      </div>
    </div>
  )
}