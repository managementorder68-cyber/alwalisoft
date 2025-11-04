# Quick Start Guide

Get the Telegram Rewards Bot running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- A Telegram account
- A text editor (VS Code recommended)

## Step 1: Clone & Install (1 min)

\`\`\`bash
git clone https://github.com/yourusername/rewards-bot.git
cd rewards-bot
npm install
\`\`\`

## Step 2: Setup Environment (2 min)

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` and add:
- `TELEGRAM_BOT_TOKEN`: Get from @BotFather on Telegram
- `JWT_SECRET`: Any random string (e.g., `your_secret_key_123`)
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXT_PUBLIC_BOT_USERNAME`: Your bot's username from @BotFather

## Step 3: Setup Database (1 min)

\`\`\`bash
# For Supabase/Neon:
psql $DATABASE_URL < database/schema.sql

# Or copy-paste schema.sql into your database's SQL editor
\`\`\`

## Step 4: Run Development Server (1 min)

\`\`\`bash
npm run dev
\`\`\`

Open browser:
- **Admin Dashboard**: http://localhost:3000
- **User Portal**: http://localhost:3000/user

## Step 5: Test It

1. Go to your Telegram bot (@your_bot_name)
2. Click Start
3. Check your admin dashboard to see the new user

## Next Steps

- Configure more tasks
- Set up Telegram bot server (separate project)
- Deploy to Vercel
- Add your domain
- Configure payment processing

## Common Issues

**Database connection error?**
- Verify DATABASE_URL is correct
- Check database is running/accessible
- Ensure credentials are right

**Bot token error?**
- Get a new token from @BotFather
- Make sure it's in `.env.local`
- Don't commit `.env.local` to git

**Port 3000 in use?**
- Run on different port: `npm run dev -- -p 3001`

Need more help? Check README.md or ARCHITECTURE.md
