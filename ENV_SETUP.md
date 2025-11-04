# Environment Variables Setup Guide

Complete guide for setting up environment variables for the Telegram Rewards Bot.

## Overview

Environment variables are configuration values that your application needs to run. They're stored separately from your code for security reasons.

## Quick Setup (Local Development)

### 1. Copy the Example File

\`\`\`bash
cp .env.example .env.local
\`\`\`

### 2. Fill in Your Values

Edit `.env.local` and replace placeholders with real values.

### 3. Never Commit This File

Add to `.gitignore` (already included):
\`\`\`
.env.local
.env.*.local
\`\`\`

## Environment Variables Reference

### TELEGRAM_BOT_TOKEN (Required)

Your Telegram bot's authentication token.

**How to get it:**
1. Open Telegram and find @BotFather
2. Send `/newbot`
3. Follow the prompts to create a new bot
4. Copy the token provided
5. Paste it in `.env.local`

**Example:**
\`\`\`
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklmnoPQRstuvWXYZ-1234567890
\`\`\`

### JWT_SECRET (Required)

Secret key used to sign and verify JWT authentication tokens.

**How to generate it:**
\`\`\`bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
\`\`\`

**Or:**
\`\`\`bash
# Using OpenSSL (if available)
openssl rand -hex 64
\`\`\`

**Example:**
\`\`\`
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f
\`\`\`

### NEON_DATABASE_URL (Required)

PostgreSQL connection string for your database.

**Supported providers:**
- Neon (https://neon.tech)
- Supabase (https://supabase.com)
- Railway
- Render
- Your own PostgreSQL server

**Format:**
\`\`\`
postgresql://username:password@host:port/database_name
\`\`\`

**Example (Neon):**
\`\`\`
DATABASE_URL=postgresql://user:password@ep-cool-penguin-123.us-east-1.neon.tech/rewards_bot?sslmode=require
\`\`\`

**Example (Supabase):**
\`\`\`
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres
\`\`\`

### NEXT_PUBLIC_BOT_USERNAME (Required)

Your Telegram bot's username (without the @ symbol).

**Example:**
\`\`\`
NEXT_PUBLIC_BOT_USERNAME=MyRewardsBot
\`\`\`

**Note:** This is public and used in the frontend for display purposes. The `NEXT_PUBLIC_` prefix means it's accessible in the browser.

### BACKEND_API_URL (Required for Production)

The URL where your backend API is hosted.

**Example (Development):**
\`\`\`
BACKEND_API_URL=http://localhost:3000/api
\`\`\`

**Example (Production):**
\`\`\`
BACKEND_API_URL=https://rewards-bot.vercel.app/api
\`\`\`

### WEBHOOK_URL (Required)

The URL where Telegram will send webhook updates. This should point to your `/api/webhook` endpoint.

**Example (Development with Ngrok):**
\`\`\`
WEBHOOK_URL=https://xxxx-xxx-xxx.ngrok.io/api/webhook
\`\`\`

**Example (Production):**
\`\`\`
WEBHOOK_URL=https://rewards-bot.vercel.app/api/webhook
\`\`\`

### NODE_ENV (Optional)

Specifies the environment (affects logging, error handling, etc.).

**Values:**
- `development` - Verbose logging, development features
- `production` - Optimized, minimal logging

**Default:** `development`

\`\`\`
NODE_ENV=development
\`\`\`

## Platform-Specific Setup

### Vercel Deployment

1. Go to your project on https://vercel.com
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - Name: Variable name (e.g., `TELEGRAM_BOT_TOKEN`)
   - Value: The actual value
   - Environments: Select which environments (Production, Preview, Development)

4. Redeploy your project after adding variables

**Example screenshot path:**
Settings → Environment Variables → Add → Enter Name & Value → Save → Redeploy

### Local Development

1. Create `.env.local` in project root
2. Add all variables
3. Restart your dev server: `npm run dev`

### Docker

Add to your Docker build:

\`\`\`dockerfile
# Copy env file
COPY .env.local .env.local

# Or set at runtime
ENV TELEGRAM_BOT_TOKEN=your_token
\`\`\`

## Testing Your Setup

### Verify Variables Are Loaded

Create a test file `test-env.js`:

\`\`\`javascript
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? '✓ Set' : '✗ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');
console.log('NEXT_PUBLIC_BOT_USERNAME:', process.env.NEXT_PUBLIC_BOT_USERNAME ? '✓ Set' : '✗ Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);
\`\`\`

Run with:
\`\`\`bash
node test-env.js
\`\`\`

### Test Database Connection

In your Next.js app, add an API route to test the database:

\`\`\`typescript
// app/api/test/db/route.ts
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql('SELECT 1');
    return Response.json({ status: 'Database connected' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
\`\`\`

Then visit: `http://localhost:3000/api/test/db`

### Test API

\`\`\`bash
# Test if backend is running
curl https://your-domain.com/api/users

# Test with token
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" https://your-domain.com/api/users
\`\`\`

## Security Best Practices

### Do's

✅ Use strong random values for secrets
✅ Rotate JWT_SECRET periodically
✅ Use different values for dev/staging/production
✅ Keep `.env.local` in `.gitignore`
✅ Use environment-specific secrets
✅ Regenerate TELEGRAM_BOT_TOKEN if compromised

### Don'ts

❌ Don't commit `.env.local` to Git
❌ Don't share environment files
❌ Don't hardcode secrets in code
❌ Don't use weak/simple secrets
❌ Don't log secrets to console
❌ Don't put secrets in public URLs

## Troubleshooting

### Variables Not Loading

**Problem:** `undefined` errors when accessing env vars

**Solution:**
- Verify `.env.local` exists in project root
- Restart dev server: `npm run dev`
- Check variable names match exactly
- For `NEXT_PUBLIC_` vars, rebuild the app

### Database Connection Failed

**Problem:** "Unable to connect to database" error

**Solution:**
- Test DATABASE_URL manually: `psql $DATABASE_URL`
- Verify database is running
- Check username/password are correct
- For Neon/Supabase, ensure IP is whitelisted
- Check connection pool settings

### Telegram Bot Token Invalid

**Problem:** "Unauthorized" errors from Telegram API

**Solution:**
- Get a new token from @BotFather
- Remove old token from `.env.local`
- Paste new token exactly (no extra spaces)
- Restart dev server

### JWT Signature Invalid

**Problem:** Token validation fails for users

**Solution:**
- Regenerate JWT_SECRET in `.env.local`
- Clear browser cookies/localStorage
- Users will need to re-login
- Don't change JWT_SECRET in production frequently

## Advanced Configuration

### Multiple Environments

Create separate env files for each environment:

\`\`\`
.env.local           # Local development
.env.production      # Production (not used, reference only)
.env.staging         # Staging environment
\`\`\`

For Next.js, use:
\`\`\`bash
npm run dev          # Uses .env.local
npm run build        # Uses .env.production (if exists)
\`\`\`

### Conditional Configuration

In your code:

\`\`\`typescript
const isDev = process.env.NODE_ENV === 'development';
const apiUrl = isDev 
  ? 'http://localhost:3000/api'
  : process.env.BACKEND_API_URL;
\`\`\`

### Secret Rotation

Change secrets periodically:

\`\`\`bash
# Generate new JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env.local
# Restart server
# Old JWT tokens will be invalid (users re-login)
\`\`\`

## Support

- Check logs for specific errors
- Review DATABASE_URL format
- Test connectivity to external services
- Contact support if issues persist

For more info, see README.md and ARCHITECTURE.md
