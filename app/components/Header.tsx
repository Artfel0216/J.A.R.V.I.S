'use client'

import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import { Cpu, Wifi, WifiOff, LogOut, ShieldCheck, Clock } from 'lucide-react'
import { useClock, useSimulatedPing } from '@/hooks/use-stark-telemetry'
import { starkAudio } from '@/hooks/use-stark-sound' 

interface HeaderProps {
  session: Session | null
  isOnline: boolean
}

export function Header({ session, isOnline }: HeaderProps) {
  const time = useClock()
  const systemLoad = useSimulatedPing(isOnline)

  return (
    <header className="relative w-full border-b border-red-950 bg-stone-950/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between z-50 transition-all duration-300 select-none">
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-red-600 to-transparent shadow-[0_0_8px_rgba(220,38,38,0.8)]" />

      <div 
        className="flex items-center gap-4 group cursor-pointer"
        onMouseEnter={() => starkAudio?.playHover()}
      >
        <ArcReactor />
        <div className="flex flex-col">
          <h1 className="text-stone-100 font-mono font-black text-sm tracking-[4px] leading-none uppercase transition-colors group-hover:text-amber-400">
            J.A.R.V.I.S.
          </h1>
          <span className="text-[8px] font-mono tracking-[1.5px] text-red-500/80 mt-1 uppercase hidden sm:block font-bold">
            MARK LXXXV // STARK INDUSTRIES
          </span>
        </div>
      </div>

      <HudStats isOnline={isOnline} systemLoad={systemLoad} />

      <div className="flex items-center gap-4">
        <div className="text-right font-mono hidden sm:flex flex-col justify-center border-r border-red-950 pr-4 h-8">
          <div className="text-xs text-amber-400/90 font-bold tracking-widest tabular-nums flex items-center gap-1.5 justify-end drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]">
            <Clock size={11} className="text-red-500" aria-hidden="true" />
            <time dateTime={time}>{time}</time>
          </div>
          <div className="text-[8px] text-stone-500 tracking-wider uppercase mt-0.5">BRAZIL LABS</div>
        </div>

        {session?.user && <UserMenu user={session.user} />}
      </div>
    </header>
  )
}

function ArcReactor() {
  return (
    <div className="relative w-10 h-10 rounded-full border border-amber-500/40 bg-red-950/20 flex items-center justify-center transition-all duration-500 group-hover:border-amber-400 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]">
      <div className="absolute inset-1 rounded-full border border-dashed border-red-500/40 animate-[spin_30s_linear_infinite] motion-reduce:animate-none" />
      <div className="absolute inset-2 rounded-full border border-amber-500/20 animate-[pulse_2s_ease-in-out_infinite]" />
      <span className="text-amber-400 font-mono font-black text-base tracking-tighter drop-shadow-[0_0_6px_rgba(245,158,11,0.7)]" aria-hidden="true">
        🚀
      </span>
    </div>
  )
}

function HudStats({ isOnline, systemLoad }: { isOnline: boolean; systemLoad: string }) {
  return (
    <div className="hidden md:flex items-center gap-6 border border-red-900/40 bg-stone-900/60 px-5 py-1.5 rounded-full text-[10px] font-mono tracking-wider text-stone-400">
      <div className="flex items-center gap-2" onMouseEnter={() => starkAudio?.playHover()}>
        {isOnline ? (
          <>
            <Wifi size={12} className="text-amber-400 animate-pulse" />
            <span>LINK: <span className="text-amber-400 font-bold drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]">ESTÁVEL</span></span>
          </>
        ) : (
          <>
            <WifiOff size={12} className="text-red-500 animate-bounce" />
            <span>LINK: <span className="text-red-500 font-bold">DOWNLINK</span></span>
          </>
        )}
      </div>

      <div className="w-px h-3 bg-red-950" />

      <div className="flex items-center gap-2" onMouseEnter={() => starkAudio?.playHover()}>
        <Cpu size={12} className="text-red-500" />
        <span>NÚCLEO: <span className="text-stone-300 font-bold">ARC_V4</span></span>
      </div>

      <div className="w-px h-3 bg-red-950" />

      <div className="flex items-center gap-1.5" onMouseEnter={() => starkAudio?.playHover()}>
        <ShieldCheck size={12} className="text-amber-500" />
        <span>STARKNET: <span className="text-amber-400 font-bold tabular-nums">{systemLoad}</span></span>
      </div>
    </div>
  )
}

function UserMenu({ user }: { user: NonNullable<Session['user']> }) {
  const handleLogout = () => {
    starkAudio?.playClick() 
    setTimeout(() => {
      signOut()
    }, 150)
  }

  return (
    <div className="flex items-center gap-3 bg-red-950/10 border border-red-900/30 pl-2 pr-1.5 py-1 rounded-xl transition-all hover:bg-red-950/20">
      {user.image && (
        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
          <Image 
            src={user.image} 
            alt={`Avatar de ${user.name ?? 'Operador'}`}
            width={28} 
            height={28} 
            className="object-cover"
            priority
          />
        </div>
      )}
      
      <button
        onClick={handleLogout}
        onMouseEnter={() => starkAudio?.playHover()} 
        className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-stone-400 hover:text-red-400 border border-transparent hover:border-red-500/30 hover:bg-red-950/30 h-7 px-2.5 rounded-lg transition-all duration-300"
        aria-label="Encerrar protocolo de acesso e sair do sistema"
      >
        <LogOut size={11} aria-hidden="true" />
        <span className="hidden xs:inline">LOGOUT</span>
      </button>
    </div>
  )
}