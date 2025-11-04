# Deployment Guide

Complete guide for deploying the Telegram Rewards Bot to production.

## Prerequisites

- GitHub repository configured
- Vercel account (or alternative hosting)
- Environment variables ready
- Database setup (Neon or Supabase)

## Vercel Deployment

### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the repository and click "Import"

### Step 2: Configure Environment Variables

In Vercel dashboard, go to Settings → Environment Variables and add:

\`\`\`
TELEGRAM_BOT_TOKEN=your_bot_token
JWT_SECRET=your_jwt_secret_key
DATABASE_URL=your_database_connection_string
NEXT_PUBLIC_BOT_USERNAME=your_bot_username
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

### Step 3: Deploy

1. Vercel automatically deploys on push to main branch
2. Or manually click "Deploy" button
3. Wait for build to complete
4. Your app is live at `https://your-app.vercel.app`

### Step 4: Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (24-48 hours)

## Alternative Hosting Options

### Docker Deployment

1. Create Dockerfile (included in repo)
2. Build image: `docker build -t rewards-bot .`
3. Run: `docker run -p 3000:3000 rewards-bot`

### AWS Deployment

1. Create EC2 instance (Node.js AMI)
2. Clone repository
3. Install dependencies and build
4. Use PM2 for process management
5. Set up nginx as reverse proxy
6. Configure SSL with Let's Encrypt

### DigitalOcean Deployment

1. Create Droplet (Node.js preset)
2. SSH into droplet
3. Clone and setup project
4. Use systemd for service management
5. Configure reverse proxy
6. Setup SSL certificate

## Database Setup

### Vercel PostgreSQL

1. In Vercel dashboard → Storage → Create Database
2. Choose PostgreSQL
3. Copy connection string
4. Add to environment variables

### External Database (Neon/Supabase)

1. Create database on Neon or Supabase
2. Get connection string
3. Add to environment variables

### Running Migrations

\`\`\`bash
# For Neon (using @neondatabase/serverless)
npm run migrate

# Or manually using psql:
psql $DATABASE_URL < database/schema.sql
\`\`\`

## Monitoring & Maintenance

### Vercel Analytics

- Monitor in Vercel dashboard
- View real user metrics (Web Vitals)
- Track deployments and performance

### Error Tracking

1. Enable Sentry (optional):
   \`\`\`bash
   npm install @sentry/nextjs
   \`\`\`

2. Configure in `next.config.js`

3. Add SENTRY_AUTH_TOKEN to environment

### Logging

- Vercel provides automatic logging
- View logs in Vercel dashboard
- Can integrate with external services (Datadog, New Relic)

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Admin account created
- [ ] Telegram bot token verified
- [ ] DNS/domain configured
- [ ] SSL certificate active
- [ ] Monitoring setup complete
- [ ] Backups configured
- [ ] Security headers verified
- [ ] Rate limiting enabled

## Troubleshooting

### Build Errors

1. Check logs in Vercel dashboard
2. Verify environment variables
3. Ensure Node.js version compatibility
4. Test locally with `npm run build`

### Database Connection Issues

1. Verify DATABASE_URL format
2. Check database credentials
3. Ensure database is accessible
4. Check firewall/security groups

### Performance Issues

1. Check build logs for warnings
2. Optimize images
3. Review database queries
4. Enable caching headers
5. Consider edge functions

## Rollback Strategy

1. All deployments are versioned in Vercel
2. Click "Deployments" to see history
3. Click three dots on older deployment
4. Select "Promote to Production"
5. Previous version instantly restored

## Security in Production

1. Keep dependencies updated: `npm audit fix`
2. Enable branch protection on main
3. Require PR reviews before merge
4. Rotate JWT_SECRET periodically
5. Monitor for security alerts
6. Use HTTPS only
7. Enable CORS restrictions
8. Implement rate limiting
