/**
 * Google AdMob Integration Manager - مصحّح
 * قراءة المتغيرات من env، إدارة حدود المشاهدات اليومية، حساب المكافآت،
 * وتسجيل مشاهدات الإعلانات عبر prisma.
 *
 * ملاحظة: هذا ملف خادمي (server-side). لا يوجد هنا أي استدعاء SDK لعرض الإعلانات.
 * واجهات العرض الحقيقية تُنفذ على العميل (client) أو عبر SDK مخصص، ثم تستدعي endpoint claim.
 */
import { prisma } from './prisma';

export type AdType = 'REWARDED_VIDEO' | 'INTERSTITIAL' | 'BANNER';

export interface AdConfig {
  appId: string;
  rewardedVideoId: string;
  interstitialId: string;
  bannerId: string;
  useTestAds: boolean;
  dailyLimit: number;
  rewardAmount: number;
}

export interface AdReward {
  success: boolean;
  type: AdType;
  amount: number;
  adUnitId?: string;
  message?: string;
}

class AdManager {
  private config: AdConfig;

  constructor() {
    this.config = {
      appId: process.env.NEXT_PUBLIC_ADMOB_APP_ID || '',
      rewardedVideoId: process.env.NEXT_PUBLIC_ADMOB_REWARDED_VIDEO_ID || '',
      interstitialId: process.env.NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID || '',
      bannerId: process.env.NEXT_PUBLIC_ADMOB_BANNER_ID || '',
      useTestAds: (process.env.NEXT_PUBLIC_USE_TEST_ADS === 'true') || false,
      dailyLimit: Number(process.env.NEXT_PUBLIC_AD_DAILY_LIMIT || 10),
      rewardAmount: Number(process.env.NEXT_PUBLIC_AD_REWARD_AMOUNT || 500),
    };
  }

  getAdUnitId(adType: AdType): string {
    switch (adType) {
      case 'REWARDED_VIDEO':
        return this.config.rewardedVideoId;
      case 'INTERSTITIAL':
        return this.config.interstitialId;
      case 'BANNER':
        return this.config.bannerId;
      default:
        return '';
    }
  }

  calculateReward(adType: AdType): number {
    if (adType === 'REWARDED_VIDEO') return this.config.rewardAmount;
    if (adType === 'INTERSTITIAL') return Math.max(0, Math.floor(this.config.rewardAmount / 5)); // مثال: 1/5
    return 0;
  }

  /**
   * يتحقق إن كان المستخدم يمكنه مشاهدة إعلان من هذا النوع اليوم
   */
  async canWatchAd(userId: string, adType: AdType): Promise<boolean> {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0, 0, 0);
      // بعض المخططات تستخدم watchedAt أو createdAt؛ هنا نستخدم watchedAt إن كان موجودًا
      const count = await prisma.adWatch.count({
        where: {
          userId,
          adType,
          OR: [
            { watchedAt: { gte: startOfDay } },
            { createdAt: { gte: startOfDay } }, // fallback إذا كان الحقل مختلفاً
          ],
        },
      });
      return count < this.config.dailyLimit;
    } catch (err) {
      console.error('[AdManager] canWatchAd error', err);
      // إن حدث خطأ نفترض false آمن: لا نسمح بالمشاهدة إن لم نستطع التحقق
      return false;
    }
  }

  /**
   * يسجل مشاهدة الإعلان (adWatch)
   */
  async recordAdView(userId: string, adType: AdType, adUnitId?: string, reward = 0): Promise<void> {
    try {
      await prisma.adWatch.create({
        data: {
          userId,
          adType,
          adUnitId: adUnitId || this.getAdUnitId(adType),
          reward,
          // بعض المخططات لديها watchedAt صريح، وبعضها يعتمد على createdAt الافتراضي
          watchedAt: new Date(),
        } as any, // cast لأن بعض سكيمات prisma قد تختلف؛ هذا يضمن التجاوز الآمن
      });
    } catch (err) {
      console.error('[AdManager] recordAdView error:', err);
    }
  }

  /**
   * إعداد مشاهدة Rewarded: يتحقق إن كان مسموحاً ثم يعيد بيانات الوحدة والمبلغ.
   */
  async prepareRewardedForUser(userId: string): Promise<AdReward> {
    if (!this.config.rewardedVideoId) {
      return { success: false, type: 'REWARDED_VIDEO', amount: 0, message: 'Rewarded Ad unit not configured' };
    }

    const allowed = await this.canWatchAd(userId, 'REWARDED_VIDEO');
    if (!allowed) {
      return { success: false, type: 'REWARDED_VIDEO', amount: 0, message: 'Daily ad limit reached' };
    }

    const amount = this.calculateReward('REWARDED_VIDEO');
    return { success: true, type: 'REWARDED_VIDEO', amount, adUnitId: this.getAdUnitId('REWARDED_VIDEO') };
  }

  /**
   * عملية مُبسطة لمنح المكافأة بعد مشاهدة الإعلان.
   * هذه الدالة تُستدعى بعد التأكد من أن المستخدم حصل على EARNED_REWARD على العميل.
   */
  async grantRewardForWatch(userId: string, amount: number): Promise<{ success: boolean; message?: string }> {
    try {
      await prisma.$transaction(async (tx) => {
        // 1) تحديث رصيد المستخدم
        await tx.user.update({
          where: { id: userId },
          data: { balance: { increment: amount } },
        });

        // 2) تحديث أو إنشاء wallet
        await tx.wallet.upsert({
          where: { userId },
          create: {
            userId,
            balance: amount,
            totalEarned: amount,
            totalWithdrawn: 0,
          },
          update: {
            balance: { increment: amount },
            totalEarned: { increment: amount },
          },
        });

        // 3) محاولة إدخال سجل rewardLedger إن وجد الجدول
        try {
          await tx.rewardLedger.create({
            data: {
              userId,
              amount,
              type: 'AD_REWARD',
              description: 'Reward for watching ad',
            },
          });
        } catch (e) {
          // ليس شرطياً أن يوجد rewardLedger، لذا نتجاهل الخطأ
        }

        // 4) تسجيل مشاهدة الإعلان
        await tx.adWatch.create({
          data: {
            userId,
            adType: 'REWARDED_VIDEO',
            adUnitId: this.getAdUnitId('REWARDED_VIDEO') || undefined,
            reward: amount,
            watchedAt: new Date(),
          },
        });
      });

      return { success: true };
    } catch (err) {
      console.error('[AdManager] grantRewardForWatch error', err);
      return { success: false, message: 'server error' };
    }
  }

  /**
   * دالة مساعدة لسجل إعلان بيني (فرضياً نسجل بدون مكافأة)
   */
  async recordInterstitial(userId: string): Promise<boolean> {
    try {
      const reward = this.calculateReward('INTERSTITIAL');
      await this.recordAdView(userId, 'INTERSTITIAL', this.getAdUnitId('INTERSTITIAL'), reward);
      return true;
    } catch (err) {
      console.error('[AdManager] recordInterstitial error', err);
      return false;
    }
  }
}

export const adManager = new AdManager();
export default adManager;
