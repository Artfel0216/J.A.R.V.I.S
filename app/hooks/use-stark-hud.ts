'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'

interface UseStarkHUDProps {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  onSubmit?: (message: string, image?: string) => Promise<void> | void
  onStreamStart?: () => void
  onError?: (error: string) => void
}

export function useStarkHUD({
  isLoading,
  setIsLoading,
  onSubmit,
  onStreamStart,
  onError
}: UseStarkHUDProps) {
  const [value, setValue] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
  }, [value])

  const triggerHaptic = (ms = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms)
    }
  }

  const handleSend = async () => {
    if ((!value.trim() && !image) || isLoading) return

    const currentMessage = value.trim()
    const currentImage = image
    setIsLoading(true)
    onStreamStart?.()
    triggerHaptic(30)

    try {
      await onSubmit?.(currentMessage, currentImage ?? undefined)
      setValue('')
      setImage(null)
    } catch (err) {
      console.error('[Stark OS Error]:', err)
      const errorMessage = err instanceof Error ? err.message : 'Falha no processador central.'
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return {
    value,
    setValue,
    image,
    setImage,
    textareaRef,
    handleSend,
    handleKey,
    triggerHaptic
  }
}