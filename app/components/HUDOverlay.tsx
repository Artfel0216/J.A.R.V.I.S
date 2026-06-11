'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Thermometer, ShieldAlert } from 'lucide-react'

export function HUDOverlay() {
  const [temperature, setTemperature] = useState(42)
  const [isCritical, setIsCritical] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature(prev => {
        const change = Math.random() > 0.6 ? Math.random() * 2 : -Math.random() * 1.5
        const nextTemp = Math.min(Math.max(36, prev + change), 98)
        setIsCritical(nextTemp > 80)
        return parseFloat(nextTemp.toFixed(1))
      })
    }, 3000)

    const handleOverdriveEvent = () => {
      setTemperature(94.8)
      setIsCritical(true)
    }

    window.addEventListener('stark-core-overdrive', handleOverdriveEvent)
    return () => {
      clearInterval(interval)
      window.removeEventListener('stark-core-overdrive', handleOverdriveEvent)
    }
  }, [])

  const coolSystem = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(400, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.6)
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.6)
    } catch (e) {}

    setTemperature(41.2)
    setIsCritical(false)
  }

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-[0.16] bg-linear-to-b from-transparent 50% to-[#120404] 50% bg-size-[100%_4px]" />
      
      <div className="fixed top-3 right-4 z-40 flex items-center gap-3 bg-black/60 backdrop-blur-md border border-red-950/40 rounded-xl px-3 py-1.5 font-mono text-[10px] shadow-lg transition-all duration-500">
        <div className="flex items-center gap-1.5">
          <Thermometer size={12} className={isCritical ? "text-red-500 animate-pulse" : "text-amber-500"} />
          <span className="text-red-200/40">REACTOR_TEMP:</span>
          <span className={isCritical ? "text-red-500 font-bold" : "text-amber-400 font-bold"}>
            {temperature}°C
          </span>
        </div>

        {isCritical && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            onClick={coolSystem}
            className="bg-red-950/50 border border-red-500/40 text-red-400 px-2 py-0.5 rounded-md hover:bg-red-500/20 hover:text-red-200 transition-all text-[9px] font-bold tracking-tight animate-pulse"
          >
            FLUSH_COOLANT
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isCritical && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="fixed inset-0 bg-red-950/10 border-2 border-red-500/20 pointer-events-none z-30 flex items-start justify-center pt-24"
          >
            <div className="bg-red-950/80 border border-red-500/30 rounded-2xl px-5 py-3 flex items-center gap-2.5 backdrop-blur-xl shadow-[0_0_30px_rgba(239,68,68,0.15)]">
              <ShieldAlert className="text-red-500 animate-bounce" size={16} />
              <div className="font-mono text-left">
                <div className="text-[11px] font-bold text-red-400 tracking-wider">CRITICAL_OVERHEATING_DETECTED</div>
                <div className="text-[9px] text-red-200/40 uppercase">Sistemas de IA operando sob estresse térmico máximo</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}