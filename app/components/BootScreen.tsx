'use client'

import { useEffect, useState } from 'react'
import { Power, ShieldAlert, Cpu, Orbit, Zap, Eye, AlertTriangle } from 'lucide-react'

interface BootScreenProps {
  onDone: () => void
  duration?: number
}

const BOOT_LOGS = [
  { text: 'Injetando plasma no Reator Arc...', icon: Zap, state: 'normal' },
  { text: 'Sincronizando HUD com a retina...', icon: Eye, state: 'normal' },
  { text: 'CRÍTICO: Flutuação de energia no núcleo magnético!', icon: AlertTriangle, state: 'critical' },
  { text: 'J.A.R.V.I.S.: Forçando bypass nos limitadores térmicos...', icon: Orbit, state: 'override' },
  { text: 'Sistemas estabilizados. Armadura pronta, Senhor.', icon: ShieldAlert, state: 'success' },
]

export function BootScreen({ onDone, duration = 4500 }: BootScreenProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [currentLogIndex, setCurrentLogIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  const currentLog = BOOT_LOGS[currentLogIndex]
  const isCritical = currentLog.state === 'critical'

  const playSound = (type: 'boot' | 'beep' | 'alarm' | 'done') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()

      if (type === 'boot') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(40, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 2)
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 2)
      } 
      
      if (type === 'beep') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(1000, ctx.currentTime)
        gain.gain.setValueAtTime(0.03, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.08)
      }

      if (type === 'alarm') {
        [0, 0.2].forEach((delay) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'square'
          osc.frequency.setValueAtTime(880, ctx.currentTime + delay)
          gain.gain.setValueAtTime(0.08, ctx.currentTime + delay)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(ctx.currentTime + delay)
          osc.stop(ctx.currentTime + delay + 0.15)
        })
      }

      if (type === 'done') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(300, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.4)
        gain.gain.setValueAtTime(0.25, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.5)
      }
    } catch (e) {
      console.warn('Áudio bloqueado pelo navegador', e)
    }
  }

  const handleInitiate = () => {
    setHasStarted(true)
    playSound('boot')
  }

  useEffect(() => {
    if (!hasStarted) return

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        if (prev % 12 === 0 && prev < 50) playSound('beep')
        return prev + 1
      })
    }, duration / 100)

    const logInterval = setInterval(() => {
      setCurrentLogIndex((prev) => {
        const next = prev + 1
        if (next < BOOT_LOGS.length) {
          if (BOOT_LOGS[next].state === 'critical') playSound('alarm')
          if (BOOT_LOGS[next].state === 'override') playSound('beep')
          return next
        }
        return prev
      })
    }, duration / BOOT_LOGS.length)

    const timeout = setTimeout(() => {
      playSound('done')
      setIsClosing(true)
      setTimeout(onDone, 650)
    }, duration)

    return () => {
      clearInterval(progressInterval)
      clearInterval(logInterval)
      clearTimeout(timeout)
    }
  }, [hasStarted, onDone, duration])

  const CurrentIcon = currentLog.icon

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#050101] text-zinc-100 px-6 overflow-hidden select-none transition-all duration-700 ${
      isClosing ? 'scale-y-[0.001] scale-x-150 blur-xl opacity-0' : 'scale-100 opacity-100'
    }`}>
      
      <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.015)_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.35)_50%)] bg-size-[100%_4px] pointer-events-none" />

      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px] pointer-events-none transition-all duration-300 ${
        !hasStarted ? 'w-50 h-50 bg-amber-500/5' :
        isCritical ? 'w-187.5 h-187.5 bg-red-600/30 animate-pulse' : 'w-162.5 h-162.5 bg-red-600/15'
      }`} />

      <div className={`relative w-full max-w-xl rounded-3xl border p-10 text-center backdrop-blur-2xl transition-all duration-300 ${
        !hasStarted ? 'border-amber-500/10 bg-zinc-950/40 shadow-none' :
        isCritical 
          ? 'border-red-500 bg-red-950/20 shadow-[0_0_120px_rgba(239,68,68,0.4)] animate-[pulse_0.8s_infinite]' 
          : 'border-red-500/30 bg-zinc-950/90 shadow-[0_0_100px_rgba(239,68,68,0.25)]'
      }`}>
        
        <div className={`absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] rounded-tl-xl transition-colors duration-300 ${isCritical ? 'border-red-500' : 'border-amber-500/40'}`} />
        <div className={`absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] rounded-tr-xl transition-colors duration-300 ${isCritical ? 'border-red-500' : 'border-amber-500/40'}`} />
        <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] rounded-bl-xl transition-colors duration-300 ${isCritical ? 'border-red-500' : 'border-amber-500/40'}`} />
        <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] rounded-br-xl transition-colors duration-300 ${isCritical ? 'border-red-500' : 'border-amber-500/40'}`} />

        {!hasStarted ? (
          <div className="py-6">
            <button 
              onClick={handleInitiate}
              className="group relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-500 transition-all duration-300 hover:border-red-500 hover:text-red-400 hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]"
            >
              <Power size={40} className="animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/10 group-hover:border-red-500/40 animate-[spin_30s_linear_infinite]" />
            </button>
            <h2 className="mt-6 font-mono text-[10px] tracking-[0.4em] text-amber-500/60 uppercase">
              Aguardando ativação do reator
            </h2>
          </div>
        ) : (
          <div>
            <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
              <div className={`absolute inset-0 rounded-full border-2 border-dashed transition-colors duration-300 ${isCritical ? 'border-red-500 animate-[spin_2s_linear_infinite]' : 'border-red-500/40 animate-[spin_8s_linear_infinite]'}`} />
              <div className="absolute inset-2 rounded-full border border-double border-amber-500/20 animate-[spin_12s_linear_infinite_reverse]" />
              
              <div className={`flex h-20 w-20 items-center justify-center rounded-full border-2 bg-linear-to-tr from-zinc-950 via-zinc-900 to-zinc-950 transition-all duration-300 ${
                isCritical 
                  ? 'border-red-500 text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.7)] animate-ping' 
                  : 'border-amber-400 text-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.4)]'
              }`}>
                <CurrentIcon size={30} className={isCritical ? '' : 'animate-bounce'} />
              </div>
            </div>

            <h1 className="text-3xl font-black uppercase tracking-[0.35em] bg-linear-to-r from-amber-400 via-red-500 to-amber-400 bg-clip-text text-transparent drop-shadow-md">
              STARK INDUSTRIES
            </h1>
            
            <div className="text-[9px] font-mono tracking-[0.5em] mt-1 mb-6 transition-colors duration-300">
              {isCritical ? (
                <span className="text-red-500 font-bold animate-pulse">SISTEMA COMPROMETIDO // ALERTA NÚCLEO</span>
              ) : (
                <span className="text-zinc-500">MK-85 // FLUXO DE VERIFICAÇÃO INTEGRAL</span>
              )}
            </div>
            
            <div className={`mx-auto max-w-sm h-14 flex items-center justify-center px-4 rounded-lg border transition-all duration-300 ${
              isCritical 
                ? 'bg-red-950/40 border-red-500 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]' 
                : 'bg-zinc-900/30 border-zinc-800'
            }`}>
              <p className={`text-xs font-mono tracking-wide transition-colors duration-300 ${isCritical ? 'text-red-400 font-bold' : 'text-zinc-300'}`}>
                <span className="mr-2">{isCritical ? '⚠' : '🗲'}</span>
                {currentLog.text}
              </p>
            </div>

            <div className="mt-8 mx-auto max-w-xs relative">
              <div className="h-2 w-full bg-zinc-950 rounded-full p-0.5 border border-zinc-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)] transition-all duration-100 ease-out ${
                    isCritical 
                      ? 'bg-linear-to-r from-red-700 to-red-500 shadow-[0_0_20px_#ef4444]' 
                      : 'bg-linear-to-r from-red-600 via-amber-500 to-amber-300'
                  }`} 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={`absolute -bottom-5 right-0 font-mono text-[10px] font-bold tracking-widest transition-colors duration-300 ${isCritical ? 'text-red-500' : 'text-amber-400'}`}>
                {progress}%
              </span>
              <span className="absolute -bottom-5 left-0 font-mono text-[9px] text-zinc-500 tracking-wider">
                {isCritical ? 'SYS_STATUS: FAIL' : 'SYS_STATUS: LOAD'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}