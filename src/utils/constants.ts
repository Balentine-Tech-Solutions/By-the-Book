/**
 * Common booking status values
 */
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const

/**
 * Payment status values
 */
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const

/**
 * Payment type values
 */
export const PAYMENT_TYPE = {
  DEPOSIT: 'DEPOSIT',
  FINAL: 'FINAL',
  FULL: 'FULL',
} as const

/**
 * User roles
 */
export const USER_ROLE = {
  STUDIO_OWNER: 'STUDIO_OWNER',
  STAFF: 'STAFF',
  CLIENT: 'CLIENT',
} as const

/**
 * Service categories
 */
export const SERVICE_CATEGORY = {
  RECORDING: 'RECORDING',
  MIXING: 'MIXING',
  MASTERING: 'MASTERING',
  PRODUCTION: 'PRODUCTION',
  OTHER: 'OTHER',
} as const

/**
 * Days of week (0 = Sunday, 6 = Saturday)
 */
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

/**
 * Default booking durations (in minutes)
 */
export const BOOKING_DURATIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 hours' },
  { value: 360, label: '6 hours' },
  { value: 480, label: '8 hours (Full Day)' },
] as const

/**
 * Stripe test cards
 */
export const STRIPE_TEST_CARDS = {
  SUCCESS: '4242 4242 4242 4242',
  REQUIRE_3DS: '4000 0025 0000 3155',
  DECLINED: '4000 0000 0000 9995',
  INSUFFICIENT_FUNDS: '4000 0000 0000 9995',
} as const

/**
 * Email templates (placeholders for future implementation)
 */
export const EMAIL_TEMPLATES = {
  BOOKING_CONFIRMATION: 'booking-confirmation',
  BOOKING_REMINDER: 'booking-reminder',
  BOOKING_CANCELLED: 'booking-cancelled',
  PAYMENT_RECEIVED: 'payment-received',
  REVIEW_REQUEST: 'review-request',
} as const

/**
 * Default studio settings
 */
export const DEFAULT_STUDIO_SETTINGS = {
  hourlyRate: 100,
  bookingBuffer: 15, // minutes
  minBookingTime: 60, // minutes
  maxBookingTime: 480, // minutes (8 hours)
  requireDeposit: true,
  depositAmount: 50, // percentage
  depositType: 'PERCENTAGE',
  cancellationHours: 24,
  cancellationFee: 50, // percentage
  timezone: 'America/New_York',
} as const

/**
 * API rate limits (for future implementation)
 */
export const RATE_LIMITS = {
  BOOKING_CREATE: 10, // per hour
  PAYMENT_CREATE: 5, // per hour
  REVIEW_SUBMIT: 3, // per day
} as const
