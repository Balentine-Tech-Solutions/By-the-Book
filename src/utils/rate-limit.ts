import { NextApiRequest, NextApiResponse } from 'next'
import { RateLimiterMemory } from 'rate-limiter-flexible'

const rateLimiters = new Map<string, RateLimiterMemory>()

function getRateLimiter(key: string, points: number, duration: number) {
  if (!rateLimiters.has(key)) {
    rateLimiters.set(
      key,
      new RateLimiterMemory({
        points,
        duration,
      })
    )
  }
  return rateLimiters.get(key)!
}

export async function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  options: { points?: number; duration?: number } = {}
): Promise<boolean> {
  const { points = 10, duration = 60 } = options

  const identifier = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
  const key = `${identifier}-${req.url}`

  const rateLimiter = getRateLimiter(key, points, duration)

  try {
    await rateLimiter.consume(identifier as string)
    return true
  } catch (error) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
    })
    return false
  }
}

// Specific rate limiters for different endpoints
export const apiRateLimit = (req: NextApiRequest, res: NextApiResponse) =>
  rateLimit(req, res, { points: 100, duration: 60 })

export const authRateLimit = (req: NextApiRequest, res: NextApiResponse) =>
  rateLimit(req, res, { points: 5, duration: 300 })

export const paymentRateLimit = (req: NextApiRequest, res: NextApiResponse) =>
  rateLimit(req, res, { points: 10, duration: 300 })
