import { TRPCError } from '@trpc/server'
import logger from './logger'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(401, message)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message)
  }
}

export function handleTRPCError(error: unknown): TRPCError {
  if (error instanceof AppError) {
    logger.error('Application error:', { error: error.message, statusCode: error.statusCode })
    
    return new TRPCError({
      code: getErrorCode(error.statusCode),
      message: error.message,
    })
  }

  if (error instanceof Error) {
    logger.error('Unexpected error:', { error: error.message, stack: error.stack })
    
    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    })
  }

  logger.error('Unknown error:', error)
  
  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unknown error occurred',
  })
}

function getErrorCode(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST'
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'CONFLICT'
    default:
      return 'INTERNAL_SERVER_ERROR'
  }
}

export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    ...context,
  })
}

export function logWarning(message: string, context?: Record<string, unknown>) {
  logger.warn(message, context)
}

export function logInfo(message: string, context?: Record<string, unknown>) {
  logger.info(message, context)
}
