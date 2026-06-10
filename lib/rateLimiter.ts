type RateLimitEntry = {
  count: number;
  firstRequestAt: number;
};

const LIMIT = 30;
const WINDOW_MS = 60_000; // 1 minuto
const rateLimitMap = new Map<string, RateLimitEntry>();

if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap.entries()) {
      if (now - entry.firstRequestAt >= WINDOW_MS) {
        rateLimitMap.delete(ip);
      }
    }
  }, WINDOW_MS);
}

function getIdentifier(req: { ip: string; connection?: { remoteAddress?: string } }) {
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

function isExpired(entry: RateLimitEntry): boolean {
  return Date.now() - entry.firstRequestAt >= WINDOW_MS;
}

function rateLimiter(
  req: { ip: string; connection?: { remoteAddress?: string } }, 
  res: any, 
  next: () => void
) {
  const identifier = getIdentifier(req);
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || isExpired(entry)) {
    rateLimitMap.set(identifier, { count: 1, firstRequestAt: now });
    return next();
  }

  if (entry.count < LIMIT) {
    entry.count += 1;
    return next();
  }

  const retryAfter = Math.ceil((entry.firstRequestAt + WINDOW_MS - now) / 1000);
  
  return res.status(429).json({ message: 'Too many requests', retryAfter });
}

export default rateLimiter;