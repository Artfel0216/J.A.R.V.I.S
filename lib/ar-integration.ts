export interface ARDeviceOverlay {
  deviceName: string
  deviceType: string
  powerConsumption: string
  powerUnit: string
  estimatedTimeRemaining: string
  status: 'on' | 'off' | 'standby'
  temperature?: string
  efficiency: string
}

export interface ARProjection {
  targetDevice: string
  overlays: ARDeviceOverlay[]
  viewAngle: string
  distance: string
}

const deviceOverlays: ARDeviceOverlay[] = [
  { deviceName: 'Reator Arc MK III', deviceType: 'energy_core', powerConsumption: '3.2', powerUnit: 'GW/h', estimatedTimeRemaining: 'Indeterminado', status: 'on', temperature: '42°C', efficiency: '98.7%' },
  { deviceName: 'Servidor J.A.R.V.I.S.', deviceType: 'server', powerConsumption: '850', powerUnit: 'W', estimatedTimeRemaining: 'N/A', status: 'on', temperature: '68°C', efficiency: '94.2%' },
  { deviceName: 'Geladeira Smart', deviceType: 'appliance', powerConsumption: '45', powerUnit: 'W', estimatedTimeRemaining: 'Ciclo normal', status: 'on', efficiency: 'A+' },
  { deviceName: 'Máquina de Café', deviceType: 'appliance', powerConsumption: '1200', powerUnit: 'W', estimatedTimeRemaining: '2 min', status: 'on', efficiency: 'A' },
  { deviceName: 'Ar-Condicionado Escritório', deviceType: 'hvac', powerConsumption: '1800', powerUnit: 'W', estimatedTimeRemaining: 'Próximo ciclo: 15 min', status: 'on', temperature: '22°C', efficiency: '92%' },
  { deviceName: 'Carregador Armadura MK LXXXV', deviceType: 'charger', powerConsumption: '5000', powerUnit: 'W', estimatedTimeRemaining: '78% - 2h 30min restantes', status: 'on', efficiency: '96%' },
]

export async function projectAROverlay(targetDevice: string): Promise<ARProjection> {
  const device = deviceOverlays.find(d =>
    d.deviceName.toLowerCase().includes(targetDevice.toLowerCase())
  )

  if (!device) {
    return {
      targetDevice,
      overlays: deviceOverlays.filter(d =>
        d.deviceName.toLowerCase().includes(targetDevice.toLowerCase()) ||
        d.deviceType.toLowerCase().includes(targetDevice.toLowerCase())
      ),
      viewAngle: '45°',
      distance: '2.5m',
    }
  }

  return {
    targetDevice: device.deviceName,
    overlays: [device],
    viewAngle: '30°',
    distance: '1.8m',
  }
}

export async function getPowerGridStatus(): Promise<{
  totalConsumption: string
  consumptionUnit: string
  devices: ARDeviceOverlay[]
  topConsumer: string
  alert: boolean
  alertMessage: string | null
}> {
  const totalW = deviceOverlays.reduce((acc, d) => {
    const val = parseFloat(d.powerConsumption)
    return d.powerUnit === 'W' ? acc + val : acc
  }, 0)

  const devicesSorted = [...deviceOverlays].sort((a, b) => parseFloat(b.powerConsumption) - parseFloat(a.powerConsumption))

  return {
    totalConsumption: totalW.toLocaleString(),
    consumptionUnit: 'W',
    devices: devicesSorted,
    topConsumer: devicesSorted[0]?.deviceName || 'Nenhum',
    alert: totalW > 10000,
    alertMessage: totalW > 10000 ? `⚠️ Consumo elevado detectado: ${totalW.toLocaleString()}W. Verifique dispositivos de alto consumo.` : null,
  }
}

export async function hudGetMetrics(): Promise<{
  systemUptime: string
  activeProcesses: number
  networkTraffic: { inbound: string; outbound: string }
  activeAlerts: number
  alerts: string[]
  lastScan: string
}> {
  return {
    systemUptime: '14d 7h 32m',
    activeProcesses: 234,
    networkTraffic: { inbound: '1.2 Gbps', outbound: '340 Mbps' },
    activeAlerts: 0,
    alerts: [],
    lastScan: new Date().toISOString(),
  }
}
