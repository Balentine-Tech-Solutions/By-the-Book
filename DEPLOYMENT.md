# Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- PostgreSQL database (recommended: Supabase)

### Step 1: Prepare Repository

1. Ensure all code is committed:
```bash
git add .
git commit -m "Production ready"
git push origin main
```

2. Verify `.gitignore` excludes:
   - `.env` files
   - `node_modules`
   - `.next` directory

### Step 2: Database Setup

**Option A: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string from Settings → Database
4. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

**Option B: Railway**
1. Go to [railway.app](https://railway.app)
2. Create PostgreSQL database
3. Copy connection string

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select GitHub repository
4. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. Add Environment Variables:
```
DATABASE_URL=your_database_connection_string
NEXTAUTH_SECRET=generate_random_32_char_string
NEXTAUTH_URL=https://your-app.vercel.app
STRIPE_SECRET_KEY=sk_live_your_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NODE_ENV=production
```

6. Click "Deploy"

### Step 4: Database Migration

After first deployment:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Run migration
vercel env pull .env.production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-) npx prisma db push
```

### Step 5: Stripe Webhooks

1. Go to Stripe Dashboard
2. Webhooks → Add Endpoint
3. URL: `https://your-app.vercel.app/api/webhooks/stripe`
4. Events to listen:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## Alternative: Deploy to Railway

### Step 1: Railway Setup
```bash
npm i -g @railway/cli
railway login
```

### Step 2: Create Project
```bash
railway init
railway add --database postgres
```

### Step 3: Deploy
```bash
railway up
railway open
```

## Alternative: Deploy to Render

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Configure:
   - Build: `npm install && npm run build`
   - Start: `npm start`
5. Add environment variables
6. Deploy

## Post-Deployment Checklist

### Security
- [ ] SSL/HTTPS enabled
- [ ] Environment variables set
- [ ] Production Stripe keys configured
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database uses SSL connection
- [ ] CORS properly configured

### Functionality
- [ ] Test booking flow
- [ ] Test payment processing
- [ ] Verify email sending (if configured)
- [ ] Check database connections
- [ ] Test API endpoints
- [ ] Verify webhooks working

### Performance
- [ ] Enable caching headers
- [ ] Configure CDN (Vercel automatic)
- [ ] Database connection pooling
- [ ] Monitor response times

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation
- [ ] Enable performance monitoring

## Environment-Specific Configuration

### Development
```env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/bythebook
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Staging
```env
NODE_ENV=staging
DATABASE_URL=postgresql://staging-db-url
NEXTAUTH_URL=https://staging.yourapp.com
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://production-db-url
NEXTAUTH_URL=https://yourapp.com
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate

### DNS Configuration
```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

## Database Backups

### Automated Backups (Supabase)
- Automatic daily backups
- Point-in-time recovery
- Backup retention: 7 days (free tier)

### Manual Backup
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
psql $DATABASE_URL < backup-20260127.sql
```

## Scaling Considerations

### Database
- Use connection pooling (PgBouncer)
- Add read replicas for heavy traffic
- Consider database sharding for multi-tenancy

### Application
- Vercel auto-scales
- Railway auto-scales
- Consider serverless functions for heavy operations

### CDN
- Vercel Edge Network (automatic)
- Cloudflare for additional caching

## Monitoring & Logging

### Recommended Tools
- **Error Tracking**: Sentry
- **Logging**: Logtail, Datadog
- **Uptime**: UptimeRobot, Pingdom
- **Performance**: Vercel Analytics

### Setup Sentry
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

## Troubleshooting

### Build Fails
- Check `npm run build` locally
- Verify all dependencies installed
- Check TypeScript errors
- Review build logs

### Database Connection Issues
- Verify DATABASE_URL format
- Check SSL mode requirement
- Verify IP allowlist
- Test connection locally

### Payment Issues
- Verify Stripe keys are correct
- Check webhook endpoint
- Review Stripe dashboard logs
- Test in Stripe test mode first

### Performance Issues
- Enable database indexes
- Implement caching
- Optimize images
- Use CDN for assets

## Rollback Procedure

### Vercel
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Database Rollback
1. Stop application
2. Restore from backup
3. Run migrations if needed
4. Restart application

## Maintenance Mode

Create `src/pages/maintenance.tsx`:
```tsx
export default function Maintenance() {
  return (
    <div>
      <h1>Scheduled Maintenance</h1>
      <p>We'll be back shortly</p>
    </div>
  )
}
```

Redirect in middleware during maintenance.

---

**Support**: For deployment issues, check documentation or contact support.
