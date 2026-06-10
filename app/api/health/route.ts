import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    { 
      status: 'online', 
      system: 'J.A.R.V.I.S.', 
      version: '4.2-2026', 
      timestamp: new Date().toISOString() 
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  )
}