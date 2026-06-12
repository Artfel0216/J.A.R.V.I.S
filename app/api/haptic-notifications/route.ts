import { NextResponse } from 'next/server'
import { sendHapticAlert, getHapticHistory, acknowledgeAlert, configureBoneConduction, getBoneConductionStatus, findWearableDevices, vibrateMorse, getAlertPatterns, testHapticFeedback } from '@/lib/haptic-notifications'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'status'

  try {
    switch (type) {
      case 'history':
        return NextResponse.json(await getHapticHistory())
      case 'bone-conduction':
        return NextResponse.json(await getBoneConductionStatus())
      case 'devices':
        return NextResponse.json(await findWearableDevices())
      case 'patterns':
        return NextResponse.json(await getAlertPatterns())
      default:
        return NextResponse.json(await findWearableDevices())
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
      case 'sendAlert':
        return NextResponse.json(await sendHapticAlert(params.alertType, params.message))
      case 'acknowledge':
        return NextResponse.json(await acknowledgeAlert(params.alertId))
      case 'configureBone':
        return NextResponse.json(await configureBoneConduction(params.config || {}))
      case 'vibrateMorse':
        return NextResponse.json(await vibrateMorse(params.text))
      case 'testFeedback':
        return NextResponse.json(await testHapticFeedback(params.deviceId, params.patternName))
      default:
        return NextResponse.json({ error: 'Ação não reconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
