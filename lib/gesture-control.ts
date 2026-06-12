export interface GestureEvent {
  gesture: string
  confidence: number
  hand: 'left' | 'right' | 'both'
  timestamp: string
  action?: string
}

export interface GazeData {
  focused: boolean
  screenRegion: string | null
  targetElement: string | null
  fixationDurationMs: number
  gazeX: number
  gazeY: number
}

export interface EyeTrackingSession {
  active: boolean
  lastGaze: GazeData | null
  fixationAlerts: FixationAlert[]
  startedAt: string
}

export interface FixationAlert {
  region: string
  durationMs: number
  suggestedAction: string
  triggeredAt: string
}

const gestureHistory: GestureEvent[] = []
let eyeTrackingActive = false
let eyeTrackingStartTime: string | null = null
let currentGaze: GazeData | null = null
const fixationAlerts: FixationAlert[] = []

const gestureMapping: Record<string, string> = {
  palm_up: 'Aumentar volume',
  fist: 'Pausar/Reproduzir música',
  swipe_left: 'Aba anterior',
  swipe_right: 'Próxima aba',
  pinch: 'Zoom in',
  spread: 'Zoom out',
  point_up: 'Cursor para cima',
  point_down: 'Cursor para baixo',
  two_fingers_swipe: 'Scroll vertical',
  ok_sign: 'Confirmar',
}

export async function recognizeGesture(
  handPosition?: string,
  movement?: string
): Promise<{
  gesture: string
  confidence: number
  mappedAction: string | null
  hand: string
  timestamp: string
  recentGestures: GestureEvent[]
}> {
  const gestures = Object.keys(gestureMapping)
  const randomGesture = gestures[Math.floor(Math.random() * gestures.length)]
  const confidence = 0.75 + Math.random() * 0.2

  const event: GestureEvent = {
    gesture: randomGesture,
    confidence: Math.round(confidence * 100) / 100,
    hand: 'right',
    timestamp: new Date().toISOString(),
    action: gestureMapping[randomGesture],
  }

  gestureHistory.push(event)
  if (gestureHistory.length > 50) gestureHistory.shift()

  return {
    gesture: event.gesture,
    confidence: event.confidence,
    mappedAction: event.action || null,
    hand: event.hand,
    timestamp: event.timestamp,
    recentGestures: gestureHistory.slice(-10),
  }
}

export async function startEyeTracking(): Promise<{
  success: boolean
  session: EyeTrackingSession
  message: string
}> {
  eyeTrackingActive = true
  eyeTrackingStartTime = new Date().toISOString()
  currentGaze = {
    focused: true,
    screenRegion: 'centro',
    targetElement: null,
    fixationDurationMs: 0,
    gazeX: 960,
    gazeY: 540,
  }

  return {
    success: true,
    session: {
      active: true,
      lastGaze: currentGaze,
      fixationAlerts: [],
      startedAt: eyeTrackingStartTime,
    },
    message: 'Rastreamento ocular iniciado. Estou monitorando seu foco visual, Senhor.',
  }
}

export async function stopEyeTracking(): Promise<{
  success: boolean
  message: string
}> {
  eyeTrackingActive = false
  eyeTrackingStartTime = null
  currentGaze = null

  return {
    success: true,
    message: 'Rastreamento ocular desativado.',
  }
}

export async function getCurrentGaze(): Promise<{
  eyeTrackingActive: boolean
  gaze: GazeData | null
  fixationAlerts: FixationAlert[]
  screenRegions: string[]
}> {
  if (!eyeTrackingActive) {
    return {
      eyeTrackingActive: false,
      gaze: null,
      fixationAlerts: [],
      screenRegions: ['esquerda', 'centro', 'direita'],
    }
  }

  const regions = ['canto superior esquerdo', 'canto superior direito', 'canto inferior esquerdo', 'canto inferior direito', 'centro', 'barra de ferramentas']
  const randomRegion = regions[Math.floor(Math.random() * regions.length)]
  const fixationMs = Math.floor(Math.random() * 8000)
  const focused = Math.random() > 0.3

  currentGaze = {
    focused,
    screenRegion: randomRegion,
    targetElement: null,
    fixationDurationMs: fixationMs,
    gazeX: Math.floor(Math.random() * 1920),
    gazeY: Math.floor(Math.random() * 1080),
  }

  if (fixationMs > 5000 && randomRegion) {
    const actions: Record<string, string> = {
      'canto superior esquerdo': 'Possível erro de sintaxe na região — sugestão: verificar parênteses e chaves.',
      'canto superior direito': 'Código com alta complexidade detectado — considerar refatoração.',
      'centro': 'Foco principal detectado. Monitorando produtividade.',
      'canto inferior esquerdo': 'Terminal ou logs abertos — verificar mensagens de erro.',
      'barra de ferramentas': 'Navegação entre abas detectada.',
    }

    const alert: FixationAlert = {
      region: randomRegion,
      durationMs: fixationMs,
      suggestedAction: actions[randomRegion] || 'Região monitorada por tempo prolongado.',
      triggeredAt: new Date().toISOString(),
    }

    fixationAlerts.push(alert)
  }

  return {
    eyeTrackingActive,
    gaze: currentGaze,
    fixationAlerts: fixationAlerts.slice(-5),
    screenRegions: regions,
  }
}

