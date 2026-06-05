type RateLimitEntry = {
  count: number;
  firstRequestAt: number;
};

const LIMIT = 30;
const WINDOW_MS = 60_000; // 1 minuto
const rateLimitMap = new Map<string, RateLimitEntry>();

function getIdentifier(req: { ip: string; connection?: { remoteAddress?: string } }) {
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

function cleanupExpired(entry: RateLimitEntry): boolean {
  return Date.now() - entry.firstRequestAt >= WINDOW_MS;
}

function rateLimiter(req: { ip: string; connection?: { remoteAddress?: string } }, res: any, next: () => void) {
  const identifier = getIdentifier(req);
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || cleanupExpired(entry)) {
    rateLimitMap.set(identifier, { count: 1, firstRequestAt: now });
    return next();
  }

  if (entry.count < LIMIT) {
    entry.count += 1;
    return next();
  }

  const retryAfter = Math.ceil((entry.firstRequestAt + WINDOW_MS - now) / 1000);
  res.status(429).json({ message: 'Too many requests', retryAfter });
}

export default rateLimiter;
