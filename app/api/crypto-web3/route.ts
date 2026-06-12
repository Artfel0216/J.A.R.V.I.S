import { NextResponse } from 'next/server'
import { findArbitrageOpportunities, executeArbitrage, auditSmartContract, getMiningStatus, stopMining, setRiskTolerance } from '@/lib/crypto-web3'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'arbitrage'

  try {
    switch (type) {
      case 'arbitrage':
        return NextResponse.json(await findArbitrageOpportunities())
      case 'mining':
        return NextResponse.json(await getMiningStatus())
      default:
        return NextResponse.json(await findArbitrageOpportunities())
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
      case 'executeArbitrage':
        return NextResponse.json(await executeArbitrage(params.opportunityIndex))
      case 'auditContract':
        return NextResponse.json(await auditSmartContract(params.contractAddress, params.chain))
      case 'stopMining':
        return NextResponse.json(await stopMining())
      case 'setRiskTolerance':
        return NextResponse.json(await setRiskTolerance(params.maxRiskPerTrade))
      default:
        return NextResponse.json({ error: 'Ação não reconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
