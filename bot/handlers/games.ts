import { BotContext } from '../index';
import { Markup } from 'telegraf';
import { logger } from '../utils/logger';

export async function handleGames(ctx: BotContext) {
  const callbackQuery = ctx.callbackQuery;
  const data = callbackQuery && 'data' in callbackQuery ? callbackQuery.data : '';
  const isArabic = ctx.session?.language === 'ar';

  try {
    if (data === 'games') {
      await showGamesMenu(ctx, isArabic);
    } else if (data.startsWith('game_')) {
      const gameType = data.replace('game_', '');
      await handleGameStart(ctx, gameType, isArabic);
    }

    await ctx.answerCbQuery();
  } catch (error) {
    logger.error({ err: error }, 'Games handler error:');
    await ctx.answerCbQuery('An error occurred. Please try again.');
  }
}

async function showGamesMenu(ctx: BotContext, isArabic: boolean) {
  let message = isArabic
    ? `🎮 *الألعاب المصغرة*\n\n`
    : `🎮 *Mini Games*\n\n`;

  message += isArabic
    ? `اختر لعبة واربح عملات إضافية!\n\n`
    : `Choose a game and earn extra coins!\n\n`;

  message += isArabic
    ? `🎯 *اضرب الهدف*\n`
    : `🎯 *Target Hit*\n`;
  message += isArabic
    ? `└ المكافأة: حتى 5,000 عملة\n`
    : `└ Reward: up to 5,000 coins\n`;
  message += isArabic
    ? `└ المحاولات: 3 يومياً\n\n`
    : `└ Attempts: 3 daily\n\n`;

  message += isArabic
    ? `🎡 *عجلة الحظ*\n`
    : `🎡 *Lucky Wheel*\n`;
  message += isArabic
    ? `└ المكافأة: حتى 10,000 عملة\n`
    : `└ Reward: up to 10,000 coins\n`;
  message += isArabic
    ? `└ المحاولات: 1 يومياً\n\n`
    : `└ Attempts: 1 daily\n\n`;

  message += isArabic
    ? `❓ *تحدي الأسئلة*\n`
    : `❓ *Quiz Challenge*\n`;
  message += isArabic
    ? `└ المكافأة: حتى 15,000 عملة\n`
    : `└ Reward: up to 15,000 coins\n`;
  message += isArabic
    ? `└ المحاولات: 2 يومياً\n\n`
    : `└ Attempts: 2 daily\n\n`;

  message += isArabic
    ? `🏆 *البطولة الأسبوعية*\n`
    : `🏆 *Weekly Tournament*\n`;
  message += isArabic
    ? `└ المكافأة: جوائز ضخمة\n`
    : `└ Reward: huge prizes\n`;
  message += isArabic
    ? `└ قريباً!`
    : `└ Coming soon!`;

  const keyboard = [
    [
      Markup.button.callback(isArabic ? '🎯 اضرب الهدف' : '🎯 Target Hit', 'game_target'),
      Markup.button.callback(isArabic ? '🎡 عجلة الحظ' : '🎡 Lucky Wheel', 'game_wheel'),
    ],
    [
      Markup.button.callback(isArabic ? '❓ تحدي الأسئلة' : '❓ Quiz Challenge', 'game_quiz'),
    ],
    [
      Markup.button.callback(isArabic ? '🔙 القائمة الرئيسية' : '🔙 Main Menu', 'back_to_menu'),
    ],
  ];

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: keyboard },
  });
}

async function handleGameStart(ctx: BotContext, gameType: string, isArabic: boolean) {
  const userId = ctx.session?.userId;

  if (!userId) {
    await ctx.reply('Please restart the bot with /start');
    return;
  }

  // Check daily attempts
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySessions = await ctx.prisma.gameSession.count({
    where: {
      userId,
      gameType: gameType.toUpperCase() as any,
      startedAt: { gte: today },
    },
  });

  const maxAttempts = gameType === 'wheel' ? 1 : gameType === 'quiz' ? 2 : 3;

  if (todaySessions >= maxAttempts) {
    await ctx.reply(
      isArabic
        ? `⚠️ لقد استنفذت محاولاتك اليومية لهذه اللعبة.\n\nعد غداً للعب مرة أخرى!`
        : `⚠️ You've used all your daily attempts for this game.\n\nCome back tomorrow to play again!`,
      {
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback(isArabic ? '🔙 العودة' : '🔙 Back', 'games')],
          ],
        },
      }
    );
    return;
  }

  // Game-specific logic
  if (gameType === 'target') {
    await playTargetHit(ctx, userId, isArabic);
  } else if (gameType === 'wheel') {
    await playLuckyWheel(ctx, userId, isArabic);
  } else if (gameType === 'quiz') {
    await playQuizChallenge(ctx, userId, isArabic);
  }
}

