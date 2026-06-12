export interface FatigueAnalysis {
  postureScore: number
  blinkRate: number
  fatigueLevel: 'normal' | 'moderate' | 'high' | 'critical'
  hoursSinceLastBreak: number
  recommendation: string | null
  alert: boolean
}

export interface HealthSnapshot {
  heartRate: number
  heartRateTrend: 'stable' | 'elevated' | 'low'
  stressLevel: 'low' | 'moderate' | 'high'
  spo2: number
  stepsToday: number
  lastSync: string
  deviceType: 'apple_watch' | 'galaxy_watch' | 'mi_band' | 'none'
}

export interface SleepAnalysis {
  duration: string
  durationHours: number
  quality: 'poor' | 'fair' | 'good' | 'excellent'
  deepSleep: string
  remSleep: string
  interruptions: number
  recommendation: string | null
  adjustedAlarm: string | null
}

export async function analyzeFatigue(): Promise<FatigueAnalysis> {
  const blinkRate = 8 + Math.random() * 20
  const postureScore = Math.round(40 + Math.random() * 60)
  const hoursSinceBreak = Math.round(Math.random() * 4 * 10) / 10

  let fatigueLevel: FatigueAnalysis['fatigueLevel'] = 'normal'
  let recommendation: string | null = null
  let alert = false

  if (postureScore < 50 || hoursSinceBreak > 3) {
    fatigueLevel = 'high'
    alert = true
    recommendation = 'Senhor, sua postura esta inadequada e detectei sinais de fadiga. Recomendo uma pausa de 5 minutos.'
  } else if (postureScore < 70 || hoursSinceBreak > 2) {
    fatigueLevel = 'moderate'
    recommendation = 'Senhor, notei que esta ha mais de ' + Math.floor(hoursSinceBreak) + ' horas sem pausa. Que tal alongar-se?'
  }

  return {
    postureScore,
    blinkRate: Math.round(blinkRate * 10) / 10,
    fatigueLevel,
    hoursSinceLastBreak: hoursSinceBreak,
    recommendation,
    alert,
  }
}

export async function getHealthSnapshot(): Promise<HealthSnapshot> {
  const hr = 65 + Math.round(Math.random() * 40)
  const stress = hr > 90 ? 'high' : hr > 75 ? 'moderate' : 'low'
  const trend: HealthSnapshot['heartRateTrend'] = hr > 85 ? 'elevated' : hr < 60 ? 'low' : 'stable'

  return {
    heartRate: hr,
    heartRateTrend: trend,
    stressLevel: stress,
    spo2: 96 + Math.round(Math.random() * 3),
    stepsToday: 3000 + Math.round(Math.random() * 8000),
    lastSync: new Date().toISOString(),
    deviceType: 'apple_watch',
  }
}

export async function relaxEnvironment(): Promise<{
  success: boolean
  musicSuggestion: string
  lightingAdjustment: string
  message: string
}> {
  return {
    success: true,
    musicSuggestion: 'Reproduzindo: "Weightless" - Marconi Union (faixa com maior reducao de ansiedade comprovada)',
    lightingAdjustment: 'Luzes do Escritorio ajustadas para modo relaxamento: 40% brilho, temperatura 2700K (luz amarela suave)',
    message: 'Modo relaxamento ativado, Senhor. Musica ambiente em volume reduzido e iluminacao ajustada para conforto visual.',
  }
}

export async function analyzeSleep(): Promise<SleepAnalysis> {
  const hours = 5 + Math.round(Math.random() * 4 * 10) / 10
  const qualityRoll = Math.random()

  let quality: SleepAnalysis['quality']
  let interruptions: number

  if (hours >= 7 && qualityRoll > 0.6) {
    quality = 'good'
    interruptions = Math.floor(Math.random() * 2)
  } else if (hours >= 6) {
    quality = 'fair'
    interruptions = Math.floor(Math.random() * 3) + 1
  } else {
    quality = 'poor'
    interruptions = Math.floor(Math.random() * 4) + 2
  }

  const deepHours = Math.round(hours * (0.15 + Math.random() * 0.2) * 10) / 10
  const remHours = Math.round(hours * (0.2 + Math.random() * 0.15) * 10) / 10

  let recommendation: string | null = null
  let adjustedAlarm: string | null = null

  if (quality === 'poor') {
    recommendation = 'Senhor, seu sono foi insuficiente esta noite. Preparei um briefing matinal resumido para nao sobrecarrega-lo. Sugiro uma soneca de 20 minutos a tarde.'
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30)
    adjustedAlarm = now.toISOString()
  } else if (quality === 'fair') {
    recommendation = 'Seu sono foi razoavel, mas pode melhorar. Evite telas 1h antes de dormir hoje.'
  }

  return {
    duration: hours + 'h',
    durationHours: hours,
    quality,
    deepSleep: deepHours + 'h',
    remSleep: remHours + 'h',
    interruptions,
    recommendation,
    adjustedAlarm,
  }
}
