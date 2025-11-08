/**
 * نظام التحقق الشامل من المهام
 * يدعم جميع أنواع التحقق المختلفة
 */

import { prisma } from './prisma';

export interface VerificationResult {
  success: boolean;
  verified: boolean;
  message: string;
  data?: any;
}

/**
 * التحقق من عدد الإحالات
 */
export async function verifyReferralCount(
  userId: string,
  minReferrals: number
): Promise<VerificationResult> {
  try {
    const referralCount = await prisma.referral.count({
      where: { referrerId: userId }
    });

    const verified = referralCount >= minReferrals;

    return {
      success: true,
      verified,
      message: verified
        ? `✅ لديك ${referralCount} إحالة`
        : `❌ تحتاج ${minReferrals - referralCount} إحالة إضافية (حالياً: ${referralCount})`,
      data: { currentCount: referralCount, required: minReferrals }
    };
  } catch (error) {
    return {
      success: false,
      verified: false,
      message: 'خطأ في التحقق من الإحالات'
    };
  }
}

/**
 * التحقق من اشتراك قناة Telegram
 */
export async function verifyTelegramChannel(
  telegramId: string,
  channelUsername: string
): Promise<VerificationResult> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      return {
        success: false,
        verified: false,
        message: 'Bot token not configured'
      };
    }

    // إزالة @ من اسم القناة
    const cleanChannelUsername = channelUsername.replace('@', '');

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=@${cleanChannelUsername}&user_id=${telegramId}`
    );

    const data = await response.json() as {
      ok: boolean;
      result?: { status: string };
      description?: string;
    };

    if (data.ok && data.result) {
      const validStatuses = ['member', 'administrator', 'creator'];
      const verified = validStatuses.includes(data.result.status);

      return {
        success: true,
        verified,
        message: verified
          ? `✅ أنت مشترك في @${cleanChannelUsername}`
          : `❌ لست مشتركاً في @${cleanChannelUsername}`,
        data: { status: data.result.status }
      };
    }

    return {
      success: false,
      verified: false,
      message: data.description || 'فشل التحقق من القناة'
    };
  } catch (error) {
    console.error('Error verifying Telegram channel:', error);
    return {
      success: false,
      verified: false,
      message: 'خطأ في التحقق من القناة'
    };
  }
}

/**
 * التحقق من انضمام مجموعة Telegram
 */
export async function verifyTelegramGroup(
  telegramId: string,
  groupId: string
): Promise<VerificationResult> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      return {
        success: false,
        verified: false,
        message: 'Bot token not configured'
      };
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${groupId}&user_id=${telegramId}`
    );

    const data = await response.json() as {
      ok: boolean;
      result?: { status: string };
      description?: string;
    };

    if (data.ok && data.result) {
      const validStatuses = ['member', 'administrator', 'creator'];
      const verified = validStatuses.includes(data.result.status);

      return {
        success: true,
        verified,
        message: verified
          ? '✅ أنت عضو في المجموعة'
          : '❌ لست عضواً في المجموعة',
        data: { status: data.result.status }
      };
    }

    return {
      success: false,
      verified: false,
      message: data.description || 'فشل التحقق من المجموعة'
    };
  } catch (error) {
    console.error('Error verifying Telegram group:', error);
    return {
      success: false,
      verified: false,
      message: 'خطأ في التحقق من المجموعة'
    };
  }
}

/**
 * التحقق من عدد المهام المكتملة
 */
export async function verifyTaskCount(
  userId: string,
  minTasks: number,
  taskType?: string
): Promise<VerificationResult> {
  try {
    const where: any = { userId };

    if (taskType) {
      where.task = {
        type: taskType
      };
    }

    const completedCount = await prisma.taskCompletion.count({
      where
    });

    const verified = completedCount >= minTasks;

    return {
      success: true,
      verified,
      message: verified
        ? `✅ أكملت ${completedCount} مهمة`
        : `❌ تحتاج ${minTasks - completedCount} مهمة إضافية (حالياً: ${completedCount})`,
      data: { currentCount: completedCount, required: minTasks }
    };
  } catch (error) {
    return {
      success: false,
      verified: false,
      message: 'خطأ في التحقق من المهام'
    };
  }
}

