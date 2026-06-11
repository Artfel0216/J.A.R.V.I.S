import type { Metadata } from 'next'
import { Orbitron, Share_Tech_Mono, Exo_2 } from 'next/font/google'
import { HUDOverlay } from '@/components/HUDOverlay'
import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '500', '700', '900'],
  display: 'swap',
})

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  variable: '--font-mono-stark',
  weight: ['400'],
  display: 'swap',
})

const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-exo',
  weight: ['300', '400', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'J.A.R.V.I.S. v3.0.1',
  description: 'Just A Rather Very Intelligent System — Stark Industries',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html 
      lang="pt-BR" 
      className={`${orbitron.variable} ${shareTechMono.variable} ${exo2.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[#050101] text-slate-200 antialiased overflow-hidden h-screen w-screen relative font-sans">
        
        <HUDOverlay />
        
        <main className="w-full h-full relative z-10 flex overflow-hidden select-none">
          {children}
        </main>

      </body>
    </html>
  )
}