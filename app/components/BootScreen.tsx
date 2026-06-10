'use client'

import { useEffect } from 'react'
import { Power, Terminal } from 'lucide-react'

interface BootScreenProps {
  onDone: () => void
}

export function BootScreen({ onDone }: BootScreenProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1800)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617] text-slate-100 px-6">
      <div className="w-full max-w-xl rounded-4xl border border-cyan-500/20 bg-slate-950/95 p-10 text-center shadow-[0_0_80px_rgba(6,182,212,0.12)] backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <Terminal size={32} className="animate-pulse" />
        </div>
        <h1 className="mb-4 text-2xl font-semibold uppercase tracking-[0.28em] text-cyan-300">
          STARK BOOT SEQUENCE
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-7 text-slate-400">
          Iniciando módulos de processamento cognitivo e rede neural. Aguarde a autorização do núcleo para ativação.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-cyan-200">
          <Power size={14} />
          INICIALIZANDO
        </div>
      </div>
    </div>
  )
}
