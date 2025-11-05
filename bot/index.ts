import { Telegraf, Context, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { config } from './config';
import { logger } from './utils/logger';
import { sessionMiddleware } from './middlewares/session';
import { authMiddleware } from './middlewares/auth';
import { rateLimitMiddleware } from './middlewares/rateLimit';
import { errorHandler } from './middlewares/errorHandler';

// Handlers
import { handleStart } from './handlers/start';
import { handleTasks } from './handlers/tasks';
import { handleEarn } from './handlers/earn';
import { handleReferrals } from './handlers/referrals';
import { handleGames } from './handlers/games';
import { handleCards } from './handlers/cards';
import { handleStats } from './handlers/stats';
import { handleWithdraw } from './handlers/withdraw';
import { handleSupport } from './handlers/support';
import { handleSettings } from './handlers/settings';

// Services
import { initializeServices } from './services';

// Types
export interface BotContext extends Context {
  session?: {
    userId: string;
    telegramId: number;
    language: string;
  };
  redis: Redis;
  prisma: PrismaClient;
}

async function main() {
  logger.info('Starting Telegram Rewards Bot...');

  // Initialize services
  const { redis, prisma } = await initializeServices();

  // Create bot instance
  const bot = new Telegraf<BotContext>(config.telegramBotToken);

  // Attach services to context
  bot.context.redis = redis;
  bot.context.prisma = prisma;

  // Register middlewares
  bot.use(errorHandler);
  bot.use(sessionMiddleware);
  bot.use(rateLimitMiddleware);
  bot.use(authMiddleware);

  // ========================================================================
  // COMMAND HANDLERS
  // ========================================================================

  // Start command with referral support
  bot.command('start', handleStart);

  // Main menu commands
  bot.command('menu', async (ctx) => {
    await ctx.reply(
      'Welcome! Choose an option:',
      getMainKeyboard(ctx)
    );
  });

  // ========================================================================
  // CALLBACK QUERY HANDLERS
  // ========================================================================

  // Tasks
  bot.action(/^tasks/, handleTasks);
  bot.action(/^task_/, handleTasks);

  // Earn
  bot.action(/^earn/, handleEarn);

  // Referrals
  bot.action(/^referrals/, handleReferrals);
  bot.action(/^ref_/, handleReferrals);

  // Games
  bot.action(/^games/, handleGames);
  bot.action(/^game_/, handleGames);

  // Cards
  bot.action(/^cards/, handleCards);
  bot.action(/^card_/, handleCards);

  // Stats
  bot.action(/^stats/, handleStats);

  // Withdraw
  bot.action(/^withdraw/, handleWithdraw);

  // Support
  bot.action(/^support/, handleSupport);

  // Settings
  bot.action(/^settings/, handleSettings);

  // Back to main menu
  bot.action('back_to_menu', async (ctx) => {
    await ctx.editMessageText(
      'Welcome! Choose an option:',
      getMainKeyboard(ctx)
    );
  });

  // ========================================================================
  // MESSAGE HANDLERS
  // ========================================================================

  // Handle text messages
  bot.on(message('text'), async (ctx) => {
    const text = ctx.message.text;

    // Main menu button texts
    if (text === '📋 Tasks' || text === 'المهام 📋') {
      await handleTasks(ctx);
    } else if (text === '💰 Earn' || text === 'اكسب 💰') {
      await handleEarn(ctx);
    } else if (text === '👥 Referrals' || text === 'الإحالات 👥') {
      await handleReferrals(ctx);
    } else if (text === '🎮 Games' || text === 'الألعاب 🎮') {
      await handleGames(ctx);
    } else if (text === '🃏 Cards' || text === 'البطاقات 🃏') {
      await handleCards(ctx);
    } else if (text === '📊 My Stats' || text === 'إحصائياتي 📊') {
      await handleStats(ctx);
    } else if (text === '💳 Withdraw' || text === 'السحب 💳') {
      await handleWithdraw(ctx);
    } else if (text === '⚙️ Settings' || text === 'الإعدادات ⚙️') {
      await handleSettings(ctx);
    } else if (text === '❓ Support' || text === 'الدعم ❓') {
      await handleSupport(ctx);
    } else {
      await ctx.reply(
        'Unknown command. Please use the menu below.',
        getMainKeyboard(ctx)
      );
    }
  });

  // ========================================================================
  // ERROR HANDLING
  // ========================================================================

  bot.catch((err: any, ctx: BotContext) => {
    logger.error({ err: err }, `Error for ${ctx.updateType}:`);
    ctx.reply('An error occurred. Please try again later.');
  });

  // ========================================================================
  // GRACEFUL SHUTDOWN
  // ========================================================================

  process.once('SIGINT', () => {
    logger.info('SIGINT received. Stopping bot gracefully...');
    bot.stop('SIGINT');
    if (redis) redis.disconnect();
    prisma.$disconnect();
  });

  process.once('SIGTERM', () => {
    logger.info('SIGTERM received. Stopping bot gracefully...');
    bot.stop('SIGTERM');
    if (redis) redis.disconnect();
    prisma.$disconnect();
  });

  // ========================================================================
  // START BOT
  // ========================================================================

  await bot.launch();
  logger.info('Bot started successfully!');
  logger.info(`Bot username: @${bot.botInfo?.username}`);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getMainKeyboard(ctx: BotContext) {
  const isArabic = ctx.session?.language === 'ar';

  return Markup.inlineKeyboard([
    [
      Markup.button.callback(isArabic ? 'المهام 📋' : '📋 Tasks', 'tasks'),
      Markup.button.callback(isArabic ? 'اكسب 💰' : '💰 Earn', 'earn'),
    ],
    [
      Markup.button.callback(isArabic ? 'الإحالات 👥' : '👥 Referrals', 'referrals'),
      Markup.button.callback(isArabic ? 'الألعاب 🎮' : '🎮 Games', 'games'),
    ],
    [
      Markup.button.callback(isArabic ? 'البطاقات 🃏' : '🃏 Cards', 'cards'),
      Markup.button.callback(isArabic ? 'إحصائياتي 📊' : '📊 My Stats', 'stats'),
    ],
    [
      Markup.button.callback(isArabic ? 'السحب 💳' : '💳 Withdraw', 'withdraw'),
      Markup.button.callback(isArabic ? 'الدعم ❓' : '❓ Support', 'support'),
    ],
    [
      Markup.button.callback(isArabic ? 'الإعدادات ⚙️' : '⚙️ Settings', 'settings'),
    ],
  ]);
}

// Start the bot
main().catch((error) => {
  logger.error({ err: error }, 'Failed to start bot:');
  process.exit(1);
});
