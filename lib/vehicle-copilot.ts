export interface VehicleStatus {
  connected: boolean
  fuelLevel: number
  batteryLevel?: number
  tirePressure: { [wheel: string]: string }
  oilLevel: string
  mileage: number
  nextMaintenance: string
  lastMaintenance: string
  model: string
}

export interface RouteInfo {
  destination: string
  distance: string
  estimatedTime: string
  trafficCondition: 'livre' | 'moderado' | 'intenso' | 'congestionado'
  alternativeRoutes: string[]
  fuelNeeded: string
}

export interface TravelPlan {
  destination: string
  weatherForecast: string
  roadConditions: string
  playlistGenerated: boolean
  homeModeActivated: boolean
  estimatedDeparture: string
  estimatedArrival: string
  recommendations: string[]
}

const vehicle: VehicleStatus = {
  connected: true,
  fuelLevel: 68,
  batteryLevel: 82,
  tirePressure: { 'Dianteiro E': '32 PSI', 'Dianteiro D': '31 PSI', 'Traseiro E': '30 PSI', 'Traseiro D': '33 PSI' },
  oilLevel: 'OK - 65%',
  mileage: 45230,
  nextMaintenance: '2026-08-15',
  lastMaintenance: '2026-04-10',
  model: 'Audi e-tron GT (Stark Custom)',
}

export async function getVehicleStatus(): Promise<VehicleStatus> {
  const now = new Date().toISOString()
  return {
    ...vehicle,
    fuelLevel: Math.max(5, vehicle.fuelLevel + Math.round(Math.random() * 6 - 3)),
    lastSeen: now,
  } as VehicleStatus & { lastSeen: string }
}

export async function checkTirePressure(): Promise<{
  status: 'ok' | 'warning' | 'critical'
  pressures: { [wheel: string]: string }
  alert: string | null
}> {
  const pressures = vehicle.tirePressure
  const lowTires = Object.entries(pressures).filter(([, v]) => {
    const psi = parseInt(v)
    return psi < 30
  })

  return {
    status: lowTires.length > 0 ? 'warning' : 'ok',
    pressures,
    alert: lowTires.length > 0
      ? 'ATENCAO: Pressao baixa nos pneus: ' + lowTires.map(([k]) => k).join(', ') + '. Recomendo calibrar.'
      : null,
  }
}

export async function calculateRoute(destination: string): Promise<RouteInfo> {
  const trafficOptions: RouteInfo['trafficCondition'][] = ['livre', 'moderado', 'intenso', 'congestionado']
  const traffic = trafficOptions[Math.floor(Math.random() * trafficOptions.length)]

  const distKm = Math.round(10 + Math.random() * 490)
  const timeMin = Math.round(distKm * (0.8 + Math.random() * 1.2))
  const fuelNeed = (distKm * 0.25).toFixed(1)

  return {
    destination,
    distance: distKm + ' km',
    estimatedTime: Math.floor(timeMin / 60) + 'h ' + (timeMin % 60) + 'min',
    trafficCondition: traffic,
    alternativeRoutes: [
      'Via Marginal (+' + Math.round(5 + Math.random() * 10) + 'min)',
      'Via Expressa (+' + Math.round(2 + Math.random() * 5) + 'min)',
    ],
    fuelNeeded: fuelNeed + 'L',
  }
}

export async function planTrip(destination: string, departureDate: string): Promise<TravelPlan> {
  const weatherOptions = ['Ensolarado, 28C', 'Nublado, 22C', 'Possibilidade de chuva, 19C', 'Ameno, 25C']
  const weather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)]
  const roadOptions = ['Estrada em boas condicoes', 'Trecho com obras: preveja 20min adicionais', 'Pista livre, sem restricoes']

  return {
    destination,
    weatherForecast: weather,
    roadConditions: roadOptions[Math.floor(Math.random() * roadOptions.length)],
    playlistGenerated: true,
    homeModeActivated: true,
    estimatedDeparture: departureDate,
    estimatedArrival: new Date(new Date(departureDate).getTime() + 2 * 60 * 60 * 1000).toISOString(),
    recommendations: [
      'Playlist "Stark Road Trip 2026" gerada com 4h de musica',
      'Modo Ferias ativado: luzes acendendo aleatoriamente entre 18h-23h',
      'Previsao do tempo no destino: ' + weather,
      'Nivel de combustivel atual: ' + vehicle.fuelLevel + '% - ' + (vehicle.fuelLevel < 30 ? 'Recomendo abastecer antes de sair' : 'Suficiente para a viagem'),
    ],
  }
}
