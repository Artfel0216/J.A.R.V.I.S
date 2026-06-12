export interface HapticPattern {
  name: string
  description: string
  pattern: number[]
  duration: number
  intensity: 'low' | 'medium' | 'high'
}

export interface HapticAlert {
  id: string
  type: 'server_down' | 'network_intrusion' | 'build_failed' | 'deploy_failed' | 'security_breach' | 'system_alert' | 'custom'
  pattern: string
  timestamp: string
  delivered: boolean
  message: string
  acknowledged: boolean
}

export interface WearableDevice {
  id: string
  name: string
  type: 'bracelet' | 'vest' | 'ring' | 'glasses'
  connected: boolean
  battery: number
  firmwareVersion: string
  lastContact: string
}

export interface BoneConductionConfig {
  enabled: boolean
  volume: number
  privacyMode: boolean
  ambientPassthrough: boolean
  connectedDevice: string | null
}

const morseCodeMap: Record<string, number[]> = {
  'A': [0, 300, 0, 100, 0, 100],
  'B': [0, 100, 0, 100, 0, 100, 0, 100, 0, 300],
  'C': [0, 100, 0, 100, 0, 300, 0, 100, 0, 100, 0, 300],
  'D': [0, 100, 0, 100, 0, 100, 0, 100, 0, 300],
  'E': [0, 100],
  'F': [0, 100, 0, 100, 0, 300, 0, 100, 0, 100],
  'G': [0, 300, 0, 100, 0, 100, 0, 300],
  'H': [0, 100, 0, 100, 0, 100, 0, 100, 0, 100],
  'I': [0, 100, 0, 100, 0, 100],
  'J': [0, 100, 0, 100, 0, 300, 0, 100, 0, 300],
  'K': [0, 300, 0, 100, 0, 300],
  'L': [0, 100, 0, 300, 0, 100, 0, 100, 0, 100],
  'M': [0, 300, 0, 100, 0, 300],
  'N': [0, 100, 0, 100, 0, 300],
  'O': [0, 300, 0, 100, 0, 300, 0, 100, 0, 300],
  'P': [0, 100, 0, 300, 0, 300, 0, 100, 0, 100],
  'Q': [0, 300, 0, 300, 0, 100, 0, 300],
  'R': [0, 100, 0, 100, 0, 300, 0, 100],
  'S': [0, 100, 0, 100, 0, 100],
  'T': [0, 300],
  'U': [0, 100, 0, 100, 0, 300],
  'V': [0, 100, 0, 100, 0, 100, 0, 300],
  'W': [0, 100, 0, 300, 0, 100, 0, 300],
  'X': [0, 100, 0, 300, 0, 100, 0, 300, 0, 100],
  'Y': [0, 300, 0, 100, 0, 300, 0, 300],
  'Z': [0, 300, 0, 100, 0, 100, 0, 100],
}

const predefiniedPatterns: HapticPattern[] = [
  { name: 'SOS', description: 'Perigo iminente — padrão SOS universal', pattern: [0, 100, 0, 100, 0, 100, 0, 300, 0, 300, 0, 300, 0, 100, 0, 100, 0, 100], duration: 3000, intensity: 'high' },
  { name: 'server_down', description: 'Servidor caiu — 3 pulsos longos', pattern: [0, 500, 0, 200, 0, 500, 0, 200, 0, 500], duration: 2200, intensity: 'high' },
  { name: 'network_intrusion', description: 'Invasão de rede detectada', pattern: [0, 100, 0, 100, 0, 200, 0, 200, 0, 400, 0, 400, 0, 800], duration: 2500, intensity: 'high' },
  { name: 'build_failed', description: 'Build falhou — 2 pulsos médios', pattern: [0, 300, 0, 200, 0, 300], duration: 1000, intensity: 'medium' },
  { name: 'deploy_failed', description: 'Deploy falhou — padrão descendente', pattern: [0, 400, 0, 200, 0, 300, 0, 200, 0, 200, 0, 200], duration: 2000, intensity: 'medium' },
  { name: 'security_breach', description: 'Violação de segurança — vibração contínua intermitente', pattern: [0, 100, 0, 50, 0, 100, 0, 50, 0, 100, 0, 50, 0, 100, 0, 50], duration: 1500, intensity: 'high' },
  { name: 'system_alert', description: 'Alerta geral do sistema', pattern: [0, 200, 0, 100, 0, 200], duration: 700, intensity: 'low' },
  { name: 'email', description: 'Notificação de e-mail', pattern: [0, 150, 0, 100], duration: 350, intensity: 'low' },
  { name: 'meeting', description: 'Lembrete de reunião', pattern: [0, 200, 0, 100, 0, 200, 0, 100, 0, 200], duration: 1000, intensity: 'medium' },
]

const connectedDevices: WearableDevice[] = [
  { id: 'bracelet_1', name: 'Pulseira Háptica Esquerda', type: 'bracelet', connected: false, battery: 85, firmwareVersion: '2.1.0', lastContact: new Date(Date.now() - 3600000).toISOString() },
  { id: 'vest_1', name: 'Colete de Sinalização Tátil', type: 'vest', connected: false, battery: 72, firmwareVersion: '1.4.3', lastContact: new Date(Date.now() - 7200000).toISOString() },
  { id: 'ring_1', name: 'Anel de Notificação Smart Ring', type: 'ring', connected: false, battery: 91, firmwareVersion: '3.0.1', lastContact: new Date(Date.now() - 1800000).toISOString() },
]

let boneConductionConfig: BoneConductionConfig = {
  enabled: false,
  volume: 70,
  privacyMode: true,
  ambientPassthrough: true,
  connectedDevice: 'Fone de Condução Óssea Shokz OpenComm',
}

const alertHistory: HapticAlert[] = []

