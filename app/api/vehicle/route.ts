import { NextResponse } from 'next/server'
import { getVehicleStatus, checkTirePressure, calculateRoute, planTrip } from '@/lib/vehicle-copilot'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'status'

  try {
    switch (type) {
      case 'status':
        return NextResponse.json(await getVehicleStatus())
      case 'tires':
        return NextResponse.json(await checkTirePressure())
      default:
        return NextResponse.json(await getVehicleStatus())
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, destination, departureDate } = body

    switch (action) {
      case 'route':
        return NextResponse.json(await calculateRoute(destination || ''))
      case 'plan-trip':
        return NextResponse.json(await planTrip(destination || '', departureDate || new Date().toISOString()))
      default:
        return NextResponse.json({ error: 'Acao desconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
