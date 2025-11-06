import { BotContext } from '../index';
import { logger } from './logger';

/**
 * Safe callback query answer
 * Handles errors gracefully to prevent bot crashes
 */
export async function safeAnswerCallback(
  ctx: BotContext,
  text?: string,
  showAlert: boolean = false
): Promise<void> {
  try {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery(text, { show_alert: showAlert });
    }
  } catch (error: any) {
    // Ignore callback query timeout errors
    if (!error.message?.includes('query is too old')) {
      logger.error({ err: error }, 'Failed to answer callback query');
    }
  }
}

/**
 * Safe message edit
 * Handles errors gracefully to prevent bot crashes
 */
export async function safeEditMessage(
  ctx: BotContext,
  text: string,
  extra?: any
): Promise<void> {
  try {
    await ctx.editMessageText(text, extra);
  } catch (error: any) {
    // Message not modified or not found - ignore
    if (error.message?.includes('message is not modified') || 
        error.message?.includes('message to edit not found')) {
      return;
    }
    logger.error({ err: error }, 'Failed to edit message');
    throw error;
  }
}

/**
 * Safe message reply
 * Handles errors gracefully to prevent bot crashes
 */
export async function safeReply(
  ctx: BotContext,
  text: string,
  extra?: any
): Promise<void> {
  try {
    await ctx.reply(text, extra);
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to send reply');
    throw error;
  }
}

/**
 * Handle database errors
 */
export function handleDatabaseError(error: any, context: string): Error {
  logger.error({ err: error, context }, 'Database error');
  
  if (error.code === 'P2002') {
    return new Error('This record already exists');
  }
  
  if (error.code === 'P2025') {
    return new Error('Record not found');
  }
  
  return new Error('Database error occurred. Please try again.');
}
