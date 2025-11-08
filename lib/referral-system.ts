/**
 * نظام الإحالات والعمولات
 * Referral System & Commission Management
 */

import { prisma } from './prisma';

/**
 * معدلات العمولة لكل مستوى
 * Commission rates per level
 */
const COMMISSION_RATES = {
  1: 0.10, // 10% من أرباح المستوى الأول
  2: 0.05, // 5% من أرباح المستوى الثاني
  3: 0.02, // 2% من أرباح المستوى الثالث
};

/**
 * مكافأة الإحالة المباشرة
 * Direct referral bonus
 */
const DIRECT_REFERRAL_BONUS = 5000;

/**
 * معالجة إحالة جديدة
 */
export async function processNewReferral(
  referrerId: string,
  referredId: string,
  referralCode: string
): Promise<{
  success: boolean;
  message: string;
  reward?: number;
}> {
  try {
    // التحقق من أن المستخدمين موجودان
    const [referrer, referred] = await Promise.all([
      prisma.user.findUnique({ where: { id: referrerId } }),
      prisma.user.findUnique({ where: { id: referredId } })
    ]);

    if (!referrer || !referred) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // التحقق من عدم وجود إحالة سابقة
    const existingReferral = await prisma.referral.findFirst({
      where: {
        referredId,
        referrerId
      }
    });

    if (existingReferral) {
      return {
        success: false,
        message: 'Referral already exists'
      };
    }

    // إنشاء الإحالة ومنح المكافأة
    await prisma.$transaction(async (tx) => {
      // إنشاء سجل الإحالة
      await tx.referral.create({
        data: {
          referrerId,
          referredId,
          level: 1,
          commission: DIRECT_REFERRAL_BONUS
        }
      });

      // تحديث رصيد المُحيل
      await tx.user.update({
        where: { id: referrerId },
        data: {
          balance: { increment: DIRECT_REFERRAL_BONUS }
        }
      });

      // تحديث wallet
      await tx.wallet.update({
        where: { userId: referrerId },
        data: {
          balance: { increment: DIRECT_REFERRAL_BONUS },
          totalEarned: { increment: DIRECT_REFERRAL_BONUS }
        }
      });

      // تحديث ReferralTree
      await tx.referralTree.upsert({
        where: { userId: referrerId },
        create: {
          userId: referrerId,
          level1Count: 1,
          level2Count: 0,
          level3Count: 0,
          level1Earnings: DIRECT_REFERRAL_BONUS,
          level2Earnings: 0,
          level3Earnings: 0,
          totalReferralEarnings: DIRECT_REFERRAL_BONUS
        },
        update: {
          level1Count: { increment: 1 },
          level1Earnings: { increment: DIRECT_REFERRAL_BONUS },
          totalReferralEarnings: { increment: DIRECT_REFERRAL_BONUS }
        }
      });

      // إنشاء سجل في RewardLedger
      await tx.rewardLedger.create({
        data: {
          userId: referrerId,
          type: 'REFERRAL_BONUS',
          amount: DIRECT_REFERRAL_BONUS,
          description: `Referral bonus for ${referred.username || referred.firstName}`,
          balanceBefore: referrer.balance,
          balanceAfter: referrer.balance + DIRECT_REFERRAL_BONUS
        }
      });

      // إنشاء إشعار
      await tx.notification.create({
        data: {
          userId: referrerId,
          type: 'REFERRAL_JOINED',
          title: '🎉 إحالة جديدة!',
          message: `انضم ${referred.username || referred.firstName} عبر رابط الإحالة الخاص بك وحصلت على ${DIRECT_REFERRAL_BONUS.toLocaleString()} عملة.`,
          data: JSON.stringify({
            referredUsername: referred.username || referred.firstName,
            reward: DIRECT_REFERRAL_BONUS,
            level: 1
          })
        }
      });
    });

    return {
      success: true,
      message: 'Referral processed successfully',
      reward: DIRECT_REFERRAL_BONUS
    };

  } catch (error: any) {
    console.error('Error processing referral:', error);
    return {
      success: false,
      message: error.message || 'Failed to process referral'
    };
  }
}

/**
 * توزيع عمولات الإحالة عند إكمال مهمة
 */
