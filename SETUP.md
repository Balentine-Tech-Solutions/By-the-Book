# Quick Setup Guide

## Step-by-Step Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js and React
- Prisma (database ORM)
- tRPC (type-safe APIs)
- Stripe (payments)
- Tailwind CSS (styling)

### 2. Set Up Database

**Option A: Local PostgreSQL**

1. Install PostgreSQL on your machine
2. Create a new database:
   ```sql
   CREATE DATABASE bythebook;
   ```
3. Update `.env` with your connection string

**Option B: Cloud Database (Recommended for Production)**

Use a managed PostgreSQL service:
- **Supabase** (Free tier available): https://supabase.com
- **Railway** (Free tier): https://railway.app
- **Neon** (Free tier): https://neon.tech

After creating your database, copy the connection string to `.env`

### 3. Configure Environment Variables

Update the `.env` file with your actual values:

```bash
# Required for development
DATABASE_URL="postgresql://username:password@localhost:5432/bythebook"

# Generate a random secret (use: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-secret"

# Get from Stripe Dashboard (use test mode initially)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 4. Initialize Database Schema

```bash
npm run db:push
```

This creates all database tables. You should see:
```
✓ Generated Prisma Client
✓ Database synchronized
```

### 5. (Optional) Explore Database

```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555 to view/edit data

### 6. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Testing the Application

### Create a Test Studio

1. Since authentication isn't fully configured, you'll need to manually create a studio in the database
2. Run `npm run db:studio`
3. Create a User:
   - email: "owner@studio.com"
   - name: "Studio Owner"
   - password: "hashedpassword" (for now)
   - role: "STUDIO_OWNER"

4. Create a Studio:
   - name: "Test Recording Studio"
   - description: "Professional recording studio"
   - email: "contact@teststudio.com"
   - hourlyRate: 100
   - ownerId: (select the user you just created)

5. Create StudioAvailability records for operating hours:
   - Add entries for days 1-5 (Monday-Friday)
   - startTime: "09:00"
   - endTime: "18:00"
   - studioId: (your studio)

### Test Booking Flow

1. Visit http://localhost:3000/book
2. Select your test studio
3. Choose a date and time
4. Enter client information
5. Use Stripe test card: 4242 4242 4242 4242
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code

## Stripe Test Mode

Use these test cards for different scenarios:

**Successful Payment**
- Card: 4242 4242 4242 4242
- Result: Payment succeeds

**Payment Requires Authentication**
- Card: 4000 0025 0000 3155
- Result: 3D Secure authentication required

**Declined Payment**
- Card: 4000 0000 0000 9995
- Result: Payment declined

## Common Issues

### Database Connection Failed
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Ensure database exists

### Stripe Errors
- Verify API keys are correct
- Make sure you're using test mode keys (sk_test_ and pk_test_)
- Check Stripe Dashboard for detailed errors

### Port 3000 Already in Use
```bash
# Kill the process using port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

## Production Deployment Checklist

- [ ] Set up production PostgreSQL database
- [ ] Update DATABASE_URL with production connection string
- [ ] Generate new NEXTAUTH_SECRET for production
- [ ] Switch to Stripe live mode keys
- [ ] Set up Stripe webhooks for payment confirmations
- [ ] Configure email service (SMTP settings)
- [ ] Set up proper authentication system
- [ ] Enable SSL/HTTPS
- [ ] Set up monitoring and error tracking
- [ ] Configure backup strategy for database

## Next Steps

1. **Customize Branding**: Update colors in `tailwind.config.ts`
2. **Add Authentication**: Implement NextAuth.js with your preferred provider
3. **Email Notifications**: Set up email service for booking confirmations
4. **Add More Studios**: Create additional studios via the dashboard
5. **Configure Services**: Add services like mixing, mastering, etc.
6. **Set Up Rooms**: Add multiple recording spaces per studio

## Need Help?

- Check the main README.md for detailed documentation
- Review the API routes in `/src/server/api/routers/`
- Explore the database schema in `/prisma/schema.prisma`
- Check Next.js docs: https://nextjs.org/docs
- Prisma docs: https://www.prisma.io/docs
- tRPC docs: https://trpc.io/docs
