'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { speakWithElevenLabs, speakWithWebSpeech } from '@/lib/tts-engine'

interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: { prototype: SpeechRecognition; new (): SpeechRecognition }
    webkitSpeechRecognition?: { prototype: SpeechRecognition; new (): SpeechRecognition }
  }
}

export function useSpeech() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SR)
  }, [])

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }, [])

  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    stopSpeaking()

    const handleEnd = () => {
      setIsSpeaking(false)
      onEnd?.()
    }

    setIsSpeaking(true)

    const ok = await speakWithElevenLabs(text, '21m00Tcm4TlvDq8ikWAM')

    if (ok) {
      setIsSpeaking(false)
      onEnd?.()
    } else {
      speakWithWebSpeech(text, handleEnd)
    }
  }, [stopSpeaking])

  const startListening = useCallback((
    onResult: (text: string, isFinal: boolean) => void,
    onEnd?: () => void
  ) => {
    if (typeof window === 'undefined') return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch { }
    }

    const rec = new SR()
    rec.lang = 'pt-BR'
    rec.continuous = false
    rec.interimResults = true

    rec.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result: SpeechRecognitionResult) => result[0].transcript)
        .join('')
      const isFinal = event.results[event.results.length - 1].isFinal
      onResult(transcript, isFinal)
    }

    const handleListeningEnd = () => {
      setIsListening(false)
      onEnd?.()
    }

    rec.onend = handleListeningEnd
    rec.onerror = () => handleListeningEnd()

    try {
      rec.start()
      recognitionRef.current = rec
      setIsListening(true)
    } catch {
      setIsListening(false)
    }
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }, [])

  return {
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    isListening,
    isSpeaking,
    isSupported,
  }
}
