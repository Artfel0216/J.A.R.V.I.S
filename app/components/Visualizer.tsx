'use client'

import { useEffect, useRef } from 'react'
import { VisualizerMode } from '@/types'

const MODE_THEMES: Record<VisualizerMode, { rgbMain: [number, number, number]; rgbGlow: [number, number, number]; text: string }> = {
  idle: { rgbMain: [245, 158, 11], rgbGlow: [146, 64, 14], text: 'J.A.R.V.I.S' },
  listening: { rgbMain: [220, 38, 38], rgbGlow: [153, 27, 27], text: 'BIOMETRIA' },
  thinking: { rgbMain: [251, 191, 36], rgbGlow: [180, 83, 9], text: 'COGNICÃO' },
  speaking: { rgbMain: [245, 158, 11], rgbGlow: [220, 38, 38], text: 'NEXUS_OUT' }
}

const TARGET_PARAMS = {
  idle: { speed: 0.03, amp: 0.05, baseAmp: 0.04, freq: 0.4 },
  listening: { speed: 0.12, amp: 0.35, baseAmp: 0.05, freq: 0.3 },
  thinking: { speed: 0.06, amp: 0.20, baseAmp: 0.06, freq: 1.5 },
  speaking: { speed: 0.10, amp: 0.45, baseAmp: 0.05, freq: 0.15 }
}

const lerp = (start: number, end: number, amt: number) => start + (end - start) * amt

export function Visualizer({ mode }: { mode: VisualizerMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modeRef = useRef<VisualizerMode>(mode)
  const frameRef = useRef(0)
  const animRef = useRef<number>(0)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const currentColors = useRef({ main: [245, 158, 11], glow: [146, 64, 14] })
  const currentParams = useRef({ speed: 0.03, amp: 0.05, baseAmp: 0.04, freq: 0.4 })

  useEffect(() => {
    modeRef.current = mode

    if (mode === 'listening' && !analyserRef.current) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
          streamRef.current = stream
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
          const audioCtx = new AudioContextClass()
          const analyser = audioCtx.createAnalyser()
          analyser.fftSize = 256 
          
          const source = audioCtx.createMediaStreamSource(stream)
          source.connect(analyser)
          
          audioContextRef.current = audioCtx
          analyserRef.current = analyser
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
        })
        .catch(() => console.warn('[STARK HUD] Permissão de mic negada. Usando fallback matemático.'))
    } 
    
    if (mode !== 'listening' && streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
      analyserRef.current = null
    }
  }, [mode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

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
      
      const activeMode = modeRef.current
      const targetTheme = MODE_THEMES[activeMode]
      const targetParam = TARGET_PARAMS[activeMode]

      currentColors.current.main = currentColors.current.main.map((c, i) => lerp(c, targetTheme.rgbMain[i], 0.08))
      currentColors.current.glow = currentColors.current.glow.map((c, i) => lerp(c, targetTheme.rgbGlow[i], 0.08))

      currentParams.current.speed = lerp(currentParams.current.speed, targetParam.speed, 0.08)
      currentParams.current.amp = lerp(currentParams.current.amp, targetParam.amp, 0.08)
      currentParams.current.baseAmp = lerp(currentParams.current.baseAmp, targetParam.baseAmp, 0.08)
      currentParams.current.freq = lerp(currentParams.current.freq, targetParam.freq, 0.08)

      const mainStr = currentColors.current.main.map(Math.round).join(', ')
      const glowStr = currentColors.current.glow.map(Math.round).join(', ')
      const baseR = W * 0.26
      const { speed, amp, baseAmp, freq } = currentParams.current

      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current)
      }

      
      const rings = [
        { r: W * 0.44, alpha: 0.04, dash: [2, 12], rSpeed: 0.001 },
        { r: W * 0.40, alpha: 0.10, dash: [12, 50], rSpeed: -0.004 },
      ]
      rings.forEach(ring => {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(f * ring.rSpeed)
        ctx.beginPath()
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2)
        ctx.setLineDash(ring.dash)
        ctx.strokeStyle = `rgba(${mainStr}, ${ring.alpha})`
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()
      })

      const bars = 72
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2
        let barH = 0

        if (activeMode === 'listening' && dataArrayRef.current) {
          const dataIndex = Math.floor((i / bars) * dataArrayRef.current.length * 0.6)
          const rawValue = dataArrayRef.current[dataIndex] || 0
          barH = baseR * baseAmp + (rawValue / 255) * baseR * amp * 1.8
        } else {
          barH = baseR * baseAmp + Math.sin(f * speed + i * freq) * baseR * amp
          if (activeMode === 'thinking') {
            barH = baseR * baseAmp + Math.abs(Math.cos(f * speed + (i % 6) * freq)) * baseR * amp
          }
        }
        barH = Math.max(0, barH)

        const x1 = cx + Math.cos(angle) * baseR
        const y1 = cy + Math.sin(angle) * baseR
        const x2 = cx + Math.cos(angle) * (baseR + barH)
        const y2 = cy + Math.sin(angle) * (baseR + barH)
        const barAlpha = 0.25 + (barH / (baseR * 0.5)) * 0.75
        
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = `rgba(${mainStr}, ${barAlpha})`
        ctx.lineWidth = 1.8
        ctx.lineCap = 'round'
        ctx.stroke()
      }

      const pulse = 1 + Math.sin(f * 0.05) * 0.02
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * pulse)
      const glowAlpha = activeMode === 'idle' ? 0.20 : activeMode === 'listening' ? 0.55 : 0.40
      grad.addColorStop(0, `rgba(${mainStr}, ${glowAlpha})`)
      grad.addColorStop(0.6, `rgba(${glowStr}, ${glowAlpha * 0.25})`)
      grad.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(cx, cy, baseR * pulse, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      const jitterAlpha = activeMode === 'thinking' && Math.random() > 0.88 ? 0.3 : 0.95
      ctx.font = `bold ${W * 0.075}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = `rgba(${mainStr}, ${jitterAlpha})`
      ctx.fillText(targetTheme.text, cx, cy)

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  return (
    <div className="relative flex items-center justify-center p-2 rounded-full border border-red-950/30 bg-red-950/5 group">
      <canvas ref={canvasRef} className="rounded-full select-none pointer-events-none drop-shadow-[0_0_20px_rgba(245,158,11,0.15)]" />
    </div>
  )
}