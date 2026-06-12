import { NextResponse } from 'next/server'
import { scanLegalPortals, generateTaxDocuments, payTaxDocument } from '@/lib/fiscal-warfare'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'scan'

  try {
    switch (type) {
      case 'scan':
        return NextResponse.json(await scanLegalPortals())
      case 'taxes':
        return NextResponse.json(await generateTaxDocuments())
      default:
        return NextResponse.json(await scanLegalPortals())
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
      case 'payTax':
        return NextResponse.json(await payTaxDocument(params.documentId))
      case 'generateTaxes':
        return NextResponse.json(await generateTaxDocuments())
      default:
        return NextResponse.json({ error: 'Ação não reconhecida.' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
