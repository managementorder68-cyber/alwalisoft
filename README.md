# Telegram Rewards Bot - Backend & Admin Dashboard

A comprehensive platform for managing a Telegram rewards bot system with task management, referral tracking, and USDT withdrawals.

## Features

### User Portal
- Task management and earnings tracking
- Real-time balance display
- Weekly earnings analytics
- Referral system with commission tracking
- Rewards shop and card collection
- Withdrawal requests with USDT support

### Admin Dashboard
- User management and statistics
- Task creation and management
- Real-time earnings tracking
- Referral system monitoring
- Payment processing
- Analytics and reporting

### API Endpoints
- User management (create, read, update)
- Task management and completion tracking
- Referral commission handling
- Withdrawal request processing
- Statistics and analytics

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 with custom theme
- **Charts**: Recharts
- **Components**: shadcn/ui
- **Backend**: Next.js Route Handlers
- **Database**: PostgreSQL (Neon/Supabase)
- **Authentication**: JWT + Telegram Web App verification

## Project Structure

\`\`\`
.
├── app/
│   ├── page.tsx                 # Admin dashboard
│   ├── user/
│   │   └── page.tsx             # User portal
│   ├── api/
│   │   ├── users/               # User management APIs
│   │   ├── tasks/               # Task management APIs
│   │   ├── rewards/             # Reward tracking APIs
│   │   ├── referrals/           # Referral system APIs
│   │   └── withdrawals/         # Withdrawal processing APIs
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Theme and styles
├── lib/
│   ├── auth.ts                  # Authentication utilities
│   └── security-headers.ts      # Security configurations
├── components/
│   ├── ui/                      # shadcn/ui components
│   └── navigation.tsx           # Navigation configuration
├── database/
│   └── schema.sql               # Database schema
└── middleware.ts                # Request middleware
\`\`\`

## Getting Started

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/rewards-bot.git
cd rewards-bot
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

### Environment Variables

\`\`\`
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
JWT_SECRET=your_jwt_secret_key
DATABASE_URL=postgresql://user:password@host:port/database
NEXT_PUBLIC_BOT_USERNAME=your_bot_username
\`\`\`

### Database Setup

1. Create a new PostgreSQL database
2. Run the schema file:

\`\`\`bash
psql -U username -d database_name < database/schema.sql
\`\`\`

3. Or run from SQL editor in Supabase/Neon dashboard

### Development

Start the development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the admin dashboard.
Open [http://localhost:3000/user](http://localhost:3000/user) to view the user portal.

## API Documentation

### Users API

**Create User**
\`\`\`
POST /api/users
Content-Type: application/json

{
  "telegramId": 123456789,
  "username": "john_doe",
  "referralCode": "ref_user123" (optional)
}
\`\`\`

**Get User**
\`\`\`
GET /api/users?id=user_123
GET /api/users?telegramId=123456789
\`\`\`

### Tasks API

**Get Tasks**
\`\`\`
GET /api/tasks
GET /api/tasks?category=channel&active=true
\`\`\`

**Create Task** (Admin only)
\`\`\`
POST /api/tasks
Content-Type: application/json

{
  "name": "Join Channel",
  "description": "Subscribe to main channel",
  "category": "channel",
  "reward": 5000
}
\`\`\`

### Rewards API

**Complete Task**
\`\`\`
POST /api/rewards/complete-task
Content-Type: application/json

{
  "userId": "user_123",
  "taskId": "task_1",
  "rewardAmount": 5000
}
\`\`\`

### Referrals API

**Create Referral**
\`\`\`
POST /api/referrals
Content-Type: application/json

{
  "referrerId": "user_123",
  "referredId": "user_456"
}
\`\`\`

**Get Referrals**
\`\`\`
GET /api/referrals?referrerId=user_123
\`\`\`

### Withdrawals API

**Request Withdrawal**
\`\`\`
POST /api/withdrawals
Content-Type: application/json

{
  "userId": "user_123",
  "amount": 5000000,
  "walletAddress": "Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
\`\`\`

**Get Withdrawal History**
\`\`\`
GET /api/withdrawals?userId=user_123
\`\`\`

## Security Features

- Telegram Web App verification
- JWT token authentication
- Request validation and sanitization
- SQL injection prevention
- CORS protection
- Security headers (X-Frame-Options, X-Content-Type-Options)
- Rate limiting ready (implement with middleware)

## Database Schema

### Users Table
- `id`: UUID primary key
- `telegram_id`: Unique Telegram ID
- `username`: User's Telegram username
- `balance`: Current coin balance
- `level`: User level (Beginner, Professional, Expert, VIP)
- `referral_code`: Unique referral code
- `referred_by`: UUID of referrer
- `tasks_completed`: Number of completed tasks
- `referral_count`: Number of successful referrals

### Tasks Table
- `id`: UUID primary key
- `name`: Task name
- `description`: Task description
- `category`: channel, group, video, share, referral
- `reward`: Coins reward amount
- `is_active`: Active status
- `is_bonus`: Bonus task flag
- `expires_at`: Expiration time for bonus tasks

### Task Completions Table
- `user_id`: Reference to users table
- `task_id`: Reference to tasks table
- `reward_amount`: Amount rewarded
- `bonus_multiplier`: Bonus multiplier applied
- `completed_at`: Completion timestamp
- `verified`: Admin verification status

### Referrals Table
- `referrer_id`: Reference to referrer
- `referred_id`: Reference to referred user
- `level`: Referral level (1-3)
- `commission`: Commission amount

### Withdrawal Requests Table
- `user_id`: Reference to users table
- `amount`: Withdrawal amount in coins
- `wallet_address`: USDT wallet address
- `status`: pending, processing, completed, failed
- `tx_hash`: Blockchain transaction hash

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel settings
4. Deploy

\`\`\`bash
vercel deploy
\`\`\`

### Docker

Create a Dockerfile for containerization:

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Telegram Bot Integration

The bot server should call these endpoints:

1. **On user start**: `POST /api/users` to create/register user
2. **On task completion**: `POST /api/rewards/complete-task` to award coins
3. **On referral**: `POST /api/referrals` to track referral
4. **On withdrawal request**: `POST /api/withdrawals` to process request

## Development Roadmap

- [x] Admin dashboard
- [x] User portal
- [x] API endpoints
- [x] Database schema
- [ ] Telegram bot integration
- [ ] Payment gateway integration (Stripe)
- [ ] Email notifications
- [ ] Analytics dashboard improvements
- [ ] Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@rewardsbot.com or open an issue in the GitHub repository.

## Next Steps - Telegram Bot Server

To complete the integration, you'll need to build a separate server (Node.js/Python) that:

1. Runs the Telegram bot using `telegram-bot-api`
2. Handles `/start` command to register users
3. Presents inline buttons for tasks
4. Verifies task completion with Telegram APIs
5. Calls the backend APIs to update rewards
6. Sends withdrawal notifications

Example bot server structure:
\`\`\`
telegram-bot-server/
├── src/
│   ├── bot.ts              # Main bot logic
│   ├── handlers/
│   │   ├── start.ts        # /start handler
│   │   ├── tasks.ts        # Task presentation
│   │   └── withdraw.ts     # Withdrawal handling
│   ├── services/
│   │   ├── api.ts          # Calls to backend
│   │   └── telegram.ts     # Telegram API calls
│   └── config.ts           # Configuration
└── package.json
