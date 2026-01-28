# By the Book - Studio Booking Platform

A comprehensive recording and production studio booking application designed to streamline studio operations, eliminate scheduling conflicts, and enhance client experience.

## 🎯 Features

### For Studio Owners
- **Smart Scheduling System**: AI-powered conflict detection and automatic buffer time management
- **Real-time Availability Management**: Set operating hours and manage multiple rooms/spaces
- **Payment Processing**: Integrated Stripe payments with deposit and final payment support
- **Client Management**: Track client history, notes, and booking patterns
- **Revenue Analytics**: Comprehensive dashboard with revenue tracking and booking statistics
- **Cancellation Policies**: Automated cancellation fee calculation based on notice period
- **Review System**: Collect and display client feedback

### For Clients
- **Easy Booking Flow**: Simple 4-step booking process
- **Real-time Availability**: See available time slots instantly
- **Flexible Duration Options**: Book sessions from 1 hour to full-day
- **Secure Payments**: PCI-compliant payment processing via Stripe
- **Session Reminders**: Automated email notifications (configurable)
- **Review & Feedback**: Leave reviews after completed sessions

### Smart Scheduling Features
- **Conflict Prevention**: Automatic detection of double-bookings
- **Buffer Time Management**: Configurable buffer time between sessions
- **Multi-room Support**: Manage multiple spaces independently
- **Operating Hours**: Set availability by day of week
- **Timezone Support**: Proper handling of different timezones

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (React) with TypeScript
- **Backend**: Next.js API Routes + tRPC for type-safe APIs
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Stripe
- **Authentication**: NextAuth.js (ready to configure)
- **Styling**: Tailwind CSS
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stripe account (for payments)
- npm or yarn

## 🚀 Getting Started

### 1. Clone and Install

```bash
cd By-the-Book
npm install
```

### 2. Database Setup

Create a PostgreSQL database and update your `.env` file:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/bythebook"
```

### 3. Initialize Database

```bash
npm run db:push
```

This will create all necessary tables in your database.

### 4. Configure Stripe

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Update `.env` with your Stripe keys:

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Database Schema

### Core Models

- **Studio**: Studio information, settings, and policies
- **Room**: Individual recording spaces within a studio
- **Service**: Services offered (recording, mixing, mastering, etc.)
- **Booking**: Session bookings with status tracking
- **Client**: Client information and history
- **Payment**: Payment records with Stripe integration
- **Review**: Client feedback and ratings
- **StudioAvailability**: Operating hours by day of week

### Key Relationships

- Studios have multiple Rooms, Services, and Bookings
- Bookings connect Clients with Studios through specific time slots
- Payments are linked to Bookings
- Reviews are created after completed Bookings

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth (for authentication)
NEXTAUTH_SECRET="generate-a-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # For production webhooks

# Email (Optional - for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

## 📱 Application Structure

```
src/
├── pages/
│   ├── index.tsx              # Landing page
│   ├── book.tsx               # Client booking flow
│   ├── booking/
│   │   └── [id]/
│   │       ├── payment.tsx    # Payment page
│   │       ├── confirmation.tsx
│   │       └── review.tsx     # Review submission
│   ├── studio/
│   │   └── dashboard.tsx      # Studio management dashboard
│   └── api/
│       └── trpc/[trpc].ts     # tRPC API handler
├── server/
│   ├── db.ts                  # Prisma client
│   └── api/
│       ├── trpc.ts            # tRPC setup
│       ├── root.ts            # API router aggregation
│       └── routers/           # API route handlers
│           ├── studio.ts      # Studio management
│           ├── booking.ts     # Booking & scheduling
│           ├── client.ts      # Client management
│           └── payment.ts     # Payment processing
├── utils/
│   └── api.ts                 # tRPC client setup
└── styles/
    └── globals.css            # Global styles
```

## 🎨 Key Pages

### Client-Facing
- `/` - Landing page with features
- `/book` - Multi-step booking flow
- `/booking/[id]/payment` - Stripe payment page
- `/booking/[id]/confirmation` - Booking confirmation
- `/booking/[id]/review` - Leave a review

### Studio Management
- `/studio/dashboard` - Main dashboard with stats and bookings

## 🔧 API Routes (tRPC)

### Studio Router
- `getAll` - Get all studios
- `getById` - Get studio details
- `create` - Create new studio
- `update` - Update studio settings
- `setAvailability` - Set operating hours
- `getStats` - Get studio statistics

### Booking Router
- `getAvailableSlots` - Get available time slots (smart scheduling)
- `create` - Create new booking
- `getByStudio` - Get studio bookings
- `updateStatus` - Update booking status
- `cancel` - Cancel booking with fee calculation

### Client Router
- `getOrCreate` - Get or create client
- `getBookings` - Get client booking history
- `submitReview` - Submit review

### Payment Router
- `createPaymentIntent` - Create Stripe payment intent
- `confirmPayment` - Confirm successful payment
- `getByBooking` - Get payment history
- `refund` - Process refund

## 💡 Smart Scheduling Algorithm

The booking system includes intelligent conflict detection:

1. **Time Slot Generation**: Creates 30-minute interval slots within operating hours
2. **Conflict Detection**: Checks for overlapping bookings
3. **Buffer Time**: Adds configurable buffer between sessions
4. **Real-time Validation**: Prevents double-bookings at creation time
5. **Multi-room Support**: Manages separate availability per room

## 💳 Payment Flow

1. Client completes booking form
2. System calculates total and deposit amounts
3. Stripe Payment Intent created
4. Client enters payment details
5. Payment confirmed via Stripe
6. Booking status updated to CONFIRMED
7. Confirmation email sent (when configured)

## 📊 Studio Dashboard Features

- Total bookings and revenue statistics
- Upcoming sessions list
- Average rating display
- Recent reviews
- Quick action buttons
- Multi-studio support

## 🔜 Future Enhancements

- Email notifications and reminders
- SMS notifications via Twilio
- Calendar integrations (Google Calendar, iCal)
- File upload for session materials
- Client portal for booking management
- Advanced reporting and analytics
- Multi-language support
- Mobile app (React Native)
- Staff/team management
- Equipment tracking and availability
- Automated backup reminders
- Integration with accounting software

## 🛡️ Security Features

- Type-safe API with tRPC
- Input validation with Zod schemas
- Secure payment processing via Stripe
- Environment variable protection
- CSRF protection (Next.js built-in)
- SQL injection prevention (Prisma)

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Railway
- Render
- AWS
- Digital Ocean
- Heroku

**Database**: Ensure PostgreSQL is available. Recommended providers:
- Supabase
- Railway
- Neon
- AWS RDS

## 🤝 Contributing

This is a proprietary project. For questions or support, contact the development team.

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For setup help or feature requests, please contact support.

---

Built with ❤️ for recording studios who need better booking management.
