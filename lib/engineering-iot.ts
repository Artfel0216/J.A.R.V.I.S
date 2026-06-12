export interface PrintJob {
  id: string
  fileName: string
  status: 'printing' | 'paused' | 'completed' | 'failed' | 'queued'
  progress: number
  estimatedTimeRemaining: string
  elapsedTime: string
  filamentUsed: number
  filamentColor: string
  filamentType: string
  temperature: number
  bedTemperature: number
}

export interface FilamentStatus {
  type: string
  color: string
  remainingPercent: number
  estimatedRemainingMinutes: number
  needsReplacement: boolean
}

export interface BenchTool {
  id: string
  name: string
  type: 'soldering_iron' | 'multimeter' | 'oscilloscope' | 'power_supply' | 'fume_extractor' | '3d_printer' | 'cnc'
  status: 'on' | 'off' | 'standby'
  temperature?: number
  powerConsumption: number
  autoOffTimer: number | null
}

let activePrintJob: PrintJob | null = {
  id: 'job_001',
  fileName: 'Stark_Arc_Reactor_v3.gcode',
  status: 'printing',
  progress: 47,
  estimatedTimeRemaining: '2h 34min',
  elapsedTime: '2h 18min',
  filamentUsed: 124,
  filamentColor: '#00aaff',
  filamentType: 'PLA+',
  temperature: 210,
  bedTemperature: 60,
}

const benchTools: BenchTool[] = [
  { id: 'tool_1', name: 'Ferro de Solda Hakko FX-888D', type: 'soldering_iron', status: 'off', temperature: 25, powerConsumption: 70, autoOffTimer: null },
  { id: 'tool_2', name: 'Multímetro Digital Fluke 179', type: 'multimeter', status: 'off', powerConsumption: 0.1, autoOffTimer: null },
  { id: 'tool_3', name: 'Fonte de Bancada Minipa MPL-3305', type: 'power_supply', status: 'off', powerConsumption: 0, autoOffTimer: null },
  { id: 'tool_4', name: 'Extrator de Fumaça', type: 'fume_extractor', status: 'off', powerConsumption: 15, autoOffTimer: null },
  { id: 'tool_5', name: 'Impressora 3D Creality K1', type: '3d_printer', status: 'on', powerConsumption: 350, autoOffTimer: null },
  { id: 'tool_6', name: 'CNC Router 3018 Pro', type: 'cnc', status: 'off', powerConsumption: 0, autoOffTimer: null },
]

export async function getPrintJobStatus(): Promise<{
  activeJob: PrintJob | null
  queueLength: number
  message: string
}> {
  if (activePrintJob) {
    activePrintJob.progress = Math.min(100, activePrintJob.progress + Math.floor(Math.random() * 3))

    if (activePrintJob.progress >= 100) {
      activePrintJob.status = 'completed'
      return {
        activeJob: { ...activePrintJob, progress: 100, estimatedTimeRemaining: '0min' },
        queueLength: 0,
        message: 'Impressão 3D concluída com sucesso, Senhor!',
      }
    }

    const remainingMinutes = Math.max(10, Math.floor((100 - activePrintJob.progress) * 3.2))
    const hours = Math.floor(remainingMinutes / 60)
    const mins = remainingMinutes % 60
    activePrintJob.estimatedTimeRemaining = `${hours}h ${mins}min`
  }

  return {
    activeJob: activePrintJob,
    queueLength: 2,
    message: activePrintJob
      ? `Impressão em andamento: ${activePrintJob.progress}% concluído. Tempo restante estimado: ${activePrintJob.estimatedTimeRemaining}.`
      : 'Nenhuma impressão ativa no momento.',
  }
}

export async function checkFilament(): Promise<{
  filaments: FilamentStatus[]
  criticalFilaments: FilamentStatus[]
  needsReorder: boolean
  message: string
}> {
  const filaments: FilamentStatus[] = [
    { type: 'PLA+', color: 'Azul Arc Reactor', remainingPercent: 68, estimatedRemainingMinutes: 480, needsReplacement: false },
    { type: 'PETG', color: 'Preto', remainingPercent: 22, estimatedRemainingMinutes: 120, needsReplacement: true },
    { type: 'TPU', color: 'Vermelho Transparente', remainingPercent: 85, estimatedRemainingMinutes: 360, needsReplacement: false },
    { type: 'ABS', color: 'Cinza', remainingPercent: 8, estimatedRemainingMinutes: 30, needsReplacement: true },
  ]

  const criticalFilaments = filaments.filter(f => f.needsReplacement)
  const needsReorder = criticalFilaments.length > 0

  return {
    filaments,
    criticalFilaments,
    needsReorder,
    message: needsReorder
      ? `⚠️ Filamento crítico: ${criticalFilaments.map(f => `${f.type} (${f.color}) — ${f.remainingPercent}% restante`).join(', ')}. Recomendo reabastecimento, Senhor.`
      : '✅ Todos os filamentos com nível adequado.',
  }
}