export async function distributeReferralCommissions(
  userId: string,
  amount: number,
  description: string
): Promise<void> {
  try {
    // جلب المُحيل المباشر
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        referredById: true
      }
    });

    if (!user || !user.referredById) {
      return; // لا يوجد محيل
    }

    const commissions: Array<{
      userId: string;
      level: number;
      amount: number;
      username: string;
    }> = [];

    // المستوى 1 - المُحيل المباشر
    let currentReferrerId: string | null = user.referredById;
    
    for (let level = 1; level <= 3 && currentReferrerId; level++) {
      const referrer: {
        id: string;
        username: string | null;
        firstName: string | null;
        referredById: string | null;
      } | null = await prisma.user.findUnique({
        where: { id: currentReferrerId },
        select: {
          id: true,
          username: true,
          firstName: true,
          referredById: true
        }
      });

      if (!referrer) break;

      const commissionAmount = Math.floor(amount * (COMMISSION_RATES[level as 1 | 2 | 3] || 0));
      
      if (commissionAmount > 0) {
        commissions.push({
          userId: referrer.id,
          level,
          amount: commissionAmount,
          username: referrer.username || referrer.firstName || 'User'
        });
      }

      // الانتقال للمستوى التالي
      currentReferrerId = referrer.referredById;
    }

    // توزيع العمولات
    for (const commission of commissions) {
      if (commission.amount > 0) {
        await prisma.$transaction(async (tx) => {
          // تحديث رصيد المُحيل
          await tx.user.update({
            where: { id: commission.userId },
            data: {
              balance: { increment: commission.amount }
            }
          });

          // تحديث wallet
          await tx.wallet.update({
            where: { userId: commission.userId },
            data: {
              balance: { increment: commission.amount },
              totalEarned: { increment: commission.amount }
            }
          });

          // تحديث ReferralTree
          const updateData: any = {
            totalReferralEarnings: { increment: commission.amount }
          };
          
          if (commission.level === 1) {
            updateData.level1Earnings = { increment: commission.amount };
          } else if (commission.level === 2) {
            updateData.level2Earnings = { increment: commission.amount };
          } else if (commission.level === 3) {
            updateData.level3Earnings = { increment: commission.amount };
          }
          
          await tx.referralTree.update({
            where: { userId: commission.userId },
            data: updateData
          });

          // إنشاء سجل في RewardLedger
          const referrer = await tx.user.findUnique({ where: { id: commission.userId } });
          
          await tx.rewardLedger.create({
            data: {
              userId: commission.userId,
              type: 'REFERRAL_BONUS',
              amount: commission.amount,
              description: `Level ${commission.level} commission: ${description}`,
              balanceBefore: referrer?.balance || 0,
              balanceAfter: (referrer?.balance || 0) + commission.amount
            }
          });

          // إنشاء إشعار
          await tx.notification.create({
            data: {
              userId: commission.userId,
              type: 'REFERRAL_JOINED',
              title: `💰 عمولة المستوى ${commission.level}`,
              message: `حصلت على ${commission.amount.toLocaleString()} عملة كعمولة من نشاط ${user.username || user.firstName}`,
              data: JSON.stringify({
                level: commission.level,
                amount: commission.amount,
                fromUser: user.username || user.firstName,
                description
              })
            }
          });
        });
      }
    }

  } catch (error) {
    console.error('Error distributing referral commissions:', error);
  }
}

/**
 * حساب إجمالي أرباح الإحالة للمستخدم
 */
export async function calculateReferralStats(userId: string): Promise<{
  totalEarnings: number;
  level1Count: number;
  level2Count: number;
  level3Count: number;
  totalCommission: number;
}> {
  try {
    const referralTree = await prisma.referralTree.findUnique({
      where: { userId }
    });

    if (!referralTree) {
      return {
        totalEarnings: 0,
        level1Count: 0,
        level2Count: 0,
        level3Count: 0,
        totalCommission: 0
      };
    }

    return {
      totalEarnings: referralTree.totalReferralEarnings,
      level1Count: referralTree.level1Count,
      level2Count: referralTree.level2Count,
      level3Count: referralTree.level3Count,
      totalCommission: referralTree.totalReferralEarnings
    };

  } catch (error) {
    console.error('Error calculating referral stats:', error);
    return {
      totalEarnings: 0,
      level1Count: 0,
      level2Count: 0,
      level3Count: 0,
      totalCommission: 0
    };
  }
}
