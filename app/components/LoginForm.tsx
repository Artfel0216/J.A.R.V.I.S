'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ShieldAlert, Loader2, KeyRound, UserCheck, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (!result?.ok) {
        setError('Acesso negado: Credenciais inválidas ou não autorizadas.')
        setIsLoading(false)
        return
      }

      // 🚀 OTIMIZAÇÃO: Prefetch da rota home antes do push para transição instantânea
      router.prefetch('/')
      router.push('/')
      router.refresh()
    } catch (err) {
      setError('Falha crítica de comunicação com a Stark Cloud.')
      setIsLoading(false)
    }
  }

  return (
    <div className={cn(
      "relative w-full max-w-md mx-auto rounded-2xl border bg-slate-950/60 backdrop-blur-xl p-8 shadow-2xl transition-all duration-500",
      isLoading ? "border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.15)]" : "border-slate-900 hover:border-slate-800",
      error && "border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.1)]"
    )}>
      
      {/* Laser Decorativo Superior de Varredura */}
      <div className={cn(
        "absolute top-0 left-6 right-6 h-px transition-all duration-500",
        isLoading ? "bg-cyan-400 animate-pulse" : "bg-slate-800",
        error && "bg-red-500"
      )} />

      {/* CABEÇALHO DO TERMINAL DE SEGURANÇA */}
      <div className="text-center mb-8 select-none">
        <div className="w-12 h-12 rounded-xl border border-cyan-500/20 bg-cyan-950/10 flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)] animate-pulse">
          <KeyRound size={20} />
        </div>
        <h1 
          className="text-3xl font-mono font-black tracking-[10px] text-slate-100 uppercase translate-x-1.25"
          style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}
        >
          J.A.R.V.I.S.
        </h1>
        <p className="text-[9px] font-mono tracking-[2px] text-slate-500 mt-2 uppercase">
          PROTOCOL SECURITY SYSTEM GATEWAY
        </p>
      </div>

      {/* FORMULÁRIO DE DIRETRIZES */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase mb-2">
            Identificação do Operador (E-mail)
          </label>
          <div className="relative flex items-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operador@stark.com"
              className="w-full h-11 bg-slate-950/40 border border-slate-900 rounded-xl px-4 text-sm text-slate-200 placeholder:text-slate-600 font-mono tracking-wide focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300 disabled:opacity-40"
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase mb-2">
            Código de Acesso Criptográfico (Senha)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-11 bg-slate-950/40 border border-slate-900 rounded-xl px-4 text-sm text-slate-200 placeholder:text-slate-600 font-mono tracking-wide focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300 disabled:opacity-40"
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        {/* MENSAGEM DE ERRO HOLOGRÁFICA */}
        {error && (
          <div className="p-3.5 bg-red-950/20 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono flex items-start gap-2.5 animate-[fadeIn_0.3s_ease-out]">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* BOTÃO DE ACIONAMENTO CORE */}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full h-11 font-mono text-xs font-bold tracking-widest transition-all duration-300 flex items-center justify-center gap-2 rounded-xl border bg-slate-900/40 select-none active:scale-[0.98]",
            isLoading 
              ? "border-cyan-500/50 text-cyan-400" 
              : "border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin text-cyan-400" />
              DESCRIPTOGRAFANDO...
            </>
          ) : (
            <>
              <UserCheck size={14} />
              AUTENTICAR DIRETRIZ
            </>
          )}
        </button>

        {/* NOTA DE RODAPÉ DO REPOSITÓRIO SECRETO */}
        <div className="pt-4 border-t border-slate-900/80 flex items-start gap-2 text-[9px] font-mono text-slate-500 leading-relaxed">
          <Terminal size={14} className="text-slate-700 shrink-0 mt-0.5" />
          <p>
            <span className="text-cyan-600 font-bold">ALPHA NODE:</span> Primeira inicialização? Use qualquer e-mail e credencial para instanciar novas partições no banco de dados.
          </p>
        </div>
      </form>
    </div>
  )
}