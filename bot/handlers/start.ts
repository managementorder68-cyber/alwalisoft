import { BotContext } from '../index';
import { Markup } from 'telegraf';
import { logger } from '../utils/logger';
import { nanoid } from 'nanoid';
import { config } from '../config';

export async function handleStart(ctx: BotContext) {
  const telegramId = ctx.from?.id;
  const username = ctx.from?.username;
  const firstName = ctx.from?.first_name;
  const lastName = ctx.from?.last_name;
  const languageCode = ctx.from?.language_code || 'en';

  if (!telegramId) {
    return;
  }

  try {
    // Check if user already exists
    let user = await ctx.prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
    });

    const isNewUser = !user;

    // Extract referral code from start parameter
    const startPayload = ctx.message && 'text' in ctx.message 
      ? ctx.message.text.split(' ')[1] 
      : undefined;
    
    let referrerId: string | undefined;

    if (isNewUser) {
      // Handle referral
      if (startPayload && startPayload.startsWith('ref_')) {
        const referralCode = startPayload;
        const referrer = await ctx.prisma.user.findUnique({
          where: { referralCode },
        });

        if (referrer) {
          referrerId = referrer.id;
        }
      }

      // Create new user
      user = await ctx.prisma.user.create({
        data: {
          telegramId: String(telegramId),
          username: username || `user_${telegramId}`,
          firstName,
          lastName,
          languageCode,
          referralCode: `ref_${nanoid(10)}`,
          referredById: referrerId,
          balance: referrerId 
            ? Number(config.referredUserSignupBonus) 
            : 2000,
        },
      });

      // Create user statistics
      await ctx.prisma.userStatistics.create({
        data: {
          userId: user.id,
        },
      });

      // Create wallet
      await ctx.prisma.wallet.create({
        data: {
          userId: user.id,
          balance: Number(user.balance),
        },
      });

      // Process referral rewards
      if (referrerId) {
        await processReferralRewards(ctx, referrerId, user.id);
      }

      logger.info(`New user registered: ${telegramId} (${username})`);
    } else {
      // Update existing user
      await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          lastActiveAt: new Date(),
          username: username || user.username,
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
        },
      });
    }

    // Create session
    ctx.session = {
      userId: user.id,
      telegramId: user.telegramId,
      language: languageCode,
    };

    // Save session to Redis if available
    const sessionKey = `session:${telegramId}`;
    if (ctx.redis) {
      await ctx.redis.setex(
        sessionKey,
        3600, // 1 hour
        JSON.stringify(ctx.session)
      );
    }

    // Send welcome message
    const isArabic = languageCode === 'ar';
    
    // Get Mini App URL - always point to /mini-app
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const miniAppUrl = `${baseUrl}/mini-app`;
    
    if (isNewUser) {
      await ctx.reply(
        isArabic
          ? `🎉 مرحباً ${firstName}!\n\n` +
            `تم تسجيلك بنجاح في بوت المكافآت 🎁\n\n` +
            `💰 رصيدك الحالي: ${user.balance.toString()} عملة\n\n` +
            `🎯 ابدأ بإكمال المهام اليومية واكسب المزيد من العملات!\n` +
            `👥 قم بدعوة أصدقائك واحصل على مكافآت إضافية!\n\n` +
            `👇 اضغط على الزر لفتح التطبيق:`
          : `🎉 Welcome ${firstName}!\n\n` +
            `You have successfully registered in the Rewards Bot 🎁\n\n` +
            `💰 Your current balance: ${user.balance.toString()} coins\n\n` +
            `🎯 Start completing daily tasks and earn more coins!\n` +
            `👥 Invite your friends and get bonus rewards!\n\n` +
            `👇 Click the button to open the app:`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: isArabic ? '🚀 فتح التطبيق' : '🚀 Open App',
                  web_app: { url: `${miniAppUrl}/mini-app` }
                }
              ],
              [
                { text: isArabic ? '💰 المهام' : '💰 Tasks', callback_data: 'tasks' },
                { text: isArabic ? '🎮 الألعاب' : '🎮 Games', callback_data: 'games' }
              ],
              [
                { text: isArabic ? '👥 الإحالات' : '👥 Referrals', callback_data: 'referrals' },
                { text: isArabic ? '📊 الإحصائيات' : '📊 Stats', callback_data: 'stats' }
              ]
            ]
          }
        }
      );

      // Send verification task if applicable
      await sendVerificationTask(ctx, user.id);
    } else {
      await ctx.reply(
        isArabic
          ? `👋 مرحباً بعودتك ${firstName}!\n\n` +
            `💰 رصيدك الحالي: ${user.balance.toString()} عملة\n\n` +
            `👇 اضغط على الزر لفتح التطبيق:`
          : `👋 Welcome back ${firstName}!\n\n` +
            `💰 Your current balance: ${user.balance.toString()} coins\n\n` +
            `👇 Click the button to open the app:`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: isArabic ? '🚀 فتح التطبيق' : '🚀 Open App',
                  web_app: { url: `${miniAppUrl}/mini-app` }
                }
              ],
              [
                { text: isArabic ? '💰 المهام' : '💰 Tasks', callback_data: 'tasks' },
                { text: isArabic ? '🎮 الألعاب' : '🎮 Games', callback_data: 'games' }
              ],
              [
                { text: isArabic ? '👥 الإحالات' : '👥 Referrals', callback_data: 'referrals' },
                { text: isArabic ? '📊 الإحصائيات' : '📊 Stats', callback_data: 'stats' }
              ]
            ]
          }
        }
      );
    }
  } catch (error) {
    logger.error({ err: error }, 'Start handler error:');
    await ctx.reply('An error occurred during registration. Please try again.');
  }
}

