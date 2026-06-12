interface DeviceState {
  room: string
  type: 'light' | 'climate' | 'lock' | 'camera'
  status: 'on' | 'off' | 'locked' | 'unlocked'
  brightness?: number
  color?: string
  temperature?: number
  mode?: 'cool' | 'heat' | 'auto'
  lastUpdated: string
}

const devices: DeviceState[] = [
  { room: 'Sala de Estar', type: 'light', status: 'on', brightness: 80, color: '#ffffff', lastUpdated: new Date().toISOString() },
  { room: 'Sala de Estar', type: 'climate', status: 'on', temperature: 23, mode: 'auto', lastUpdated: new Date().toISOString() },
  { room: 'Cozinha', type: 'light', status: 'on', brightness: 100, color: '#fff9e6', lastUpdated: new Date().toISOString() },
  { room: 'Quarto Principal', type: 'light', status: 'off', brightness: 0, color: '#ffffff', lastUpdated: new Date().toISOString() },
  { room: 'Quarto Principal', type: 'climate', status: 'on', temperature: 21, mode: 'cool', lastUpdated: new Date().toISOString() },
  { room: 'Escritório', type: 'light', status: 'on', brightness: 70, color: '#ffffff', lastUpdated: new Date().toISOString() },
  { room: 'Escritório', type: 'climate', status: 'off', temperature: 22, mode: 'auto', lastUpdated: new Date().toISOString() },
  { room: 'Garagem', type: 'light', status: 'off', brightness: 0, color: '#ffffff', lastUpdated: new Date().toISOString() },
  { room: 'Entrada Principal', type: 'lock', status: 'locked', lastUpdated: new Date().toISOString() },
  { room: 'Entrada Principal', type: 'camera', status: 'on', lastUpdated: new Date().toISOString() },
  { room: 'Portão', type: 'lock', status: 'locked', lastUpdated: new Date().toISOString() },
  { room: 'Portão', type: 'camera', status: 'on', lastUpdated: new Date().toISOString() },
]

function findDevices(room: string, type?: string): DeviceState[] {
  const roomLower = room.toLowerCase()
  return devices.filter(d =>
    d.room.toLowerCase().includes(roomLower) &&
    (!type || d.type === type)
  )
}

function formatDevicesList(list: DeviceState[]): string {
  if (list.length === 0) return 'Nenhum dispositivo encontrado.'
  return list.map(d => {
    let info = `${d.room} [${d.type}] → ${d.status}`
    if (d.type === 'light' && d.brightness !== undefined) info += `, brilho ${d.brightness}%`
    if (d.type === 'climate' && d.temperature !== undefined) info += `, ${d.temperature}°C (${d.mode})`
    return info
  }).join('\n')
}

export async function controlLighting(params: Record<string, any>): Promise<Record<string, any>> {
  const { room, state, brightness, color } = params
  const target = room ? findDevices(room, 'light') : devices.filter(d => d.type === 'light')

  if (target.length === 0) {
    return { error: `Nenhuma luz encontrada${room ? ` em "${room}"` : ''}.` }
  }

  target.forEach(d => {
    if (state) d.status = state
    if (brightness !== undefined) d.brightness = Math.max(0, Math.min(100, brightness))
    if (color) d.color = color
    d.lastUpdated = new Date().toISOString()
  })

  return {
    success: true,
    message: `Luzes ${state === 'off' ? 'apagadas' : 'ajustadas'} em ${target.map(d => d.room).join(', ')}.`,
    devices: formatDevicesList(target),
  }
}

export async function controlClimate(params: Record<string, any>): Promise<Record<string, any>> {
  const { room, temperature, mode, state } = params
  const target = room ? findDevices(room, 'climate') : devices.filter(d => d.type === 'climate')

  if (target.length === 0) {
    return { error: `Nenhum climatizador encontrado${room ? ` em "${room}"` : ''}.` }
  }

  target.forEach(d => {
    if (state) d.status = state
    if (temperature !== undefined) d.temperature = Math.max(16, Math.min(30, temperature))
    if (mode) d.mode = mode
    d.lastUpdated = new Date().toISOString()
  })

  const temps = target.map(d => d.temperature).filter(Boolean)
  return {
    success: true,
    message: `Climatizador ${state === 'off' ? 'desligado' : 'ajustado'} em ${target.map(d => d.room).join(', ')}.${temps.length ? ` Temperatura: ${temps.join('°C, ')}°C.` : ''}`,
    devices: formatDevicesList(target),
  }
}

export async function securityAction(params: Record<string, any>): Promise<Record<string, any>> {
  const action: string = params.action ?? 'status'
  const location: string | undefined = params.location
  const locks = location ? findDevices(location, 'lock') : devices.filter(d => d.type === 'lock')
  const cameras = location ? findDevices(location, 'camera') : devices.filter(d => d.type === 'camera')

  if (action === 'status') {
    const allSecure = devices.filter(d => d.type === 'lock' || d.type === 'camera')
    return {
      success: true,
      message: 'Relatório de segurança:',
      devices: formatDevicesList(allSecure),
      secure: allSecure.every(d => d.type === 'lock' ? d.status === 'locked' : d.status === 'on'),
    }
  }

  if (action === 'lock') {
    locks.forEach(d => { d.status = 'locked'; d.lastUpdated = new Date().toISOString() })
    return { success: true, message: `Fechaduras trancadas: ${locks.map(d => d.room).join(', ')}.` }
  }

  if (action === 'unlock') {
    locks.forEach(d => { d.status = 'unlocked'; d.lastUpdated = new Date().toISOString() })
    return { success: true, message: `Fechaduras destrancadas: ${locks.map(d => d.room).join(', ')}.` }
  }

  if (action === 'alerta') {
    return {
      success: true,
      alert: true,
      message: 'ALERTA DE SEGURANÇA: Movimento incomum detectado. Câmeras e sensores em alerta máximo.',
    }
  }

  return { error: 'Ação de segurança desconhecida.' }
}

export async function nightMode(): Promise<Record<string, any>> {
  const lights = devices.filter(d => d.type === 'light')
  const climates = devices.filter(d => d.type === 'climate')
  const now = new Date().toISOString()

  lights.forEach(d => {
    if (!d.room.includes('Garagem')) {
      d.status = 'off'
      d.brightness = 0
    }
    d.lastUpdated = now
  })
  climates.forEach(d => {
    if (d.room === 'Quarto Principal') {
      d.temperature = 20
      d.mode = 'cool'
    } else {
      d.status = 'off'
    }
    d.lastUpdated = now
  })

  devices.filter(d => d.type === 'lock').forEach(d => { d.status = 'locked'; d.lastUpdated = now })
  devices.filter(d => d.type === 'camera').forEach(d => { d.status = 'on'; d.lastUpdated = now })

  return {
    success: true,
    message: 'Modo Noturno ativado. Luzes apagadas (exceto garagem), climatizadores em economia, portas trancadas, câmeras em monitoramento.',
  }
}

export async function listDevices(type?: string): Promise<Record<string, any>> {
  const list = type ? devices.filter(d => d.type === type) : devices
  return {
    devices: formatDevicesList(list),
    count: list.length,
  }
}
