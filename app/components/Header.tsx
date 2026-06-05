'use client'

import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Cpu, Wifi, WifiOff, LogOut, ShieldCheck, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header({ session, isOnline }: { session: Session | null; isOnline: boolean }) {
  const [time, setTime] = useState('')
  const [systemLoad, setSystemLoad] = useState('0.00ms')

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour12: false }))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const ping = (Math.random() * 12 + 4).toFixed(2)
      setSystemLoad(`${ping}ms`)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="relative w-full border-b border-slate-900 bg-slate-950/40 backdrop-blur-md px-6 py-3.5 flex items-center justify-between z-50 transition-all duration-300">
      
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="flex items-center gap-4 group">
        <div className="relative w-10 h-10 rounded-xl border border-cyan-500/30 bg-cyan-950/10 flex items-center justify-center transition-all duration-500 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <div className="absolute inset-1 rounded-lg border border-dashed border-cyan-500/20 animate-[spin_20s_linear_infinite]" />
          <span className="text-cyan-400 font-mono font-black text-base tracking-tighter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
            J
          </span>
        </div>
        
        <div className="flex flex-col select-none">
          <h1 className="text-slate-100 font-mono font-black text-sm tracking-[5px] leading-none uppercase transition-colors group-hover:text-cyan-400">
            J.A.R.V.I.S.
          </h1>
          <span className="text-[8px] font-mono tracking-[1.5px] text-slate-500 mt-1 uppercase hidden sm:block">
            STARK INFRASTRUCTURE OS
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 border border-slate-900/80 bg-slate-950/60 px-4 py-1.5 rounded-xl text-[10px] font-mono tracking-wider text-slate-400">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi size={12} className="text-cyan-400 animate-pulse" />
              <span>LINK: <span className="text-cyan-400 font-bold">ESTÁVEL</span></span>
            </>
          ) : (
            <>
              <WifiOff size={12} className="text-red-500" />
              <span>LINK: <span className="text-red-500 font-bold">DESCONECTADO</span></span>
            </>
          )}
        </div>

        <div className="w-px h-3 bg-slate-800" />

        <div className="flex items-center gap-2">
          <Cpu size={12} className="text-slate-500" />
          <span>NÚCLEO: <span className="text-slate-300">SONNET 4</span></span>
        </div>

        <div className="w-px h-3 bg-slate-800" />

        <div className="flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-emerald-500" />
          <span>LATÊNCIA: <span className="text-emerald-400 tabular-nums">{systemLoad}</span></span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Relógio HUD */}
        <div className="text-right font-mono select-none hidden sm:flex flex-col justify-center border-r border-slate-900 pr-4 h-8">
          <div className="text-xs text-cyan-400/90 font-medium tracking-widest tabular-nums flex items-center gap-1.5 justify-end">
            <Clock size={11} className="text-cyan-500/50" />
            {time || "00:00:00"}
          </div>
          <div className="text-[8px] text-slate-600 tracking-wider uppercase mt-0.5">MALIBU MAIN-FRAME</div>
        </div>

        {session?.user && (
          <div className="flex items-center gap-3 bg-slate-900/30 border border-slate-900 pl-2 pr-1.5 py-1 rounded-xl transition-all hover:bg-slate-900/50">
            {session.user.image && (
              <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                <Image 
                  src={session.user.image} 
                  alt="Diretor" 
                  width={28} 
                  height={28} 
                  className="object-cover"
                  priority
                />
              </div>
            )}
            
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-slate-400 hover:text-red-400 border border-transparent hover:border-red-500/20 hover:bg-red-950/10 h-7 px-2.5 rounded-lg transition-all duration-300"
              title="Terminar Sessão Autorizada"
            >
              <LogOut size={11} />
              <span className="hidden xs:inline">LOGOUT</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}