'use client'

import { useEffect, useRef } from 'react'
import { VisualizerMode } from '@/types'

// Definição das assinaturas cromáticas para cada estado de telemetria
const MODE_THEMES: Record<VisualizerMode, { main: string; glow: string; text: string }> = {
  idle: { main: '0, 212, 255', glow: '0, 100, 250', text: 'J.A.R.V.I.S' },
  listening: { main: '239, 68, 68', glow: '153, 27, 27', text: 'CAPTANDO' },
  thinking: { main: '234, 179, 8', glow: '146, 64, 14', text: 'COGNIÇÃO' },
  speaking: { main: '34, 211, 238', glow: '8, 145, 178', text: 'FALANDO' }
}

export function Visualizer({ mode }: { mode: VisualizerMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    // 🚀 OTIMIZAÇÃO 1: Normalização HiDPI para telas Retina (Aumenta a nitidez em 2x/3x)
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    const logicalSize = 180
    
    canvas.width = logicalSize * dpr
    canvas.height = logicalSize * dpr
    canvas.style.width = `${logicalSize}px`
    canvas.style.height = `${logicalSize}px`
    ctx.scale(dpr, dpr)

    const draw = () => {
      const W = logicalSize
      const H = logicalSize
      const cx = W / 2
      const cy = H / 2
      const f = frameRef.current++
      
      ctx.clearRect(0, 0, W, H)
      
      const baseR = W * 0.26
      const theme = MODE_THEMES[mode]

      // 🎬 CAMADA 1: Anéis de Rotação Periférica (Arc Reactor Chassis)
      const rings = [
        { r: W * 0.45, alpha: 0.05, dash: [2, 10], speed: 0.002 },
        { r: W * 0.42, alpha: 0.12, dash: [15, 45], speed: -0.006 },
        { r: W * 0.36, alpha: 0.08, dash: [4, 6], speed: 0.004 },
      ]

      rings.forEach(ring => {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(f * ring.speed)
        ctx.beginPath()
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2)
        ctx.setLineDash(ring.dash)
        ctx.strokeStyle = `rgba(${theme.main}, ${ring.alpha})`
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()
      })

      // 🎬 CAMADA 2: Moduladores Radiais Simétricos (Frequência VAD)
      const bars = 72
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2
        let barH = 0

        // Modulações matemáticas complexas para cada comportamento
        if (mode === 'idle') {
          barH = baseR * 0.04 + Math.sin(f * 0.03 + i * 0.4) * baseR * 0.05
        } else if (mode === 'listening') {
          // Onda captadora agressiva com ruído estocástico
          barH = baseR * 0.05 + Math.abs(Math.sin(f * 0.12 + i * 0.3)) * baseR * 0.35 + Math.sin(f * 0.05 + i * 0.8) * baseR * 0.1
        } else if (mode === 'thinking') {
          // Onda matemática harmônica e ritmada de processamento
          barH = baseR * 0.06 + Math.abs(Math.cos(f * 0.06 + (i % 6) * 1.5)) * baseR * 0.2
        } else if (mode === 'speaking') {
          // Batimentos intensos simulando ondas de compressão vocal
          barH = baseR * 0.05 + Math.abs(Math.sin(f * 0.1 + i * 0.15)) * baseR * 0.45
        }

        const x1 = cx + Math.cos(angle) * baseR
        const y1 = cy + Math.sin(angle) * baseR
        const x2 = cx + Math.cos(angle) * (baseR + barH)
        const y2 = cy + Math.sin(angle) * (baseR + barH)

        const barAlpha = 0.3 + (barH / (baseR * 0.5)) * 0.7
        
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = `rgba(${theme.main}, ${barAlpha})`
        ctx.lineWidth = 1.5
        ctx.lineCap = 'round'
        ctx.setLineDash([])
        ctx.stroke()
      }

      // 🎬 CAMADA 3: Núcleo do Reator com Brilho Volumétrico (Glow Radial)
      const pulse = 1 + Math.sin(f * 0.06) * 0.025
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * pulse)
      const glowAlpha = mode === 'idle' ? 0.25 : mode === 'listening' ? 0.6 : 0.45

      grad.addColorStop(0, `rgba(${theme.main}, ${glowAlpha})`)
      grad.addColorStop(0.6, `rgba(${theme.glow}, ${glowAlpha * 0.2})`)
      grad.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(cx, cy, baseR * pulse, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // Borda do Reator Interno
      ctx.beginPath()
      ctx.arc(cx, cy, baseR * pulse, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(${theme.main}, 0.5)`
      ctx.lineWidth = 1
      ctx.stroke()

      // 🎬 CAMADA 4: Interface de Texto e Versionamento
      ctx.font = `bold ${W * 0.08}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.letterSpacing = '1px'
      ctx.fillStyle = `rgba(${theme.main}, 0.95)`
      ctx.fillText(theme.text, cx, cy)

      ctx.font = `${W * 0.055}px monospace`
      ctx.fillStyle = 'rgba(6, 182, 212, 0.3)'
      ctx.fillText('v4.72', cx, cy + W * 0.12)

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [mode])

  return (
    <div className="relative flex items-center justify-center p-2 rounded-full border border-slate-900/60 bg-slate-950/40 shadow-inner">
      {/* Luz de pulso periférica CSS */}
      <div className="absolute inset-0 rounded-full bg-cyan-500/0 opacity-0 group-hover:opacity-100 group-hover:bg-cyan-500/2 transition-all duration-700 blur-sm pointer-events-none" />
      
      <canvas
        ref={canvasRef}
        className="rounded-full select-none pointer-events-none drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]"
      />
    </div>
  )
}