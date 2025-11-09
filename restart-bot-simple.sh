#!/bin/bash

echo "🤖 Starting Telegram Bot..."

cd /workspace

# Kill any existing bot process
pkill -f "ts-node bot/index.ts" 2>/dev/null
pkill -f "node.*bot" 2>/dev/null

# Wait a moment
sleep 1

# Start the bot
NODE_ENV=production npx ts-node bot/index.ts > /tmp/bot.log 2>&1 &

BOT_PID=$!

echo "✅ Bot started with PID: $BOT_PID"
echo "📝 Logs: tail -f /tmp/bot.log"

# Show initial logs
sleep 2
echo ""
echo "📋 Initial bot output:"
tail -20 /tmp/bot.log
