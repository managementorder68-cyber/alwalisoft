import { BotContext } from '../index';
import { Markup } from 'telegraf';
import { logger } from '../utils/logger';
import { config } from '../config';

export async function handleTasks(ctx: BotContext) {
  const callbackQuery = ctx.callbackQuery;
  const data = callbackQuery && 'data' in callbackQuery ? callbackQuery.data : '';

  try {
    if (data === 'tasks' || !data) {
      await showTaskCategories(ctx);
    } else if (data.startsWith('tasks_category_')) {
      const category = data.replace('tasks_category_', '');
      await showTasksByCategory(ctx, category);
    } else if (data.startsWith('task_view_')) {
      const taskId = data.replace('task_view_', '');
      await showTaskDetails(ctx, taskId);
    } else if (data.startsWith('task_complete_')) {
      const taskId = data.replace('task_complete_', '');
      await handleTaskCompletion(ctx, taskId);
    } else if (data.startsWith('task_verify_')) {
      const taskId = data.replace('task_verify_', '');
      await verifyTaskCompletion(ctx, taskId);
    }
  } catch (error) {
    logger.error({ err: error }, 'Tasks handler error:');
    await ctx.answerCbQuery('An error occurred. Please try again.');
  }
}

async function showTaskCategories(ctx: BotContext) {
  const isArabic = ctx.session?.language === 'ar';

  const categories = [
    { key: 'CHANNEL_SUBSCRIPTION', label: isArabic ? '📢 قنوات' : '📢 Channels', emoji: '📢' },
    { key: 'GROUP_JOIN', label: isArabic ? '👥 مجموعات' : '👥 Groups', emoji: '👥' },
    { key: 'VIDEO_WATCH', label: isArabic ? '📺 فيديوهات' : '📺 Videos', emoji: '📺' },
    { key: 'POST_INTERACTION', label: isArabic ? '👍 تفاعل' : '👍 Interactions', emoji: '👍' },
    { key: 'DAILY_LOGIN', label: isArabic ? '📅 يومية' : '📅 Daily', emoji: '📅' },
    { key: 'SPECIAL_EVENT', label: isArabic ? '⭐ خاصة' : '⭐ Special', emoji: '⭐' },
  ];

  // Get task counts per category
  const taskCounts = await ctx.prisma.task.groupBy({
    by: ['category'],
    where: { isActive: true },
    _count: true,
  });

  const countMap = new Map(taskCounts.map(t => [t.category, t._count]));

  const keyboard = categories.map(cat => {
    const count = countMap.get(cat.key as any) || 0;
    return [
      Markup.button.callback(
        `${cat.emoji} ${cat.label} (${count})`,
        `tasks_category_${cat.key}`
      ),
    ];
  });

  keyboard.push([
    Markup.button.callback(isArabic ? '🔙 القائمة الرئيسية' : '🔙 Main Menu', 'back_to_menu'),
  ]);

  await ctx.editMessageText(
    isArabic
      ? `📋 *المهام المتاحة*\n\nاختر فئة المهام التي تريد إكمالها:`
      : `📋 *Available Tasks*\n\nSelect a task category to get started:`,
    {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard },
    }
  );

  await ctx.answerCbQuery();
}

async function showTasksByCategory(ctx: BotContext, category: string) {
  const isArabic = ctx.session?.language === 'ar';
  const userId = ctx.session?.userId;

  if (!userId) {
    await ctx.answerCbQuery('Please restart the bot with /start');
    return;
  }

  // Get user data for level filtering
  const user = await ctx.prisma.user.findUnique({
    where: { id: userId },
    select: { level: true },
  });

  if (!user) {
    await ctx.answerCbQuery('User not found');
    return;
  }

  // Get tasks in category
  const tasks = await ctx.prisma.task.findMany({
    where: {
      category: category as any,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    orderBy: [
      { isFeatured: 'desc' },
      { priority: 'desc' },
      { reward: 'desc' },
    ],
    take: 10,
  });

  if (tasks.length === 0) {
    await ctx.editMessageText(
      isArabic
        ? '😔 لا توجد مهام متاحة في هذه الفئة حالياً.\n\nجرب فئة أخرى!'
        : '😔 No tasks available in this category right now.\n\nTry another category!',
      {
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback(isArabic ? '🔙 العودة' : '🔙 Back', 'tasks')],
          ],
        },
      }
    );
    await ctx.answerCbQuery();
    return;
  }

  // Check which tasks the user has completed
  const completedTaskIds = await ctx.prisma.taskCompletion.findMany({
    where: {
      userId,
      taskId: { in: tasks.map(t => t.id) },
    },
    select: { taskId: true },
  });

  const completedSet = new Set(completedTaskIds.map(c => c.taskId));

  const keyboard = tasks.map(task => {
    const isCompleted = completedSet.has(task.id);
    const icon = isCompleted ? '✅' : task.isFeatured ? '⭐' : task.isBonus ? '🎁' : '📋';
    const reward = isCompleted ? '' : `+${task.reward}`;
    
    return [
      Markup.button.callback(
        `${icon} ${task.name.substring(0, 30)} ${reward}`,
        `task_view_${task.id}`
      ),
    ];
  });

  keyboard.push([
    Markup.button.callback(isArabic ? '🔙 العودة' : '🔙 Back', 'tasks'),
  ]);

  await ctx.editMessageText(
    isArabic
      ? `📋 *${getCategoryName(category, isArabic)}*\n\nاختر مهمة لعرض التفاصيل:`
      : `📋 *${getCategoryName(category, isArabic)}*\n\nSelect a task to view details:`,
    {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard },
    }
  );

  await ctx.answerCbQuery();
}

