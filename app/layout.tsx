import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'J.A.R.V.I.S. v3.0.1',
  description: 'Just A Rather Very Intelligent System — Stark Industries',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Share+Tech+Mono&family=Exo+2:wght@300;400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#000A0F] text-slate-200 antialiased overflow-hidden h-screen">
        {children}
      </body>
    </html>
  )
}
