'use client'

class StarkSoundSystem {
  private ctx: AudioContext | null = null

  private init() {
    if (typeof window === 'undefined') return
    
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  playHover() {
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05)

    gain.gain.setValueAtTime(0.05, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.05)
  }

 
  playClick() {
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    
    
    this.triggerTone(1200, 'triangle', 0.03, now, 0.06)
    this.triggerTone(1800, 'sine', 0.04, now + 0.03, 0.04)
  }

  private triggerTone(freq: number, type: OscillatorType, duration: number, startTime: number, volume: number) {
    if (!this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, startTime)

    gain.gain.setValueAtTime(volume, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + duration)
  }
}

export const starkAudio = typeof window !== 'undefined' ? new StarkSoundSystem() : null