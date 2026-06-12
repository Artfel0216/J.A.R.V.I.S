import { NextResponse } from 'next/server'
import { getPrintJobStatus, checkFilament, detectPrintFailure, controlBenchTool, listBenchTools, scheduleAutoOff, getBenchPresenceSafety } from '@/lib/engineering-iot'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'print-status'

  try {
    switch (type) {
      case 'print-status':
        return NextResponse.json(await getPrintJobStatus())
      case 'filament':
        return NextResponse.json(await checkFilament())
      case 'print-failure':
        return NextResponse.json(await detectPrintFailure())
      case 'bench-tools':
        return NextResponse.json(await listBenchTools())
      case 'bench-safety':
        return NextResponse.json(await getBenchPresenceSafety())
      default:
        return NextResponse.json(await getPrintJobStatus())
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, ...params } = body

    switch (action) {
      case 'controlBenchTool':
        return NextResponse.json(await controlBenchTool(params.toolId, params.toolAction, params.temperature))
      case 'scheduleAutoOff':
        return NextResponse.json(await scheduleAutoOff(params.toolId, params.minutes))
      default:
        return NextResponse.json({ error: 'Ação não reconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
