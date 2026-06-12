export function sanitizeForTTS(text: string): string {
  return text
    .replace(/#{1,6}\s?/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[-*+]\s/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n+/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[<>]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/(\d+)\s*\/\s*(\d+)/g, '$1 de $2')
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
    .trim()
}

export async function speakWithElevenLabs(
  text: string,
  voiceId: string
): Promise<boolean> {
  try {
    const cleanText = sanitizeForTTS(text)
    if (!cleanText) return false

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText, voiceId }),
    })

    if (!response.ok) return false

    const blob = await response.blob()
    if (!blob || blob.size === 0) return false

    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)

    return new Promise((resolve) => {
      audio.onended = () => { URL.revokeObjectURL(url); resolve(true) }
      audio.onerror = () => { URL.revokeObjectURL(url); resolve(false) }
      audio.play().catch(() => { URL.revokeObjectURL(url); resolve(false) })
    })
  } catch {
    return false
  }
}

export function speakWithWebSpeech(
  text: string,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined') { onEnd?.(); return }

  try {
    window.speechSynthesis.cancel()

    const cleanText = sanitizeForTTS(text)
    if (!cleanText) { onEnd?.(); return }

    const voices = window.speechSynthesis.getVoices()
    const ptBR = voices.filter((v) => v.lang === 'pt-BR')
    const enUS = voices.filter((v) => v.lang === 'en-US')

    const voice =
      ptBR.find((v) => v.name.includes('Google')) ||
      ptBR.find((v) => !v.name.includes('Microsoft')) ||
      ptBR[0] ||
      enUS.find((v) => v.name.includes('Google')) ||
      voices.find((v) => v.lang.startsWith('pt')) ||
      voices[0]

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.voice = voice || null
    utterance.rate = 1.25
    utterance.pitch = 0.95
    utterance.volume = 1.0
    utterance.lang = voice?.lang || 'pt-BR'
    utterance.onend = () => onEnd?.()
    utterance.onerror = () => onEnd?.()

    window.speechSynthesis.speak(utterance)
  } catch {
    onEnd?.()
  }
}
