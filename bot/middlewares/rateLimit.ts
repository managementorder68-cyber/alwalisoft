import { BotContext } from '../index';
import { Middleware } from 'telegraf';
import { logger } from '../utils/logger';
import { config } from '../config';

export const rateLimitMiddleware: Middleware<BotContext> = async (ctx, next) => {
  const telegramId = ctx.from?.id;

  if (!telegramId) {
    return next();
  }

  const rateLimitKey = `ratelimit:${telegramId}`;

  try {
    // Skip if Redis not available
    if (!ctx.redis) {
      return next();
    }

    // Get current count
    const count = await ctx.redis.incr(rateLimitKey);

    // Set expiry on first request
    if (count === 1) {
      await ctx.redis.expire(rateLimitKey, Math.floor(config.rateLimitWindow / 1000));
    }

    // Check if limit exceeded
    if (count > config.rateLimitMax) {
      logger.warn(`Rate limit exceeded for user ${telegramId}`);
      
      await ctx.reply(
        '⚠️ You are sending too many requests. Please slow down and try again in a minute.',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }],
            ],
          },
        }
      );
      return;
    }

    await next();
  } catch (error) {
    logger.error({ err: error }, 'Rate limit middleware error:');
    await next();
  }
};