export async function detectPrintFailure(): Promise<{
  failureDetected: boolean
  failureType: string | null
  confidence: number
  imageUrl: string | null
  actionTaken: string | null
  message: string
}> {
  if (!activePrintJob || activePrintJob.status !== 'printing') {
    return {
      failureDetected: false,
      failureType: null,
      confidence: 0,
      imageUrl: null,
      actionTaken: null,
      message: 'Nenhuma impressão ativa para monitorar.',
    }
  }

  const hasFailure = Math.random() > 0.85
  if (!hasFailure) {
    return {
      failureDetected: false,
      failureType: null,
      confidence: 0.95,
      imageUrl: null,
      actionTaken: null,
      message: 'Impressão estável. Camadas uniformes detectadas pela câmera.',
    }
  }

  const failureTypes = [
    'Efeito teia de aranha (spaghetti) — extrusão sem suporte',
    'Fresno/Blob — acúmulo de filamento no bico',
    'Descolamento da base — peça solta da mesa',
    'Under-extrusion — camadas finas ou falhadas',
  ]

  const failureType = failureTypes[Math.floor(Math.random() * failureTypes.length)]
  const confidence = 0.82 + Math.random() * 0.15

  activePrintJob.status = 'failed'

  return {
    failureDetected: true,
    failureType,
    confidence: Math.round(confidence * 100) / 100,
    imageUrl: 'https://example.com/print-failure-snapshot.jpg',
    actionTaken: 'Impressão cancelada automaticamente para economizar material.',
    message: `⚠️ FALHA DETECTADA: ${failureType}. Impressão cancelada para economizar material. Perda estimada: ${Math.floor(activePrintJob.filamentUsed * (1 - activePrintJob.progress / 100))}g de filamento.`,
  }
}

export async function controlBenchTool(
  toolId: string,
  action: 'on' | 'off' | 'standby',
  temperature?: number
): Promise<{
  success: boolean
  tool: BenchTool | null
  autoOffScheduled: boolean
  message: string
}> {
  const tool = benchTools.find(t => t.id === toolId)
  if (!tool) {
    return { success: false, tool: null, autoOffScheduled: false, message: `Ferramenta ${toolId} não encontrada na bancada.` }
  }

  tool.status = action

  if (action === 'on' && temperature) {
    tool.temperature = temperature
  }

  if (action === 'on') {
    const autoOffMinutes = 10
    tool.autoOffTimer = autoOffMinutes
    return {
      success: true,
      tool: { ...tool },
      autoOffScheduled: true,
      message: `${tool.name} ligado. Desligamento automático programado em ${autoOffMinutes} minutos por segurança.`,
    }
  }

  if (action === 'off') {
    tool.autoOffTimer = null
    if (tool.type === 'soldering_iron') {
      tool.temperature = 25
    }
    return {
      success: true,
      tool: { ...tool },
      autoOffScheduled: false,
      message: `${tool.name} desligado.`,
    }
  }

  return {
    success: true,
    tool: { ...tool },
    autoOffScheduled: false,
    message: `${tool.name} em modo de espera.`,
  }
}

export async function listBenchTools(): Promise<{
  tools: BenchTool[]
  activeTools: BenchTool[]
  totalPowerConsumption: number
}> {
  const activeTools = benchTools.filter(t => t.status === 'on')
  const totalPower = benchTools.reduce((acc, t) => acc + (t.status === 'on' ? t.powerConsumption : 0), 0)

  return {
    tools: benchTools,
    activeTools,
    totalPowerConsumption: totalPower,
  }
}

export async function scheduleAutoOff(
  toolId: string,
  minutes: number
): Promise<{
  success: boolean
  tool: BenchTool | null
  message: string
}> {
  const tool = benchTools.find(t => t.id === toolId)
  if (!tool) {
    return { success: false, tool: null, message: `Ferramenta ${toolId} não encontrada.` }
  }

  tool.autoOffTimer = minutes
  return {
    success: true,
    tool: { ...tool },
    message: `Desligamento automático de ${tool.name} programado para ${minutes} minutos.`,
  }
}

export async function getBenchPresenceSafety(): Promise<{
  userPresent: boolean
  minutesAway: number | null
  autoOffTools: string[]
  safe: boolean
  message: string
}> {
  const userPresent = Math.random() > 0.3
  const minutesAway = userPresent ? 0 : Math.floor(Math.random() * 20) + 1
  const activeHeatTools = benchTools.filter(t => t.status === 'on' && (t.type === 'soldering_iron' || t.type === '3d_printer'))

  if (!userPresent && activeHeatTools.length > 0) {
    const autoOff = activeHeatTools.map(t => {
      t.status = 'off'
      t.temperature = 25
      t.autoOffTimer = null
      return t.name
    })

    return {
      userPresent: false,
      minutesAway,
      autoOffTools: autoOff,
      safe: true,
      message: `⚠️ Você está ausente há ${minutesAway} minutos. Ferramentas perigosas desligadas automaticamente: ${autoOff.join(', ')}. Segurança garantida, Senhor.`,
    }
  }

  return {
    userPresent,
    minutesAway: null,
    autoOffTools: [],
    safe: true,
    message: userPresent ? 'Você está na bancada. Todas as ferramentas operando com segurança.' : 'Bancada segura. Nenhuma ferramenta de calor ativa.',
  }
}
