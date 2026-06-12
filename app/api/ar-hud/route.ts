import { NextResponse } from 'next/server'
import { projectAROverlay, getPowerGridStatus, hudGetMetrics } from '@/lib/ar-integration'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'metrics'

  try {
    switch (type) {
      case 'metrics':
        return NextResponse.json(await hudGetMetrics())
      case 'grid':
        return NextResponse.json(await getPowerGridStatus())
      case 'ar':
        const device = searchParams.get('device') || ''
        return NextResponse.json(await projectAROverlay(device))
      default:
        return NextResponse.json(await hudGetMetrics())
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
