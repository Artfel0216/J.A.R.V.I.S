'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Thermometer, ShieldAlert, Wifi, Users, Shield, Radio } from 'lucide-react'

interface HUDMetrics {
  devices: number
  networkDevices: number
  networkAlert: boolean
  cpuTemp: number
  personsDetected: number
  privacyMode: boolean
}

export function HUDOverlay() {
  const [temperature, setTemperature] = useState(42)
  const [isCritical, setIsCritical] = useState(false)
  const [metrics, setMetrics] = useState<HUDMetrics>({
    devices: 2,
    networkDevices: 5,
    networkAlert: false,
    cpuTemp: 52,
    personsDetected: 1,
    privacyMode: false,
  })

  useEffect(() => {
    const tempInterval = setInterval(() => {
      setTemperature(prev => {
        const change = Math.random() > 0.6 ? Math.random() * 2 : -Math.random() * 1.5
        const nextTemp = Math.min(Math.max(36, prev + change), 98)
        setIsCritical(nextTemp > 80)
        return parseFloat(nextTemp.toFixed(1))
      })
    }, 3000)

    const metricsInterval = setInterval(async () => {
      try {
        const [pres, net, thermal] = await Promise.all([
          fetch('/api/presence?type=presence').then(r => r.json()).catch(() => null),
          fetch('/api/network-guardian?type=scan').then(r => r.json()).catch(() => null),
          fetch('/api/network-guardian?type=thermal').then(r => r.json()).catch(() => null),
        ])
        setMetrics({
          devices: pres?.totalDevices || 2,
          networkDevices: net?.totalDevices || 5,
          networkAlert: net?.alert || false,
          cpuTemp: thermal?.cpuTemp || 52,
          personsDetected: 1,
          privacyMode: false,
        })
      } catch {}
    }, 15000)

    const handleOverdriveEvent = () => {
      setTemperature(94.8)
      setIsCritical(true)
    }

    window.addEventListener('stark-core-overdrive', handleOverdriveEvent)
    return () => {
      clearInterval(tempInterval)
      clearInterval(metricsInterval)
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

    fetch('/api/network-guardian', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cool' }),
    }).catch(() => {})
  }

  const isHighTemp = metrics.cpuTemp > 70

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-[0.16] bg-linear-to-b from-transparent 50% to-[#120404] 50% bg-size-[100%_4px]" />

      <div className="fixed top-3 right-4 z-40 flex items-center gap-2 bg-black/70 backdrop-blur-md border border-red-950/40 rounded-xl px-3 py-1.5 font-mono text-[10px] shadow-lg transition-all duration-500">
        <div className="flex items-center gap-1.5 pr-2 border-r border-red-950/40">
          <Radio size={11} className="text-amber-400" />
          <span className="text-red-200/40">DEV:</span>
          <span className="text-amber-400 font-bold">{metrics.devices}</span>
        </div>

        <div className={`flex items-center gap-1.5 pr-2 border-r border-red-950/40 ${metrics.networkAlert ? 'text-red-500' : ''}`}>
          <Wifi size={11} className={metrics.networkAlert ? 'animate-pulse text-red-500' : 'text-amber-400'} />
          <span className="text-red-200/40">NET:</span>
          <span className="font-bold">{metrics.networkDevices}</span>
          {metrics.networkAlert && <Shield size={10} className="text-red-500 animate-pulse" />}
        </div>

        <div className={`flex items-center gap-1.5 pr-2 border-r border-red-950/40 ${isHighTemp ? 'text-red-500' : ''}`}>
          <Thermometer size={11} className={isHighTemp ? 'animate-pulse text-red-500' : 'text-amber-500'} />
          <span className="text-red-200/40">CPU:</span>
          <span className={`font-bold ${isHighTemp ? 'text-red-500' : 'text-amber-400'}`}>{Math.round(metrics.cpuTemp)}°</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Users size={11} className="text-amber-400" />
          <span className="text-red-200/40">PPL:</span>
          <span className="text-amber-400 font-bold">{metrics.personsDetected}</span>
        </div>
      </div>

      <div className="fixed top-3 left-4 z-40 flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-red-950/30 rounded-lg px-2.5 py-1 font-mono text-[9px] shadow-lg">
        <span className="text-amber-500/60">ARC_REACTOR:</span>
        <span className={isCritical ? 'text-red-500 font-bold animate-pulse' : 'text-green-400'}>
          {isCritical ? 'OVERHEAT' : `${temperature}°C`}
        </span>
        {isCritical && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={coolSystem}
            className="bg-red-950/50 border border-red-500/40 text-red-400 px-1.5 py-0.5 rounded hover:bg-red-500/20 transition-all font-bold"
          >
            FLUSH
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

      {metrics.networkAlert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 right-4 z-40 bg-red-950/70 border border-red-500/30 rounded-xl px-3 py-2 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 text-[9px] font-mono text-red-400">
            <ShieldAlert size={12} className="animate-pulse" />
            <span>ALERTA: Dispositivo desconhecido na rede</span>
          </div>
        </motion.div>
      )}
    </>
  )
}