async function playTargetHit(ctx: BotContext, userId: string, isArabic: boolean) {
  // Simple random result
  const hit = Math.random() > 0.5;
  const reward = hit ? Math.floor(Math.random() * 4000) + 1000 : 0;

  // Create game session
  await ctx.prisma.gameSession.create({
    data: {
      userId,
      gameType: 'TARGET_HIT',
      status: 'COMPLETED',
      score: hit ? 1 : 0,
      reward: Number(reward),
      completedAt: new Date(),
    },
  });

  if (hit && reward > 0) {
    // Award coins
    await ctx.prisma.user.update({
      where: { id: userId },
      data: { balance: { increment: Number(reward) } },
    });

    await ctx.prisma.rewardLedger.create({
      data: {
        userId,
        type: 'GAME_WIN',
        amount: Number(reward),
        description: 'Target Hit game win',
        balanceBefore: 0,
        balanceAfter: Number(reward),
      },
    });

    await ctx.reply(
      isArabic
        ? `🎯 *هدف!*\n\nأحسنت! لقد أصبت الهدف!\n💰 المكافأة: +${reward} عملة`
        : `🎯 *Target Hit!*\n\nNice! You hit the target!\n💰 Reward: +${reward} coins`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback(isArabic ? '🎮 ألعاب أخرى' : '🎮 More Games', 'games')],
          ],
        },
      }
    );
  } else {
    await ctx.reply(
      isArabic
        ? `😔 *أخطأت الهدف!*\n\nحاول مرة أخرى!`
        : `😔 *Missed!*\n\nTry again!`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback(isArabic ? '🎮 ألعاب أخرى' : '🎮 More Games', 'games')],
          ],
        },
      }
    );
  }
}

async function playLuckyWheel(ctx: BotContext, userId: string, isArabic: boolean) {
  // Random wheel result
  const rewards = [500, 1000, 2000, 5000, 10000];
  const weights = [40, 30, 20, 8, 2]; // Probability weights
  
  const random = Math.random() * 100;
  let cumulative = 0;
  let selectedReward = rewards[0];

  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      selectedReward = rewards[i];
      break;
    }
  }

  // Create game session
  await ctx.prisma.gameSession.create({
    data: {
      userId,
      gameType: 'LUCKY_WHEEL',
      status: 'COMPLETED',
      score: selectedReward,
      reward: Number(selectedReward),
      completedAt: new Date(),
    },
  });

  // Award coins
  await ctx.prisma.user.update({
    where: { id: userId },
    data: { balance: { increment: Number(selectedReward) } },
  });

  await ctx.prisma.rewardLedger.create({
    data: {
      userId,
      type: 'GAME_WIN',
      amount: Number(selectedReward),
      description: 'Lucky Wheel game win',
      balanceBefore: 0,
      balanceAfter: Number(selectedReward),
    },
  });

  await ctx.reply(
    isArabic
      ? `🎡 *عجلة الحظ*\n\nتدور العجلة... 🎊\n\n🎉 تهانينا!\n💰 لقد فزت بـ ${selectedReward} عملة!`
      : `🎡 *Lucky Wheel*\n\nSpinning the wheel... 🎊\n\n🎉 Congratulations!\n💰 You won ${selectedReward} coins!`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [Markup.button.callback(isArabic ? '🎮 ألعاب أخرى' : '🎮 More Games', 'games')],
        ],
      },
    }
  );
}

async function playQuizChallenge(ctx: BotContext, userId: string, isArabic: boolean) {
  await ctx.reply(
    isArabic
      ? `❓ *تحدي الأسئلة*\n\nقريباً! سيتم إضافة هذه اللعبة في التحديث القادم.`
      : `❓ *Quiz Challenge*\n\nComing soon! This game will be added in the next update.`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [Markup.button.callback(isArabic ? '🔙 العودة' : '🔙 Back', 'games')],
        ],
      },
    }
  );
}
