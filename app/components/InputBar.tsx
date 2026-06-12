'use client'

import { useState, useRef } from 'react'
import { Mic, MicOff, Send, Volume2, VolumeX, Square, Loader2, ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStarkHUD } from '@/hooks/use-stark-hud'

const MAX_IMAGE_BYTES = 4 * 1024 * 1024 

interface Props {
  conversationId?: string | null
  onSubmit?: (message: string) => Promise<void> | void
  onStreamStart?: () => void
  onError?: (error: string) => void
  onAbort?: () => void
  
  onVoiceToggle: () => void
  onTtsToggle: () => void
  isListening: boolean
  isSpeaking: boolean
  ttsEnabled: boolean
  voiceSupported: boolean
}

export function InputBar({
  onSubmit,
  onStreamStart,
  onError,
  onAbort,
  onVoiceToggle,
  onTtsToggle,
  isListening,
  isSpeaking,
  ttsEnabled,
  voiceSupported
}: Props) {

  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    value,
    setValue,
    image,
    setImage,
    textareaRef,
    handleSend,
    handleKey,
    triggerHaptic
  } = useStarkHUD({ isLoading, setIsLoading, onSubmit, onStreamStart, onError })

  const handleAbortAction = () => {
    onAbort?.()
    setIsLoading(false)
    triggerHaptic(50)
    onError?.('Diretriz interrompida pelo Operador.')
  }

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' 
    if (!file) return
    if (!file.type.startsWith('image/')) {
      onError?.('Apenas imagens são suportadas.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      onError?.('Imagem muito grande (máx. 4 MB).')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      triggerHaptic(15)
      setImage(reader.result as string)
    }
    reader.onerror = () => onError?.('Falha ao ler a imagem.')
    reader.readAsDataURL(file)
  }

  const canSend = !!value.trim() || !!image

  return (
    <footer className="w-full max-w-5xl mx-auto px-4 py-6 transition-all duration-500">
      <div className={cn(
        "relative rounded-2xl border bg-slate-950/80 backdrop-blur-xl p-3 transition-all duration-500 shadow-2xl",
        "border-red-950/60 shadow-[0_0_20px_rgba(185,28,28,0.05)] hover:border-red-900/50",
        isLoading && "border-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,0.25)] bg-red-950/10",
        isListening && "border-red-500/60 shadow-[0_0_35px_rgba(239,68,68,0.35)] bg-red-950/20"
      )}>
        
        {}
        {isLoading && (
          <div className="absolute top-0 left-4 right-4 h-px bg-linear-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
        )}

        {}
        {image && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-950/10 p-2 w-fit">
            {}
            <img src={image} alt="Anexo" className="h-14 w-14 rounded-lg object-cover border border-red-900/50" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500/80">Imagem anexada</span>
            <button
              onClick={() => { triggerHaptic(15); setImage(null) }}
              aria-label="Remover imagem"
              className="ml-1 p-1 text-red-400/70 hover:text-red-400 hover:bg-red-900/30 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFilePick}
          className="hidden"
        />

        <div className="flex items-end gap-3">
          {}
          <button
            onClick={() => { triggerHaptic(15); onVoiceToggle(); }}
            disabled={!voiceSupported}
            aria-label={isListening ? "Desativar captação de voz" : "Ativar captação biométrica de voz"}
            className={cn(
              'relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 border bg-red-950/20 mb-0.5',
              isListening
                ? 'border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)] bg-red-900/30'
                : 'border-red-900/40 text-red-700 hover:border-amber-500/60 hover:text-amber-500 hover:scale-105 active:scale-95',
              !voiceSupported && 'opacity-20 cursor-not-allowed'
            )}
            title="Sinal de Captação Biométrica de Voz"
          >
            {isListening && (
              <span className="absolute inset-0 rounded-xl bg-red-500/10 animate-ping opacity-75" />
            )}
            {isListening ? <MicOff size={18} className="animate-pulse" /> : <Mic size={18} />}
          </button>

          {}
          <button
            onClick={() => { triggerHaptic(15); fileInputRef.current?.click() }}
            disabled={isLoading}
            aria-label="Anexar imagem para análise"
            title="Anexar imagem (análise visual)"
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 border bg-red-950/20 mb-0.5',
              'border-red-900/40 text-red-700 hover:border-amber-500/60 hover:text-amber-500 hover:scale-105 active:scale-95',
              image && 'border-amber-500/60 text-amber-500',
              isLoading && 'opacity-20 cursor-not-allowed'
            )}
          >
            <ImagePlus size={18} />
          </button>

          <div className="relative flex-1 flex items-center">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={handleKey}
              disabled={isLoading}
              rows={1}
              placeholder={isListening ? "Sistemas escutando... Fale, Senhor." : "Aguardando diretrizes da armadura..."}
              className={cn(
                "w-full min-h-12 max-h-40 py-3.5 bg-slate-950/60 border rounded-xl px-4 text-sm text-slate-100 placeholder:text-red-900/50 font-mono resize-none focus:outline-none transition-all duration-200 disabled:opacity-40",
                "border-red-950/80 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 focus:text-amber-100"
              )}
              autoComplete="off"
              spellCheck={false}
            />
            {isLoading && (
              <Loader2 size={16} className="absolute right-4 bottom-4 text-amber-500 animate-spin" />
            )}
          </div>

          {}
          <button
            onClick={() => { triggerHaptic(15); onTtsToggle(); }}
            aria-label={ttsEnabled ? "Mutar resposta sintetizada" : "Ativar resposta sintetizada de IA"}
            title={ttsEnabled ? 'Mutar Protocolo de Voz' : 'Ativar Protocolo de Voz'}
            className={cn(
              "w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300 bg-red-950/10 active:scale-95 mb-0.5",
              ttsEnabled 
                ? "border-amber-500/40 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-500/5" 
                : "border-red-950 text-red-900 hover:text-red-400 hover:border-red-900"
            )}
          >
            {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {}
          {isLoading ? (
            <button
              onClick={handleAbortAction}
              aria-label="Abortar processamento de dados"
              className="h-12 px-5 bg-red-600/10 border border-red-600/40 text-red-500 hover:bg-red-600/20 rounded-xl font-mono text-xs tracking-widest transition-all duration-300 flex items-center gap-2 shrink-0 active:scale-95 shadow-[0_0_15px_rgba(220,38,38,0.15)] mb-0.5"
            >
              <Square size={14} className="fill-red-500/20" /> ABORTAR
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Enviar comando de inicialização"
              className={cn(
                "h-12 px-5 font-mono text-xs tracking-widest transition-all duration-300 flex items-center gap-2 shrink-0 rounded-xl border bg-red-950/20 active:scale-95 mb-0.5",
                canSend
                  ? "border-amber-500 text-amber-500 hover:bg-amber-500/10 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  : "border-red-950 text-red-950 cursor-not-allowed opacity-40"
              )}
            >
              <Send size={12} /> INICIALIZAR
            </button>
          )}
        </div>

        {}
        <div className="flex justify-between items-center mt-3 px-1 text-[10px] font-mono tracking-wider text-red-900/60-select-none">
          <div className="flex items-center gap-2">
            <span className={cn("w-1.5 h-1.5 rounded-full", isLoading ? "bg-amber-400 animate-ping" : "bg-red-600")} />
            <span>STARK NET: ONLINE</span>
            <span className="text-red-950">|</span>
            <span>{voiceSupported ? 'SPEECH CORE: ACTIVE' : 'SPEECH CORE: DISABLE'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {isSpeaking && (
              <span className="text-amber-500 animate-pulse flex items-center gap-1.5 font-bold">
                <span className="inline-block w-0.5 h-2 bg-amber-500 animate-[bounce_1s_infinite_100ms]" />
                <span className="inline-block w-0.5 h-3 bg-amber-500 animate-[bounce_1s_infinite_300ms]" />
                <span className="inline-block w-0.5 h-1 bg-amber-500 animate-[bounce_1s_infinite_500ms]" />
                JARVIS VOICE COMMS
              </span>
            )}
            <span className="text-red-950 font-bold hidden sm:inline">MARK LXXXV // SYSTEM SECURE</span>
          </div>
        </div>
      </div>
    </footer>
  )
}