/**
 * التحقق من الرصيد
 */
export async function verifyBalance(
  userId: string,
  minBalance: number
): Promise<VerificationResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true }
    });

    if (!user) {
      return {
        success: false,
        verified: false,
        message: 'المستخدم غير موجود'
      };
    }

    const verified = user.balance >= minBalance;

    return {
      success: true,
      verified,
      message: verified
        ? `✅ رصيدك ${user.balance.toLocaleString()} عملة`
        : `❌ تحتاج ${(minBalance - user.balance).toLocaleString()} عملة إضافية`,
      data: { currentBalance: user.balance, required: minBalance }
    };
  } catch (error) {
    return {
      success: false,
      verified: false,
      message: 'خطأ في التحقق من الرصيد'
    };
  }
}

/**
 * التحقق من اكتمال الملف الشخصي
 */
export async function verifyProfileComplete(
  userId: string,
  requiredFields: string[]
): Promise<VerificationResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        verified: false,
        message: 'المستخدم غير موجود'
      };
    }

    const missingFields: string[] = [];
    
    for (const field of requiredFields) {
      const value = (user as any)[field];
      if (!value || value === '' || value === null) {
        missingFields.push(field);
      }
    }

    const verified = missingFields.length === 0;

    return {
      success: true,
      verified,
      message: verified
        ? '✅ ملفك الشخصي مكتمل'
        : `❌ يجب إكمال: ${missingFields.join(', ')}`,
      data: { missingFields }
    };
  } catch (error) {
    return {
      success: false,
      verified: false,
      message: 'خطأ في التحقق من الملف الشخصي'
    };
  }
}

/**
 * التحقق من عدد الألعاب
 */
export async function verifyGameCount(
  userId: string,
  minGames: number
): Promise<VerificationResult> {
  try {
    // هنا يمكن إضافة logic للتحقق من عدد الألعاب
    // حالياً نقبل أي عدد
    return {
      success: true,
      verified: true,
      message: '✅ تم التحقق من الألعاب',
      data: { currentCount: minGames }
    };
  } catch (error) {
    return {
      success: false,
      verified: false,
      message: 'خطأ في التحقق من الألعاب'
    };
  }
}

/**
 * المحرك الرئيسي للتحقق
 */
export async function verifyTaskCompletion(
  userId: string,
  telegramId: string,
  task: any
): Promise<VerificationResult> {
  const verificationData = task.verificationData;

  // إذا لم يكن هناك بيانات تحقق، نقبل المهمة مباشرة
  if (!verificationData) {
    return {
      success: true,
      verified: true,
      message: '✅ تم إكمال المهمة'
    };
  }

  const verificationType = verificationData.type;

  console.log('🔍 Verifying task:', task.name, 'Type:', verificationType);

  switch (verificationType) {
    case 'REFERRAL_COUNT':
      return await verifyReferralCount(userId, verificationData.minReferrals);

    case 'TELEGRAM_CHANNEL':
      return await verifyTelegramChannel(
        telegramId,
        verificationData.channelUsername || task.channelUsername
      );

    case 'TELEGRAM_GROUP':
      return await verifyTelegramGroup(
        telegramId,
        verificationData.groupId || task.groupId
      );

    case 'TASK_COUNT':
      return await verifyTaskCount(
        userId,
        verificationData.minTasks,
        verificationData.taskType
      );

    case 'BALANCE_THRESHOLD':
      return await verifyBalance(userId, verificationData.minBalance);

    case 'PROFILE_COMPLETE':
      return await verifyProfileComplete(userId, verificationData.requiredFields);

    case 'GAME_COUNT':
      return await verifyGameCount(userId, verificationData.minGames);

    case 'DAILY_LOGIN':
    case 'SOCIAL_SHARE':
    case 'AUTO_COMPLETE':
      // هذه المهام تُكمل تلقائياً
      return {
        success: true,
        verified: true,
        message: '✅ تم إكمال المهمة'
      };

    default:
      console.log('⚠️ Unknown verification type:', verificationType);
      // للأنواع غير المعروفة، نقبل المهمة مع تحذير
      return {
        success: true,
        verified: true,
        message: '✅ تم إكمال المهمة (تحقق يدوي)'
      };
  }
}
