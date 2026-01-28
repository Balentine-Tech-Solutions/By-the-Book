import { z } from 'zod'

/**
 * Studio validation schemas
 */
export const createStudioSchema = z.object({
  name: z.string().min(1, 'Studio name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address'),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive'),
  timezone: z.string().default('America/New_York'),
})

export const updateStudioSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  hourlyRate: z.number().min(0).optional(),
  bookingBuffer: z.number().min(0).optional(),
  minBookingTime: z.number().min(30).optional(),
  maxBookingTime: z.number().min(60).optional(),
})

/**
 * Booking validation schemas
 */
export const createBookingSchema = z.object({
  studioId: z.string(),
  clientId: z.string(),
  roomId: z.string().optional(),
  startTime: z.string().datetime(),
  duration: z.number().min(30, 'Minimum booking is 30 minutes'),
  serviceIds: z.array(z.string()).optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
})

/**
 * Client validation schemas
 */
export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?1?\d{10,14}$/, 'Invalid phone number').optional(),
})

/**
 * Review validation schema
 */
export const reviewSchema = z.object({
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(1000, 'Review too long').optional(),
})

/**
 * Service validation schema
 */
export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  duration: z.number().min(15, 'Minimum duration is 15 minutes'),
  price: z.number().min(0, 'Price must be positive'),
  category: z.enum(['RECORDING', 'MIXING', 'MASTERING', 'PRODUCTION', 'OTHER']),
})

/**
 * Room validation schema
 */
export const roomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  description: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  hourlyRate: z.number().min(0).optional(),
  equipment: z.array(z.string()).default([]),
})

/**
 * Availability validation schema
 */
export const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  isAvailable: z.boolean().default(true),
})

/**
 * Payment validation schema
 */
export const paymentSchema = z.object({
  amount: z.number().min(0.5, 'Minimum payment is $0.50'),
  paymentType: z.enum(['DEPOSIT', 'FINAL', 'FULL']),
})
