import { NextResponse } from 'next/server'
import { scanFridge, suggestRecipe, getCircadianStatus, adjustCircadianLighting, analyzeMicroExpressions, activateSlowDownProtocol, getNutritionAnalysis } from '@/lib/bio-hacking'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'fridge'

  try {
    switch (type) {
      case 'fridge':
        return NextResponse.json(await scanFridge())
      case 'recipes':
        return NextResponse.json(await suggestRecipe())
      case 'circadian':
        return NextResponse.json(await getCircadianStatus())
      case 'mood':
        return NextResponse.json(await analyzeMicroExpressions())
      case 'nutrition':
        return NextResponse.json(await getNutritionAnalysis())
      default:
        return NextResponse.json(await scanFridge())
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
      case 'adjustLighting':
        return NextResponse.json(await adjustCircadianLighting(params.mode, params.kelvin, params.brightness))
      case 'slowDown':
        return NextResponse.json(await activateSlowDownProtocol())
      default:
        return NextResponse.json({ error: 'Ação não reconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
