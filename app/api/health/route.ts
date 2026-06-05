export async function GET() {
  return Response.json({ status: 'online', system: 'J.A.R.V.I.S.', version: '3.0.1', timestamp: new Date().toISOString() })
}
