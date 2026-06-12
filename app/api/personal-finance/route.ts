import { NextResponse } from 'next/server'
import { trackPrice, checkPriceAlerts, getUtilityBills, getSpendingInsights } from '@/lib/personal-finance'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'alerts'

  try {
    switch (type) {
      case 'alerts':
        return NextResponse.json(await checkPriceAlerts())
      case 'bills':
        return NextResponse.json(await getUtilityBills())
      case 'insights':
        return NextResponse.json(await getSpendingInsights())
      default:
        return NextResponse.json(await checkPriceAlerts())
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, productName, targetPrice } = body

    switch (action) {
      case 'track-price':
        return NextResponse.json(await trackPrice(productName || '', Number(targetPrice) || 0))
      default:
        return NextResponse.json({ error: 'Acao desconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
