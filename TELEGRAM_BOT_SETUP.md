# Telegram Bot Server Setup Guide

This guide covers setting up the Telegram bot server that integrates with the rewards platform.

## Prerequisites

- Node.js 16+
- Bot token from @BotFather
- Backend API running (see README.md)

## Bot Server Architecture

\`\`\`
npm init -y
npm install telegraf dotenv axios

Create src/bot.ts:
\`\`\`

## Basic Bot Structure

\`\`\`typescript
// src/bot.ts
import { Telegraf, Context } from 'telegraf'
import axios from 'axios'

const API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000'
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '')

// Start command
bot.start(async (ctx) => {
  const userId = ctx.from.id
  const username = ctx.from.username || `user_${userId}`
  
  try {
    // Register user with backend
    await axios.post(`${API_URL}/api/users`, {
      telegramId: userId,
      username: username,
      referralCode: ctx.startPayload || undefined
    })
    
    ctx.reply('Welcome to Rewards Bot!', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 View Tasks', callback_data: 'tasks' }],
          [{ text: '💰 My Earnings', callback_data: 'earnings' }],
          [{ text: '👥 Referrals', callback_data: 'referrals' }],
        ]
      }
    })
  } catch (error) {
    ctx.reply('Error registering user. Please try again.')
  }
})

// Handle callbacks
bot.action('tasks', async (ctx) => {
  const tasks = await axios.get(`${API_URL}/api/tasks?active=true`)
  // Display tasks with complete buttons
})

bot.launch()
\`\`\`

## Deployment

### Option 1: Polling (Development)
\`\`\`typescript
bot.launch({
  polling: {
    interval: 300,
    timeout: 300,
  }
})
\`\`\`

### Option 2: Webhook (Production)
\`\`\`typescript
bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/webhook`)
app.post('/webhook', (req, res) => {
  bot.handleUpdate(req.body, res)
})
\`\`\`

## Environment Variables for Bot Server

\`\`\`
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
BACKEND_API_URL=http://localhost:3000
WEBHOOK_URL=https://yourdomain.com (for production)
NODE_ENV=development
\`\`\`

## Features to Implement

- Task listing and completion
- User earnings dashboard
- Referral link generation
- Withdrawal requests
- Mini-games (dice, dice, slots)
- Daily streak tracking
- Notifications
\`\`\`

```json file="" isHidden
