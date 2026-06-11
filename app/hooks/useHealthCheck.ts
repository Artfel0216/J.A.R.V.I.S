// hooks/useHealthCheck.ts
import { useState, useEffect } from 'react';

export function useHealthCheck(intervalMs = 15000) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
        setIsOnline(res.ok);
      } catch {
        setIsOnline(false);
      }
    };
    check();
    const timer = setInterval(check, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return isOnline;
}