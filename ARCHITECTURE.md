# Architecture Overview

## System Components

\`\`\`
┌─────────────────┐
│  Telegram Bot   │ (Separate Node.js/Python Server)
│  (telegram-bot- │
│   api library)  │
└────────┬────────┘
         │
         │ HTTP Calls
         │
┌────────▼──────────────────────────────────┐
│      Backend API (Next.js Route Handlers)  │
│                                            │
│  ├── /api/users                           │
│  ├── /api/tasks                           │
│  ├── /api/rewards                         │
│  ├── /api/referrals                       │
│  └── /api/withdrawals                     │
└────────┬──────────────────────────────────┘
         │
         │ Queries/Writes
         │
┌────────▼────────────┐
│  PostgreSQL Database│
│  (Neon/Supabase)   │
└─────────────────────┘

┌──────────────────────────────────┐
│     Frontend (Next.js Pages)     │
├──────────────────────────────────┤
│  Admin Dashboard (/admin)        │
│  User Portal (/user)             │
│  Landing Page (/)                │
└──────────────────────────────────┘
\`\`\`

## Data Flow

### User Registration Flow
1. User starts bot: `/start ref_code`
2. Bot verifies Telegram ID
3. Bot calls `POST /api/users`
4. User record created in DB
5. Initial 2000 coins awarded

### Task Completion Flow
1. User clicks "Complete Task" in bot
2. Task verification (join group, watch video, etc.)
3. Bot calls `POST /api/rewards/complete-task`
4. Coins transferred to user balance
5. Task marked completed

### Referral Flow
1. User shares referral link
2. New user starts bot with `?start=ref_code`
3. Bot calls `POST /api/referrals`
4. Both referrer and referred get rewards
5. Multi-level commissions calculated

### Withdrawal Flow
1. User requests withdrawal in bot/portal
2. Bot calls `POST /api/withdrawals`
3. Admin reviews and processes
4. USDT transferred to wallet
5. Transaction hash recorded

## Authentication Strategy

\`\`\`
Telegram Web App
       │
       ├─ initData (signed by Telegram)
       │
       ▼
Verify initData with JWT_SECRET
       │
       ├─ Valid? Generate JWT token
       │
       ├─ Store in httpOnly cookie
       │
       ▼
All subsequent requests use JWT in Authorization header
\`\`\`

## Security Layers

1. **Transport**: HTTPS only
2. **Telegram**: initData signature verification
3. **Authentication**: JWT tokens in httpOnly cookies
4. **Authorization**: Middleware checks on protected routes
5. **Database**: Parameterized queries (preventing SQL injection)
6. **API**: Input validation and sanitization
7. **Headers**: Security headers (CSP, X-Frame-Options, etc.)

## Database Relationships

\`\`\`
Users (1) ──────────(N) TaskCompletions
  │
  ├─ referral_code
  │
  └─ referred_by ──────────(1) Users (Self-referential)

Tasks (1) ────────────(N) TaskCompletions

Users (1 referrer) ──(N) Referrals (N referred) Users
  │
  └─ Multi-level: Level 1, Level 2, Level 3

Users (1) ────────────(N) WithdrawalRequests

Users (1) ────────────(1) UserStatistics
\`\`\`

## API Response Format

All APIs follow a consistent format:

\`\`\`json
{
  "success": true,
  "data": {...},
  "message": "Operation completed",
  "timestamp": "2025-01-15T10:30:00Z"
}
\`\`\`

Error responses:
\`\`\`json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-15T10:30:00Z"
}
\`\`\`

## Performance Optimizations

- Database indexes on frequently queried fields
- Pagination for large result sets
- Caching strategy for task lists
- Connection pooling with database
- CDN for static assets
- Analytics aggregation (daily/weekly/monthly snapshots)

## Scalability Considerations

- Horizontal scaling with stateless API servers
- Read replicas for analytics queries
- Queue system for withdrawal processing
- Rate limiting to prevent abuse
- Monitoring and alerting setup