async function processReferralRewards(
  ctx: BotContext,
  referrerId: string,
  referredId: string
) {
  try {
    // Level 1: Direct referral
    const level1Reward = Number(config.referralSignupBonus);
    
    // Update referrer balance
    await ctx.prisma.user.update({
      where: { id: referrerId },
      data: {
        balance: { increment: level1Reward },
        referralCount: { increment: 1 },
      },
    });

    // Create referral record
    await ctx.prisma.referral.create({
      data: {
        referrerId,
        referredId,
        level: 1,
        commission: level1Reward,
      },
    });

    // Update referral tree
    await ctx.prisma.referralTree.upsert({
      where: { userId: referrerId },
      create: {
        userId: referrerId,
        level1Count: 1,
        level1Earnings: level1Reward,
        totalReferralEarnings: level1Reward,
      },
      update: {
        level1Count: { increment: 1 },
        level1Earnings: { increment: level1Reward },
        totalReferralEarnings: { increment: level1Reward },
      },
    });

    // Create reward ledger entry
    await ctx.prisma.rewardLedger.create({
      data: {
        userId: referrerId,
        type: 'REFERRAL_BONUS',
        amount: level1Reward,
        description: 'Level 1 referral bonus',
        balanceBefore: 0, // Should fetch actual balance
        balanceAfter: level1Reward,
      },
    });

    // Send notification to referrer
    const referrer = await ctx.prisma.user.findUnique({
      where: { id: referrerId },
    });

    if (referrer) {
      try {
        await ctx.telegram.sendMessage(
          Number(referrer.telegramId),
          `🎉 Congratulations! You earned ${level1Reward.toString()} coins from a new referral!`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '👥 View Referrals', callback_data: 'referrals' }],
              ],
            },
          }
        );
      } catch (error) {
        logger.error({ err: error }, 'Failed to send referral notification:');
      }
    }

    // Process Level 2 and Level 3 referrals
    const level1Referrer = await ctx.prisma.user.findUnique({
      where: { id: referrerId },
      select: { referredById: true },
    });

    if (level1Referrer?.referredById) {
      // Level 2
      const level2Reward = Number(config.referralLevel2Reward);
      
      await ctx.prisma.user.update({
        where: { id: level1Referrer.referredById },
        data: { 
          balance: { increment: level2Reward }
        },
      });

      await ctx.prisma.referral.create({
        data: {
          referrerId: level1Referrer.referredById,
          referredId,
          level: 2,
          commission: level2Reward,
        },
      });

      await ctx.prisma.referralTree.upsert({
        where: { userId: level1Referrer.referredById },
        create: {
          userId: level1Referrer.referredById,
          level2Count: 1,
          level2Earnings: level2Reward,
          totalReferralEarnings: level2Reward,
        },
        update: {
          level2Count: { increment: 1 },
          level2Earnings: { increment: level2Reward },
          totalReferralEarnings: { increment: level2Reward },
        },
      });

      // Level 3
      const level2Referrer = await ctx.prisma.user.findUnique({
        where: { id: level1Referrer.referredById },
        select: { referredById: true },
      });

      if (level2Referrer?.referredById) {
        const level3Reward = Number(config.referralLevel3Reward);
        
          await ctx.prisma.user.update({
            where: { id: level2Referrer.referredById },
            data: { 
              balance: { increment: level3Reward }
            },
          });

        await ctx.prisma.referral.create({
          data: {
            referrerId: level2Referrer.referredById,
            referredId,
            level: 3,
            commission: level3Reward,
          },
        });

        await ctx.prisma.referralTree.upsert({
          where: { userId: level2Referrer.referredById },
          create: {
            userId: level2Referrer.referredById,
            level3Count: 1,
            level3Earnings: level3Reward,
            totalReferralEarnings: level3Reward,
          },
          update: {
            level3Count: { increment: 1 },
            level3Earnings: { increment: level3Reward },
            totalReferralEarnings: { increment: level3Reward },
          },
        });
      }
    }

    logger.info(`Processed referral rewards for referrer: ${referrerId}`);
  } catch (error) {
    logger.error({ err: error }, 'Process referral rewards error:');
  }
}

async function sendVerificationTask(ctx: BotContext, userId: string) {
  // Check if there are verification tasks (e.g., joining main channel)
  const verificationTasks = await ctx.prisma.task.findMany({
    where: {
      category: 'CHANNEL_SUBSCRIPTION',
      isActive: true,
      requirement: { contains: 'verification' },
    },
    take: 1,
  });

  if (verificationTasks.length > 0) {
    const task = verificationTasks[0];
    
    await ctx.reply(
      `📢 To start earning, please join our main channel first:`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📢 Join Channel', url: `https://t.me/${task.channelUsername}` }],
            [{ text: '✅ I Joined', callback_data: `task_verify_${task.id}` }],
          ],
        },
      }
    );
  }
}

function getMainKeyboard(isArabic: boolean) {
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
  ]);
}
