export interface StarkProtocolState {
  active: boolean
  blockedSites: string[]
  closedTabs: string[]
  openedApps: string[]
  lightingMode: string
  startTime: string | null
  duration: string
}

export interface DistractionAlert {
  detected: boolean
  type: 'youtube' | 'tiktok' | 'game' | 'entertainment' | 'none'
  confidence: number
  message: string | null
}

export interface PomodoroState {
  active: boolean
  phase: 'focus' | 'break' | 'idle'
  elapsedMinutes: number
  productivityRate: number
  suggestedBreak: boolean
  cycleCount: number
  message: string | null
}

let protocolActive = false
let protocolStartTime: string | null = null
let pomodoroActive = false
let pomodoroPhase: PomodoroState['phase'] = 'idle'
let pomodoroCycle = 0

export async function activateStarkProtocol(): Promise<StarkProtocolState> {
  protocolActive = true
  protocolStartTime = new Date().toISOString()

  return {
    active: true,
    blockedSites: [
      'youtube.com', 'tiktok.com', 'instagram.com', 'twitter.com',
      'facebook.com', 'reddit.com', 'netflix.com', 'twitch.tv',
    ],
    closedTabs: [
      'YouTube - Recomendacoes',
      'Twitter / Feed',
      'Instagram - Explorar',
    ],
    openedApps: [
      'VS Code', 'Terminal (PowerShell)', 'Postman',
      'GitHub Desktop', 'Notion - Projeto Atual',
    ],
    lightingMode: 'Foco: 5000K (luz azul fria), brilho 80%',
    startTime: protocolStartTime,
    duration: 'Em andamento',
  }
}

export async function deactivateStarkProtocol(): Promise<{
  success: boolean
  totalDuration: string
  message: string
}> {
  if (!protocolActive) {
    return { success: false, totalDuration: '0 minutos', message: 'Protocolo Stark nao estava ativo, Senhor.' }
  }
  protocolActive = false
  const duration = protocolStartTime
    ? Math.round((Date.now() - new Date(protocolStartTime).getTime()) / 60000)
    : 0

  return {
    success: true,
    totalDuration: duration + ' minutos',
    message: 'Protocolo Stark desativado. Sessao de foco de ' + duration + ' minutos concluida. ' +
      (duration >= 120 ? 'Produtividade excepcional, Senhor!' :
       duration >= 60 ? 'Bom trabalho, Senhor.' :
       'Toda sessao de foco conta, Senhor.'),
  }
}

export async function detectDistraction(): Promise<DistractionAlert> {
  const hasDistraction = Math.random() > 0.7
  const types: DistractionAlert['type'][] = ['youtube', 'tiktok', 'entertainment']

  if (!hasDistraction) {
    return { detected: false, type: 'none', confidence: 0, message: null }
  }

  const type = types[Math.floor(Math.random() * types.length)]
  return {
    detected: true,
    type,
    confidence: 78 + Math.round(Math.random() * 20),
    message: 'Senhor, detectei audio de entretenimento (' + type + '). Nao deveriamos estar finalizando o projeto atual?',
  }
}

export async function getPomodoroStatus(): Promise<PomodoroState> {
  if (!pomodoroActive) {
    return {
      active: false,
      phase: 'idle',
      elapsedMinutes: 0,
      productivityRate: 0,
      suggestedBreak: false,
      cycleCount: pomodoroCycle,
      message: 'Pomodoro inativo. Diga "Jarvis, iniciar pomodoro" para comecar.',
    }
  }

  const elapsed = Math.round(Math.random() * 50)
  const productivityDrop = elapsed > 30 && Math.random() > 0.5
  const productivityRate = productivityDrop
    ? Math.round(40 + Math.random() * 20)
    : Math.round(75 + Math.random() * 25)

  let message: string | null = null
  let suggestedBreak = false

  if (productivityDrop && elapsed > 25) {
    pomodoroPhase = 'break'
    suggestedBreak = true
    message = 'Senhor, notei que seu ritmo de produtividade caiu para ' + productivityRate + '%. Sugiro uma pausa de 5 minutos agora.'
  } else if (elapsed >= 45) {
    pomodoroPhase = 'break'
    suggestedBreak = true
    message = 'Ciclo de foco de ' + elapsed + ' minutos concluido! Hora da pausa, Senhor.'
  } else {
    pomodoroPhase = 'focus'
  }

  return {
    active: true,
    phase: pomodoroPhase,
    elapsedMinutes: elapsed,
    productivityRate,
    suggestedBreak,
    cycleCount: pomodoroCycle,
    message,
  }
}

export async function startPomodoro(): Promise<PomodoroState> {
  if (pomodoroActive) {
    return {
      active: true,
      phase: pomodoroPhase,
      elapsedMinutes: 0,
      productivityRate: 95,
      suggestedBreak: false,
      cycleCount: pomodoroCycle,
      message: 'Pomodoro ja esta ativo, Senhor. Ciclo #' + pomodoroCycle + ' em andamento.',
    }
  }
  pomodoroActive = true
  pomodoroPhase = 'focus'
  pomodoroCycle++
  return {
    active: true,
    phase: 'focus',
    elapsedMinutes: 0,
    productivityRate: 95,
    suggestedBreak: false,
    cycleCount: pomodoroCycle,
    message: 'Pomodoro iniciado! Ciclo #' + pomodoroCycle + '. Foco total ate o J.A.R.V.I.S. avisar a pausa.',
  }
}

export async function getWorkSessionStats(): Promise<{
  totalFocusMinutes: number
  sessionsToday: number
  avgProductivity: number
  topProductiveHours: string
  message: string
}> {
  return {
    totalFocusMinutes: 187,
    sessionsToday: 3,
    avgProductivity: 82,
    topProductiveHours: '09:00 - 11:00',
    message: '3 sessoes de foco hoje, totalizando 187 minutos produtivos. Media de produtividade: 82%. Horario de pico: 09h-11h.',
  }
}
