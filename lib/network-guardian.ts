export interface NetworkDevice {
  ip: string
  mac: string
  hostname: string
  known: boolean
  firstSeen: string
  lastSeen: string
  manufacturer?: string
  threatLevel: 'safe' | 'unknown' | 'suspicious' | 'malicious'
}

export interface ThreatIsolationResult {
  success: boolean
  isolatedDevice: string
  backupsTriggered: string[]
  networkBlocked: boolean
  message: string
}

export interface ThermalReading {
  cpuTemp: number
  gpuTemp?: number
  ambientTemp: number
  acActive: boolean
  acRoom: string
  critical: boolean
}

const knownNetworkDevices: NetworkDevice[] = [
  { ip: '192.168.1.1', mac: '00:11:22:33:44:55', hostname: 'router.stark.lab', known: true, firstSeen: '2026-01-01T00:00:00Z', lastSeen: new Date().toISOString(), manufacturer: 'Cisco', threatLevel: 'safe' },
  { ip: '192.168.1.10', mac: 'AA:BB:CC:DD:EE:01', hostname: 'tony-iphone', known: true, firstSeen: '2026-01-15T00:00:00Z', lastSeen: new Date().toISOString(), manufacturer: 'Apple', threatLevel: 'safe' },
  { ip: '192.168.1.20', mac: 'AA:BB:CC:DD:EE:02', hostname: 'tony-macbook', known: true, firstSeen: '2026-02-01T00:00:00Z', lastSeen: new Date().toISOString(), manufacturer: 'Apple', threatLevel: 'safe' },
  { ip: '192.168.1.30', mac: 'AA:BB:CC:DD:EE:03', hostname: 'jarvis-server', known: true, firstSeen: '2026-01-01T00:00:00Z', lastSeen: new Date().toISOString(), manufacturer: 'Custom', threatLevel: 'safe' },
  { ip: '192.168.1.100', mac: 'AA:BB:CC:DD:EE:FF', hostname: 'stark-arc-reactor-monitor', known: true, firstSeen: '2026-03-01T00:00:00Z', lastSeen: new Date().toISOString(), manufacturer: 'Stark Industries', threatLevel: 'safe' },
]

export async function scanNetwork(): Promise<{
  devices: NetworkDevice[]
  totalDevices: number
  unknownDevices: number
  suspiciousDevices: number
  alert: boolean
  alertMessage: string | null
}> {
  const now = new Date().toISOString()

  knownNetworkDevices.forEach(d => {
    d.lastSeen = now
  })

  const unknownCount = knownNetworkDevices.filter(d => !d.known).length
  const suspiciousCount = knownNetworkDevices.filter(d => d.threatLevel === 'suspicious' || d.threatLevel === 'malicious').length
  const alert = unknownCount > 0 || suspiciousCount > 0

  let alertMessage: string | null = null
  if (alert) {
    const threats = knownNetworkDevices.filter(d => !d.known || d.threatLevel !== 'safe')
    alertMessage = `ALERTA: ${threats.length} dispositivo(s) não reconhecido(s) na rede: ${threats.map(d => `${d.hostname} (${d.ip})`).join(', ')}`
  }

  return {
    devices: knownNetworkDevices,
    totalDevices: knownNetworkDevices.length,
    unknownDevices: unknownCount,
    suspiciousDevices: suspiciousCount,
    alert,
    alertMessage,
  }
}

export async function isolateThreat(deviceIp: string): Promise<ThreatIsolationResult> {
  const device = knownNetworkDevices.find(d => d.ip === deviceIp)
  if (!device) {
    return {
      success: false,
      isolatedDevice: deviceIp,
      backupsTriggered: [],
      networkBlocked: false,
      message: `Dispositivo ${deviceIp} não encontrado na rede.`,
    }
  }

  device.threatLevel = 'malicious'

  return {
    success: true,
    isolatedDevice: `${device.hostname} (${device.ip})`,
    backupsTriggered: ['Documentos_Criticos', 'Projetos_Armadura_MK_LXXXV', 'Dados_Stark_Industries'],
    networkBlocked: true,
    message: `🚨 ISOLAMENTO DE AMEAÇA ATIVADO: ${device.hostname} (${device.ip}) foi desconectado da rede. Backup automático dos dados críticos iniciado.`,
  }
}

export async function getThermalStatus(): Promise<ThermalReading> {
  const cpuLoad = 30 + Math.random() * 60
  const cpuTemp = 40 + cpuLoad * 0.6
  const gpuTemp = cpuLoad > 50 ? cpuTemp + 10 + Math.random() * 15 : undefined
  const critical = cpuTemp > 75 || (gpuTemp || 0) > 80

  return {
    cpuTemp: Math.round(cpuTemp * 10) / 10,
    gpuTemp: gpuTemp ? Math.round(gpuTemp * 10) / 10 : undefined,
    ambientTemp: 24,
    acActive: critical,
    acRoom: 'Escritório',
    critical,
  }
}

export async function triggerThermalCooling(): Promise<{
  success: boolean
  acActivated: boolean
  acRoom: string
  acMode: string
  acTemperature: number
  message: string
}> {
  return {
    success: true,
    acActivated: true,
    acRoom: 'Escritório',
    acMode: 'cool',
    acTemperature: 16,
    message: '🔄 SISTEMA DE RESFRIAMENTO DE EMERGÊNCIA ATIVADO. Ar-condicionado do Escritório ajustado para 16°C no modo máximo para resfriar o ambiente.',
  }
}
