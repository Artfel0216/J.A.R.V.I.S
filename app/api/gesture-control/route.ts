import { NextResponse } from 'next/server'
import { recognizeGesture, startEyeTracking, stopEyeTracking, getCurrentGaze, detectCodeIssueByGaze, getGestureStats, getAvailableGestures } from '@/lib/gesture-control'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'gesture'

  try {
    switch (type) {
      case 'gesture':
        return NextResponse.json(await recognizeGesture())
      case 'gaze':
        return NextResponse.json(await getCurrentGaze())
      case 'stats':
        return NextResponse.json(await getGestureStats())
      case 'available':
        return NextResponse.json(await getAvailableGestures())
      default:
        return NextResponse.json(await recognizeGesture())
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
      case 'startEyeTracking':
        return NextResponse.json(await startEyeTracking())
      case 'stopEyeTracking':
        return NextResponse.json(await stopEyeTracking())
      case 'detectCodeIssue':
        return NextResponse.json(await detectCodeIssueByGaze(params.codeLine))
      default:
        return NextResponse.json({ error: 'Ação não reconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
