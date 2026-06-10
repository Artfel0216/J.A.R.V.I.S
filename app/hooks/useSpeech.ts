'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

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

// Estendendo o objeto Window global para o compilador aceitar as propriedades com prefixo
declare global {
  interface Window {
    SpeechRecognition?: {
      prototype: SpeechRecognition;
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      prototype: SpeechRecognition;
      new (): SpeechRecognition;
    };
  }
}

export function useSpeech() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

  const sanitizeTextForTTS = useCallback((text: string): string => {
    return text
      .replace(/#{1,6}\s?/g, '')       
      .replace(/\*\*(.*?)\*\*/g, '$1') 
      .replace(/\*(.*?)\*/g, '$1')     
      .replace(/`([^`]+)`/g, '$1')     
      .replace(/```[\s\S]*?```/g, '')  
      .replace(/[-*+]\s/g, '')         
      .replace(/\n+/g, ' ')            
      .trim()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SR)
    
    const synth = window.speechSynthesis
    synthRef.current = synth

    const loadVoices = () => {
      if (!synth) return
      const voices = synth.getVoices()
      
      voiceRef.current =
        voices.find((v) => v.lang === 'pt-BR' && v.name.includes('Google')) || 
        voices.find((v) => v.lang === 'pt-BR') ||
        voices.find((v) => v.lang.startsWith('pt')) ||
        voices.find((v) => v.lang === 'en-GB') ||
        voices[0] || 
        null
    }

    if (synth) {
      loadVoices()
      if (synth.addEventListener) {
        synth.addEventListener('voiceschanged', loadVoices)
      } else {
        synth.onvoiceschanged = loadVoices
      }
    }

    return () => {
      if (synth && synth.removeEventListener) {
        synth.removeEventListener('voiceschanged', loadVoices)
      }
    }
  }, [])

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current) return
    
    synthRef.current.cancel()

    const cleanText = sanitizeTextForTTS(text)
    if (!cleanText) {
      onEnd?.()
      return
    }

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.voice = voiceRef.current
    
    utterance.rate = 0.98  
    utterance.pitch = 0.82 
    utterance.volume = 1.0 
    utterance.lang = voiceRef.current?.lang || 'pt-BR'

    utterance.onstart = () => setIsSpeaking(true)
    
    const handleSpeechEnd = () => {
      setIsSpeaking(false)
      onEnd?.()
    }

    utterance.onend = handleSpeechEnd
    utterance.onerror = () => handleSpeechEnd()

    synthRef.current.speak(utterance)
  }, [sanitizeTextForTTS])

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    setIsSpeaking(false)
  }, [])

  const startListening = useCallback((
    onResult: (text: string, isFinal: boolean) => void,
    onEnd?: () => void
  ) => {
    if (typeof window === 'undefined') return
    
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        // Ignora se o motor já estava parado
      }
    }

    const rec = new SR()
    rec.lang = 'pt-BR'
    rec.continuous = false
    rec.interimResults = true

    // 🛡️ CORREÇÃO: Tipando explicitamente o parâmetro 'event' para evitar erro de implicit any
    rec.onresult = (event: SpeechRecognitionEvent) => {
      // 🛡️ CORREÇÃO: Array.from agora sabe exatamente o formato do objeto mapeado, sumindo o erro de 'unknown'
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
    } catch (error) {
      console.error('[STARK VAD] Falha ao inicializar periférico de captura:', error)
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
    isSupported 
  }
}