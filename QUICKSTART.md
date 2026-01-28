# ⚡ Quick Start Guide - 5 Minutes to Running

This guide gets you from zero to a running application in about 5 minutes.

## Prerequisites

- Node.js 18+ installed
- A code editor (VS Code recommended)
- Terminal/Command prompt

## Step 1: Install Dependencies (2 minutes)

Open terminal in the project folder and run:

```bash
npm install
```

You should see packages installing. This might take 1-2 minutes.

## Step 2: Set Up Database (1 minute)

### Option A: Use SQLite (Easiest for testing)

Update `.env`:
```bash
DATABASE_URL="file:./dev.db"
```

Then update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### Option B: Use PostgreSQL (Recommended)

Keep the default `.env` and install PostgreSQL locally, or use a free cloud database:

**Supabase (Recommended):**
1. Go to https://supabase.com
2. Create free account
3. Create new project
4. Copy "Connection String" from Settings → Database
5. Paste it in `.env` as `DATABASE_URL`

## Step 3: Initialize Database (30 seconds)

```bash
npm run db:push
```

You should see: `✓ Database synchronized`

## Step 4: Add Stripe Keys (Optional - 1 minute)

For payment testing (optional, app works without it):

1. Go to https://dashboard.stripe.com/register
2. Create account
3. Skip onboarding
4. Go to Developers → API Keys
5. Copy "Publishable key" and "Secret key"
6. Update `.env`:

```bash
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## Step 5: Start the App (10 seconds)

```bash
npm run dev
```

Open your browser to: **http://localhost:3000**

## 🎉 You're Running!

You should see the landing page with "By the Book" header.

## Quick Test

### Create a Test Studio

1. Open Prisma Studio:
```bash
npm run db:studio
```

2. Go to http://localhost:5555

3. Click on **User** model, click **Add record**:
   - email: `test@studio.com`
   - name: `Test Owner`
   - password: `test123`
   - role: `STUDIO_OWNER`
   - Click Save

4. Click on **Studio** model, click **Add record**:
   - name: `Demo Recording Studio`
   - description: `Professional recording studio`
   - email: `contact@demostudio.com`
   - hourlyRate: `100`
   - ownerId: (select the user you created)
   - Click Save

5. Click on **StudioAvailability**, create 5 records (Mon-Fri):
   - dayOfWeek: `1` (Monday)
   - startTime: `09:00`
   - endTime: `17:00`
   - isAvailable: `true`
   - studioId: (select your studio)
   - Click Save
   - Repeat for days 2, 3, 4, 5

### Test Booking

1. Go to http://localhost:3000/book
2. Click on your studio
3. Select tomorrow's date
4. Choose a time slot
5. Enter your info
6. Confirm booking

**Without Stripe:** Booking will be created but payment will fail
**With Stripe:** Use test card `4242 4242 4242 4242`

## View Dashboard

Go to: http://localhost:3000/studio/dashboard

You should see your studio's dashboard with the booking you created!

## Common Issues & Fixes

### Port 3000 in use
```bash
npx kill-port 3000
# or
npm run dev -- -p 3001
```

### Database error
Make sure you ran `npm run db:push`

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Stripe errors
Skip Stripe for now - the app works without it (bookings just won't process payments)

## Next Steps

Now that it's running:

1. **Read SETUP.md** for detailed configuration
2. **Check SUMMARY.md** for complete feature overview
3. **Browse the code** in `/src/pages/` and `/src/server/api/routers/`
4. **Customize** colors in `tailwind.config.ts`
5. **Deploy** to Vercel (see README.md)

## Production Deployment (5 minutes)

1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repo
5. Add environment variables from `.env`
6. Click Deploy

Done! You'll get a live URL.

## File Structure Quick Reference

```
src/
├── pages/
│   ├── index.tsx           → Landing page
│   ├── book.tsx            → Booking wizard
│   └── studio/dashboard.tsx → Studio dashboard
├── server/api/routers/
│   ├── studio.ts           → Studio API
│   ├── booking.ts          → Booking logic
│   ├── client.ts           → Client management
│   └── payment.ts          → Payments
└── utils/
    ├── api.ts              → API client
    ├── helpers.ts          → Utilities
    └── constants.ts        → Constants
```

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
npm run db:push      # Update database schema
npm run db:studio    # Open database GUI
```

## Resources

- 📖 Full docs: See README.md
- 🛠️ Setup help: See SETUP.md
- 🗺️ Features: See PROJECT_OVERVIEW.md
- 🚀 Roadmap: See ROADMAP.md

---

**That's it! You're now running a professional studio booking platform.** 🎉

Any questions? Check the other documentation files or the code comments.
