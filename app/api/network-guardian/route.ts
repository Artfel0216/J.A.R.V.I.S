import { NextResponse } from 'next/server'
import { scanNetwork, isolateThreat, getThermalStatus, triggerThermalCooling } from '@/lib/network-guardian'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'scan'

  try {
    switch (type) {
      case 'scan':
        return NextResponse.json(await scanNetwork())
      case 'thermal':
        return NextResponse.json(await getThermalStatus())
      default:
        return NextResponse.json(await scanNetwork())
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, deviceIp } = body

    switch (action) {
      case 'isolate':
        return NextResponse.json(await isolateThreat(deviceIp))
      case 'cool':
        return NextResponse.json(await triggerThermalCooling())
      default:
        return NextResponse.json({ error: 'Ação desconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
