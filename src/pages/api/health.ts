import type { NextApiRequest, NextApiResponse } from 'next'

export async function healthCheck(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  }

  try {
    res.status(200).json(healthcheck)
  } catch (error) {
    healthcheck.message = (error as Error).message
    res.status(503).json(healthcheck)
  }
}
