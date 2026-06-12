export interface PresenceInfo {
  detected: boolean
  deviceName?: string
  deviceType?: 'smartphone' | 'smartwatch' | 'laptop' | 'other'
  signalStrength?: number
  lastSeen: string
  room?: string
}

export interface FaceAnalysis {
  facesDetected: number
  knownFaces: string[]
  expressions: string[]
  privacyMode: boolean
}

export interface AudioZone {
  zone: string
  active: boolean
  currentSource?: string
  isPlaying: boolean
}

const knownDevices: PresenceInfo[] = [
  { detected: true, deviceName: 'iPhone de Tony', deviceType: 'smartphone', signalStrength: 85, lastSeen: new Date().toISOString(), room: 'Escritorio' },
  { detected: true, deviceName: 'Apple Watch de Tony', deviceType: 'smartwatch', signalStrength: 72, lastSeen: new Date().toISOString(), room: 'Escritorio' },
]

const audioZones: AudioZone[] = [
  { zone: 'Escritorio', active: true, currentSource: 'Noticias', isPlaying: false },
  { zone: 'Sala de Estar', active: false, currentSource: undefined, isPlaying: false },
  { zone: 'Cozinha', active: false, currentSource: undefined, isPlaying: false },
  { zone: 'Quarto Principal', active: false, currentSource: undefined, isPlaying: false },
]

export async function checkPresence(): Promise<{
  devices: PresenceInfo[]
  totalDevices: number
  primaryRoom: string | null
  homeOccupied: boolean
}> {
  const now = new Date().toISOString()
  knownDevices.forEach(d => {
    d.lastSeen = now
    d.signalStrength = Math.max(30, Math.min(100, (d.signalStrength || 50) + Math.round(Math.random() * 10 - 5)))
  })

  const primary = knownDevices.find(d => d.signalStrength && d.signalStrength > 60) || knownDevices[0]

  return {
    devices: knownDevices,
    totalDevices: knownDevices.length,
    primaryRoom: primary?.room || null,
    homeOccupied: knownDevices.some(d => d.detected),
  }
}

export async function scanFaces(): Promise<FaceAnalysis> {
  const hasVisitors = Math.random() > 0.7
  return {
    facesDetected: hasVisitors ? Math.floor(Math.random() * 3) + 1 : 1,
    knownFaces: hasVisitors ? ['Tony Stark', 'Visitante Desconhecido'] : ['Tony Stark'],
    expressions: ['neutro'],
    privacyMode: hasVisitors,
  }
}

export async function switchAudioZone(fromZone: string, toZone: string): Promise<{
  success: boolean
  message: string
  previousZone: string
  newZone: string
  audioState: AudioZone[]
}> {
  const source = audioZones.find(z => z.zone === fromZone)

  audioZones.forEach(z => {
    z.active = false
    z.isPlaying = false
  })

  const targetZone = audioZones.find(z => z.zone === toZone)
  if (targetZone) {
    targetZone.active = true
    targetZone.isPlaying = true
    targetZone.currentSource = source?.currentSource || 'Audio'
  }

  const sourceZone = audioZones.find(z => z.zone === fromZone)
  if (sourceZone) {
    sourceZone.isPlaying = false
    sourceZone.active = false
  }

  return {
    success: true,
    message: 'Audio transferido de "' + fromZone + '" para "' + toZone + '".',
    previousZone: fromZone,
    newZone: toZone,
    audioState: audioZones,
  }
}

export async function getAudioZones(): Promise<{
  zones: AudioZone[]
  activeZone: string | null
}> {
  const active = audioZones.find(z => z.active)
  return {
    zones: audioZones,
    activeZone: active?.zone || null,
  }
}

export async function detectApproach(): Promise<{
  approaching: boolean
  distance: string
  room: string | null
  message: string | null
}> {
  const signal = knownDevices.reduce((acc, d) => Math.max(acc, d.signalStrength || 0), 0)
  const approaching = signal > 70
  const primary = knownDevices.find(d => d.signalStrength && d.signalStrength > 60) || knownDevices[0]

  return {
    approaching,
    distance: signal > 80 ? 'Muito proxima' : signal > 60 ? 'Proxima' : 'Distante',
    room: primary?.room || null,
    message: approaching ? 'Bem-vindo de volta, Senhor. Detectado em ' + (primary?.room || 'casa') + '.' : null,
  }
}