async function showTaskDetails(ctx: BotContext, taskId: string) {
  const isArabic = ctx.session?.language === 'ar';
  const userId = ctx.session?.userId;

  if (!userId) {
    await ctx.answerCbQuery('Please restart the bot with /start');
    return;
  }

  const task = await ctx.prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    await ctx.answerCbQuery('Task not found');
    return;
  }

  // Check if user has completed this task
  const completion = await ctx.prisma.taskCompletion.findFirst({
    where: {
      userId,
      taskId: task.id,
    },
  });

  const isCompleted = !!completion;

  let message = isArabic
    ? `📋 *${task.name}*\n\n`
    : `📋 *${task.name}*\n\n`;

  message += `${task.description}\n\n`;
  message += isArabic
    ? `💰 *المكافأة:* ${task.reward} عملة\n`
    : `💰 *Reward:* ${task.reward} coins\n`;

  if (task.bonusReward) {
    message += isArabic
      ? `🎁 *مكافأة إضافية:* ${task.bonusReward} عملة\n`
      : `🎁 *Bonus Reward:* ${task.bonusReward} coins\n`;
  }

  message += isArabic
    ? `📊 *الصعوبة:* ${getDifficultyText(task.difficulty, isArabic)}\n`
    : `📊 *Difficulty:* ${getDifficultyText(task.difficulty, isArabic)}\n`;

  if (task.expiresAt) {
    const expiresIn = Math.floor((task.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60));
    message += isArabic
      ? `⏰ *تنتهي في:* ${expiresIn} ساعة\n`
      : `⏰ *Expires in:* ${expiresIn} hours\n`;
  }

  if (isCompleted) {
    message += isArabic
      ? `\n✅ *تم إكمال هذه المهمة*`
      : `\n✅ *This task is completed*`;
  }

  const keyboard = [];

  if (!isCompleted) {
    if (task.category === 'CHANNEL_SUBSCRIPTION' && task.channelUsername) {
      keyboard.push([
        Markup.button.url(
          isArabic ? '📢 انضم للقناة' : '📢 Join Channel',
          `https://t.me/${task.channelUsername}`
        ),
      ]);
    } else if (task.category === 'GROUP_JOIN' && task.groupId) {
      keyboard.push([
        Markup.button.url(
          isArabic ? '👥 انضم للمجموعة' : '👥 Join Group',
          task.groupId
        ),
      ]);
    } else if (task.category === 'VIDEO_WATCH' && task.videoUrl) {
      keyboard.push([
        Markup.button.url(
          isArabic ? '📺 شاهد الفيديو' : '📺 Watch Video',
          task.videoUrl
        ),
      ]);
    }

    keyboard.push([
      Markup.button.callback(
        isArabic ? '✅ لقد أكملت المهمة' : '✅ I Completed the Task',
        `task_complete_${task.id}`
      ),
    ]);
  }

  keyboard.push([
    Markup.button.callback(
      isArabic ? '🔙 العودة' : '🔙 Back',
      `tasks_category_${task.category}`
    ),
  ]);

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: keyboard },
  });

  await ctx.answerCbQuery();
}

async function handleTaskCompletion(ctx: BotContext, taskId: string) {
  const isArabic = ctx.session?.language === 'ar';
  const userId = ctx.session?.userId;

  if (!userId) {
    await ctx.answerCbQuery('Please restart the bot with /start');
    return;
  }

  const task = await ctx.prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    await ctx.answerCbQuery('Task not found');
    return;
  }

  // Check if already completed
  const existingCompletion = await ctx.prisma.taskCompletion.findFirst({
    where: {
      userId,
      taskId: task.id,
    },
  });

  if (existingCompletion) {
    await ctx.answerCbQuery(
      isArabic
        ? 'لقد أكملت هذه المهمة بالفعل'
        : 'You have already completed this task'
    );
    return;
  }

  // Verify task completion
  await verifyTaskCompletion(ctx, taskId);
}