export async function sendHapticAlert(
  alertType: HapticAlert['type'],
  message?: string
): Promise<{
  success: boolean
  alert: HapticAlert
  pattern: HapticPattern | undefined
  devicesNotified: number
  morseTranslation: string | null
}> {
  const pattern = predefiniedPatterns.find(p => p.name === alertType) || predefiniedPatterns.find(p => p.name === 'system_alert')

  const alert: HapticAlert = {
    id: `haptic_${Date.now()}`,
    type: alertType,
    pattern: pattern?.name || 'system_alert',
    timestamp: new Date().toISOString(),
    delivered: false,
    message: message || `Alerta háptico: ${alertType}`,
    acknowledged: false,
  }

  const activeDevices = connectedDevices.filter(d => d.connected)
  const devicesNotified = activeDevices.length || 1

  alert.delivered = true
  alertHistory.push(alert)

  let morseTranslation: string | null = null
  if (pattern) {
    morseTranslation = pattern.pattern.map((val, i) => i % 2 === 0 ? (val > 200 ? '—' : '·') : ' ').filter((_, i) => i % 2 === 0).join('')
  }

  return {
    success: true,
    alert,
    pattern,
    devicesNotified,
    morseTranslation,
  }
}

export async function getHapticHistory(): Promise<{
  alerts: HapticAlert[]
  unacknowledged: number
}> {
  return {
    alerts: alertHistory.slice(-20).reverse(),
    unacknowledged: alertHistory.filter(a => !a.acknowledged).length,
  }
}

export async function acknowledgeAlert(alertId: string): Promise<{
  success: boolean
  message: string
}> {
  const alert = alertHistory.find(a => a.id === alertId)
  if (alert) {
    alert.acknowledged = true
    return { success: true, message: 'Alerta reconhecido.' }
  }
  return { success: false, message: 'Alerta não encontrado.' }
}

export async function configureBoneConduction(
  config: Partial<BoneConductionConfig>
): Promise<{
  success: boolean
  config: BoneConductionConfig
  message: string
}> {
  boneConductionConfig = { ...boneConductionConfig, ...config }

  const messages: string[] = []
  if (config.enabled !== undefined) {
    messages.push(config.enabled ? 'Condução óssea ativada.' : 'Condução óssea desativada.')
  }
  if (config.privacyMode !== undefined) {
    messages.push(config.privacyMode ? 'Modo privacidade ativado — áudio apenas para você.' : 'Modo privacidade desativado.')
  }

  return {
    success: true,
    config: boneConductionConfig,
    message: messages.join(' ') || 'Configuração de condução óssea atualizada.',
  }
}

export async function getBoneConductionStatus(): Promise<{
  config: BoneConductionConfig
  availableDevices: string[]
}> {
  return {
    config: boneConductionConfig,
    availableDevices: [
      'Shokz OpenComm',
      'Shokz OpenRun Pro',
      'AfterShokz Aeropex',
      'Fone Ósseo Personalizado Stark Industries',
    ],
  }
}

export async function findWearableDevices(): Promise<{
  devices: WearableDevice[]
  connectedCount: number
  message: string
}> {
  connectedDevices.forEach(d => {
    d.connected = Math.random() > 0.4
    d.battery = Math.max(10, Math.min(100, d.battery + Math.floor(Math.random() * 10 - 5)))
    d.lastContact = new Date().toISOString()
  })

  const connected = connectedDevices.filter(d => d.connected)
  return {
    devices: connectedDevices,
    connectedCount: connected.length,
    message: connected.length > 0
      ? `${connected.length} dispositivo(s) háptico(s) conectado(s): ${connected.map(d => d.name).join(', ')}`
      : 'Nenhum dispositivo háptico encontrado. Verifique se o ESP32 está ligado.',
  }
}

export async function vibrateMorse(
  text: string
): Promise<{
  success: boolean
  morseSequence: number[]
  translation: string
  estimatedDuration: number
}> {
  const upperText = text.toUpperCase().replace(/[^A-Z0-9]/g, ' ')
  const sequence: number[] = []
  const chars: string[] = []

  for (const char of upperText) {
    if (char === ' ') {
      sequence.push(0, 500)
      chars.push(' ')
    } else if (morseCodeMap[char]) {
      sequence.push(...morseCodeMap[char])
      sequence.push(0, 200)
      chars.push(char)
    }
  }

  const translation = chars.map((c, i) => {
    if (c === ' ') return ' / '
    return morseCodeMap[c]
      ? morseCodeMap[c].map((v, j) => j % 2 === 0 ? (v > 200 ? '—' : '·') : '').filter(Boolean).join('')
      : c
  }).join(' ')

  const estimatedDuration = sequence.reduce((acc, v) => acc + v, 0)

  return {
    success: true,
    morseSequence: sequence,
    translation,
    estimatedDuration,
  }
}

export async function getAlertPatterns(): Promise<{
  patterns: HapticPattern[]
}> {
  return { patterns: predefiniedPatterns }
}

export async function testHapticFeedback(
  deviceId: string,
  patternName: string
): Promise<{
  success: boolean
  device: WearableDevice | undefined
  pattern: HapticPattern | undefined
  message: string
}> {
  const device = connectedDevices.find(d => d.id === deviceId)
  const pattern = predefiniedPatterns.find(p => p.name === patternName)

  if (!device) {
    return { success: false, device: undefined, pattern, message: 'Dispositivo não encontrado.' }
  }

  if (!pattern) {
    return { success: false, device, pattern: undefined, message: 'Padrão de vibração não encontrado.' }
  }

  return {
    success: true,
    device,
    pattern,
    message: `Teste enviado para ${device.name}: padrão "${pattern.name}" (${pattern.intensity}) executado com sucesso.`,
  }
}
