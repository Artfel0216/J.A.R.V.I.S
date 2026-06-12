import { NextResponse } from 'next/server'

const ELEVENLABS_API = 'https://api.elevenlabs.io/v1'

export async function POST(req: Request) {
  const { text, voiceId } = await req.json()
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey || !text || !text.trim()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }

  try {
    const response = await fetch(`${ELEVENLABS_API}/text-to-speech/${voiceId || '21m00Tcm4TlvDq8ikWAM'}/stream`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.75,
          style: 0.20,
          use_speaker_boost: true,
        },
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'elevenlabs_error' }, { status: 502 })
    }

    const audioBuffer = await response.arrayBuffer()
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })
  } catch {
    return NextResponse.json({ error: 'proxy_error' }, { status: 502 })
  }
}