async function verifyTaskCompletion(ctx: BotContext, taskId: string) {
  const isArabic = ctx.session?.language === 'ar';
  const userId = ctx.session?.userId;
  const telegramId = ctx.from?.id;

  if (!userId || !telegramId) {
    await ctx.answerCbQuery('Invalid session');
    return;
  }

  const task = await ctx.prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    await ctx.answerCbQuery('Task not found');
    return;
  }

  let verified = false;

  // Verification logic based on task type
  if (task.category === 'CHANNEL_SUBSCRIPTION' && task.channelId) {
    try {
      const member = await ctx.telegram.getChatMember(task.channelId, telegramId);
      verified = ['member', 'administrator', 'creator'].includes(member.status);
    } catch (error) {
      logger.error({ err: error }, 'Channel verification error:');
    }
  } else if (task.category === 'GROUP_JOIN' && task.groupId) {
    try {
      const member = await ctx.telegram.getChatMember(task.groupId, telegramId);
      verified = ['member', 'administrator', 'creator'].includes(member.status);
    } catch (error) {
      logger.error({ err: error }, 'Group verification error:');
    }
  } else {
    // For other types, mark as unverified (admin verification required)
    verified = false;
  }

  if (verified || task.category === 'VIDEO_WATCH') {
    // Award coins
    const reward = BigInt(task.reward + (task.bonusReward || 0));

    await ctx.prisma.$transaction([
      // Update user balance
      ctx.prisma.user.update({
        where: { id: userId },
        data: {
          balance: { increment: Number(reward) },
          tasksCompleted: { increment: 1 },
        },
      }),

      // Create task completion record
      ctx.prisma.taskCompletion.create({
        data: {
          userId,
          taskId: task.id,
          rewardAmount: Number(reward),
          verified: verified,
        },
      }),

      // Create reward ledger entry
      ctx.prisma.rewardLedger.create({
        data: {
          userId,
          type: 'TASK_COMPLETION',
          amount: Number(reward),
          description: `Completed task: ${task.name}`,
          balanceBefore: 0,
          balanceAfter: Number(reward),
        },
      }),

      // Update statistics
      ctx.prisma.userStatistics.update({
        where: { userId },
        data: {
          dailyEarnings: { increment: Number(reward) },
          weeklyEarnings: { increment: Number(reward) },
          monthlyEarnings: { increment: Number(reward) },
          totalEarnings: { increment: Number(reward) },
          lastTaskCompletedAt: new Date(),
        },
      }),
    ]);

    await ctx.answerCbQuery(
      isArabic
        ? `✅ تم! لقد حصلت على ${reward.toString()} عملة!`
        : `✅ Done! You earned ${reward.toString()} coins!`
    );

    await ctx.reply(
      isArabic
        ? `🎉 *تهانينا!*\n\nلقد أكملت المهمة: ${task.name}\n💰 المكافأة: +${reward.toString()} عملة`
        : `🎉 *Congratulations!*\n\nYou completed the task: ${task.name}\n💰 Reward: +${reward.toString()} coins`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback(isArabic ? '📋 مهام أخرى' : '📋 More Tasks', 'tasks')],
            [Markup.button.callback(isArabic ? '📊 إحصائياتي' : '📊 My Stats', 'stats')],
          ],
        },
      }
    );

    logger.info(`Task completed: ${taskId} by user ${userId}`);
  } else {
    await ctx.answerCbQuery(
      isArabic
        ? '❌ يرجى إكمال المهمة أولاً'
        : '❌ Please complete the task first'
    );
  }
}

function getCategoryName(category: string, isArabic: boolean): string {
  const names: Record<string, { en: string; ar: string }> = {
    CHANNEL_SUBSCRIPTION: { en: 'Channel Tasks', ar: 'مهام القنوات' },
    GROUP_JOIN: { en: 'Group Tasks', ar: 'مهام المجموعات' },
    VIDEO_WATCH: { en: 'Video Tasks', ar: 'مهام الفيديو' },
    POST_INTERACTION: { en: 'Interaction Tasks', ar: 'مهام التفاعل' },
    DAILY_LOGIN: { en: 'Daily Tasks', ar: 'المهام اليومية' },
    SPECIAL_EVENT: { en: 'Special Tasks', ar: 'المهام الخاصة' },
  };

  return isArabic ? names[category]?.ar || category : names[category]?.en || category;
}

function getDifficultyText(difficulty: string, isArabic: boolean): string {
  const texts: Record<string, { en: string; ar: string }> = {
    EASY: { en: 'Easy', ar: 'سهل' },
    MEDIUM: { en: 'Medium', ar: 'متوسط' },
    HARD: { en: 'Hard', ar: 'صعب' },
    EXPERT: { en: 'Expert', ar: 'خبير' },
  };

  return isArabic ? texts[difficulty]?.ar || difficulty : texts[difficulty]?.en || difficulty;
}
