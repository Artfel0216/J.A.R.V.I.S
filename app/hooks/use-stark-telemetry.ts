import { useState, useEffect } from 'react'

export function useClock() {
  const [time, setTime] = useState('00:00:00')

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('pt-BR', { hour12: false }))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  return time
}

export function useSimulatedPing(active: boolean) {
  const [ping, setPing] = useState('0.00ms')

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      const value = (Math.random() * 8 + 2).toFixed(2)
      setPing(`${value}ms`)
    }, 3000)
    return () => clearInterval(interval)
  }, [active])

  return ping
}