export async function detectCodeIssueByGaze(
  codeLine?: string
): Promise<{
  issueDetected: boolean
  line: number | null
  description: string | null
  suggestion: string | null
}> {
  const commonIssues = [
    { pattern: /\([^)]*\([^)]*\)[^)]*$/, description: 'Parêntese não fechado', suggestion: 'Adicione um parêntese de fechamento ")" ao final da expressão.' },
    { pattern: /\[[^\]]*$/, description: 'Colchete não fechado', suggestion: 'Adicione um colchete de fechamento "]" ao final.' },
    { pattern: /\{[^}]*$/, description: 'Chave não fechada', suggestion: 'Adicione uma chave de fechamento "}" ao final do bloco.' },
    { pattern: /(console\.log|console\.error)\([^)]*$/, description: 'Console.log incompleto', suggestion: 'Feche o parêntese da chamada console.' },
    { pattern: /if\s*\([^)]*$/, description: 'Condição if incompleta', suggestion: 'Verifique a sintaxe da condição if.' },
    { pattern: /(function|const|let|var)\s+\w+\s*=[^;]*$/, description: 'Declaração sem ponto e vírgula', suggestion: 'Adicione ";" ao final da declaração.' },
    { pattern: /return\s+[^;]*$/, description: 'Return sem ponto e vírgula', suggestion: 'Adicione ";" após o valor de retorno.' },
  ]

  if (!codeLine) {
    const simulatedIssue = Math.random() > 0.6
    if (simulatedIssue) {
      const issue = commonIssues[Math.floor(Math.random() * commonIssues.length)]
      const lineNumber = Math.floor(Math.random() * 200) + 1
      return {
        issueDetected: true,
        line: lineNumber,
        description: issue.description,
        suggestion: issue.suggestion,
      }
    }
    return { issueDetected: false, line: null, description: null, suggestion: null }
  }

  for (let i = 0; i < commonIssues.length; i++) {
    if (commonIssues[i].pattern.test(codeLine)) {
      return {
        issueDetected: true,
        line: null,
        description: commonIssues[i].description,
        suggestion: commonIssues[i].suggestion,
      }
    }
  }

  return { issueDetected: false, line: null, description: null, suggestion: null }
}

export async function getGestureStats(): Promise<{
  totalGestures: number
  mostCommonGesture: string | null
  gestureFrequency: Record<string, number>
  topGestures: { gesture: string; count: number }[]
}> {
  const frequency: Record<string, number> = {}
  gestureHistory.forEach(g => {
    frequency[g.gesture] = (frequency[g.gesture] || 0) + 1
  })

  const sorted = Object.entries(frequency)
    .map(([gesture, count]) => ({ gesture, count }))
    .sort((a, b) => b.count - a.count)

  return {
    totalGestures: gestureHistory.length,
    mostCommonGesture: sorted[0]?.gesture || null,
    gestureFrequency: frequency,
    topGestures: sorted.slice(0, 5),
  }
}

export async function getAvailableGestures(): Promise<{
  gestures: { name: string; action: string; description: string }[]
}> {
  return {
    gestures: [
      { name: 'palm_up', action: 'Aumentar volume', description: 'Mão aberta virada para cima' },
      { name: 'fist', action: 'Pausar/Reproduzir', description: 'Punho fechado' },
      { name: 'swipe_left', action: 'Aba anterior', description: 'Arrastar mão para esquerda' },
      { name: 'swipe_right', action: 'Próxima aba', description: 'Arrastar mão para direita' },
      { name: 'pinch', action: 'Zoom in', description: 'Beliscar com polegar e indicador' },
      { name: 'spread', action: 'Zoom out', description: 'Abrir dedos separando' },
      { name: 'point_up', action: 'Cursor para cima', description: 'Apontar indicador para cima' },
      { name: 'point_down', action: 'Cursor para baixo', description: 'Apontar indicador para baixo' },
      { name: 'two_fingers_swipe', action: 'Scroll vertical', description: 'Dois dedos deslizando' },
      { name: 'ok_sign', action: 'Confirmar', description: 'Sinal de OK com polegar e indicador' },
    ],
  }
}
