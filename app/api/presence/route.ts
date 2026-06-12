import { NextResponse } from 'next/server'
import { checkPresence, scanFaces, detectApproach, getAudioZones } from '@/lib/spatial-awareness'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'presence'

  try {
    switch (type) {
      case 'presence':
        return NextResponse.json(await checkPresence())
      case 'faces':
        return NextResponse.json(await scanFaces())
      case 'approach':
        return NextResponse.json(await detectApproach())
      case 'zones':
        return NextResponse.json(await getAudioZones())
      default:
        return NextResponse.json(await checkPresence())
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

