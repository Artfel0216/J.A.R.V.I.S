import { NextResponse } from 'next/server'
import { analyzeFatigue, getHealthSnapshot, relaxEnvironment, analyzeSleep } from '@/lib/health-biometrics'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'fatigue'

  try {
    switch (type) {
      case 'fatigue':
        return NextResponse.json(await analyzeFatigue())
      case 'snapshot':
        return NextResponse.json(await getHealthSnapshot())
      case 'sleep':
        return NextResponse.json(await analyzeSleep())
      default:
        return NextResponse.json(await analyzeFatigue())
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body

    switch (action) {
      case 'relax':
        return NextResponse.json(await relaxEnvironment())
      default:
        return NextResponse.json({ error: 'Acao desconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
