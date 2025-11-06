import { Context } from 'telegraf';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface NotificationContext extends Context {
  prisma: PrismaClient;
}

/**
 * Send notification to a user
 */
export async function sendNotification(
  ctx: NotificationContext,
  telegramId: string,
  message: string,
  options?: {
    parse_mode?: 'HTML' | 'Markdown';
    reply_markup?: any;
  }
) {
  try {
    await ctx.telegram.sendMessage(telegramId, message, options);
    logger.info(`Notification sent to user ${telegramId}`);
    return true;
  } catch (error: any) {
    logger.error('Error sending notification:', { error: error.message, telegramId });
    return false;
  }
}

/**
 * Send bulk notifications to multiple users
 */
export async function sendBulkNotifications(
  ctx: NotificationContext,
  userIds: string[],
  message: string,
  options?: {
    parse_mode?: 'HTML' | 'Markdown';
    reply_markup?: any;
  }
) {
  const results = {
    sent: 0,
    failed: 0
  };

  for (const telegramId of userIds) {
    const success = await sendNotification(ctx, telegramId, message, options);
    if (success) {
      results.sent++;
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      results.failed++;
    }
  }

  logger.info(`Bulk notifications completed: ${results.sent} sent, ${results.failed} failed`);
  return results;
}

/**
 * Send daily reminder to all active users
 */
export async function sendDailyReminders(ctx: NotificationContext) {
  try {
    // Get users who haven't claimed daily reward today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        telegramId: true
      }
    });

    const message = `🎁 <b>تذكير يومي!</b>

لم تحصل على مكافأتك اليومية بعد!

💰 احصل على <b>500+ عملة</b> مجاناً
🔥 حافظ على سلسلة أيامك لمكافآت أكبر

اضغط /start للحصول على مكافأتك الآن! ⚡`;

    const userIds = users.map(u => u.telegramId);
    const results = await sendBulkNotifications(ctx, userIds, message, {
      parse_mode: 'HTML'
    });

    logger.info(`Daily reminders sent: ${results.sent}/${userIds.length}`);
    return results;
  } catch (error: any) {
    logger.error('Error sending daily reminders:', error);
    throw error;
  }
}

/**
 * Notify user about new task
 */
export async function notifyNewTask(
  ctx: NotificationContext,
  taskName: string,
  taskReward: number
) {
  try {
    const activeUsers = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { telegramId: true }
    });

    const message = `🎯 <b>مهمة جديدة متاحة!</b>

📝 ${taskName}
💰 المكافأة: <b>${taskReward.toLocaleString()} عملة</b>

ابدأ الآن واربح! 🚀`;

    const userIds = activeUsers.map(u => u.telegramId);
    const results = await sendBulkNotifications(ctx, userIds, message, {
      parse_mode: 'HTML'
    });

    logger.info(`New task notifications sent: ${results.sent}/${userIds.length}`);
    return results;
  } catch (error: any) {
    logger.error('Error notifying new task:', error);
    throw error;
  }
}

/**
 * Notify user about withdrawal status
 */
export async function notifyWithdrawalStatus(
  ctx: NotificationContext,
  telegramId: string,
  status: 'APPROVED' | 'REJECTED',
  amount: number,
  reason?: string
) {
  try {
    let message = '';
    
    if (status === 'APPROVED') {
      message = `✅ <b>تمت الموافقة على طلب السحب</b>

💰 المبلغ: <b>${amount.toLocaleString()} عملة</b>

سيتم التحويل خلال 24-48 ساعة. 🎉`;
    } else {
      message = `❌ <b>تم رفض طلب السحب</b>

💰 المبلغ: ${amount.toLocaleString()} عملة
${reason ? `\n📝 السبب: ${reason}` : ''}

تم إعادة المبلغ إلى رصيدك.`;
    }

    await sendNotification(ctx, telegramId, message, {
      parse_mode: 'HTML'
    });

    return true;
  } catch (error: any) {
    logger.error('Error notifying withdrawal status:', error);
    return false;
  }
}

export default {
  sendNotification,
  sendBulkNotifications,
  sendDailyReminders,
  notifyNewTask,
  notifyWithdrawalStatus
};
