/**
 * Multi-Platform Ads Manager
 * إدارة الإعلانات من منصات متعددة مع Mediation
 */

import { prisma } from './prisma';

export type AdPlatform = 'ADMOB' | 'UNITY' | 'APPLOVIN' | 'FACEBOOK' | 'IRONSOURCE' | 'TELEGRAM';
export type AdType = 'REWARDED_VIDEO' | 'INTERSTITIAL' | 'BANNER';

export interface PlatformConfig {
  platform: AdPlatform;
  enabled: boolean;
  appId: string;
  rewardedVideoId?: string;
  interstitialId?: string;
  bannerId?: string;
  priority: number; // أعلى رقم = أولوية أعلى
  weight: number; // للتوزيع العشوائي المرجح
}

export interface AdReward {
  type: string;
  amount: number;
  platform: AdPlatform;
}

export interface MediationResult {
  platform: AdPlatform;
  adUnitId: string;
  success: boolean;
  error?: string;
}

/**
 * Multi-Platform Ad Manager Class
 * يدير عدة منصات إعلانية مع Mediation
 */
class MultiPlatformAdManager {
  private platforms: Map<AdPlatform, PlatformConfig> = new Map();
  
  constructor() {
    this.initializePlatforms();
  }
  
  /**
   * تهيئة جميع المنصات من Environment Variables
   */
  private initializePlatforms() {
    // 1. Google AdMob (أولوية عالية)
    if (process.env.NEXT_PUBLIC_ADMOB_APP_ID) {
      this.platforms.set('ADMOB', {
        platform: 'ADMOB',
        enabled: true,
        appId: process.env.NEXT_PUBLIC_ADMOB_APP_ID,
        rewardedVideoId: process.env.NEXT_PUBLIC_ADMOB_REWARDED_VIDEO_ID,
        interstitialId: process.env.NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID,
        bannerId: process.env.NEXT_PUBLIC_ADMOB_BANNER_ID,
        priority: 100,
        weight: 50
      });
    }
    
    // 2. Unity Ads (أولوية متوسطة - للألعاب)
    if (process.env.NEXT_PUBLIC_UNITY_GAME_ID) {
      this.platforms.set('UNITY', {
        platform: 'UNITY',
        enabled: true,
        appId: process.env.NEXT_PUBLIC_UNITY_GAME_ID,
        rewardedVideoId: process.env.NEXT_PUBLIC_UNITY_REWARDED_ID,
        interstitialId: process.env.NEXT_PUBLIC_UNITY_INTERSTITIAL_ID,
        priority: 80,
        weight: 30
      });
    }
    
    // 3. AppLovin (أولوية متوسطة - fallback)
    if (process.env.NEXT_PUBLIC_APPLOVIN_SDK_KEY) {
      this.platforms.set('APPLOVIN', {
        platform: 'APPLOVIN',
        enabled: true,
        appId: process.env.NEXT_PUBLIC_APPLOVIN_SDK_KEY,
        rewardedVideoId: process.env.NEXT_PUBLIC_APPLOVIN_REWARDED_ID,
        interstitialId: process.env.NEXT_PUBLIC_APPLOVIN_INTERSTITIAL_ID,
        bannerId: process.env.NEXT_PUBLIC_APPLOVIN_BANNER_ID,
        priority: 70,
        weight: 15
      });
    }
    
    // 4. Facebook Audience Network (أولوية عالية - دفع عالي)
    if (process.env.NEXT_PUBLIC_FACEBOOK_PLACEMENT_ID) {
      this.platforms.set('FACEBOOK', {
        platform: 'FACEBOOK',
        enabled: true,
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
        rewardedVideoId: process.env.NEXT_PUBLIC_FACEBOOK_REWARDED_ID,
        interstitialId: process.env.NEXT_PUBLIC_FACEBOOK_INTERSTITIAL_ID,
        bannerId: process.env.NEXT_PUBLIC_FACEBOOK_BANNER_ID,
        priority: 90,
        weight: 20
      });
    }
  }
  
  /**
   * الحصول على جميع المنصات المفعّلة مرتبة حسب الأولوية
   */
  getEnabledPlatforms(): PlatformConfig[] {
    return Array.from(this.platforms.values())
      .filter(p => p.enabled)
      .sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * الحصول على منصة معينة
   */
  getPlatform(platform: AdPlatform): PlatformConfig | undefined {
    return this.platforms.get(platform);
  }
  
  /**
   * اختيار أفضل منصة باستخدام Mediation Waterfall
   * يجرب المنصات حسب الأولوية
   */
  selectBestPlatform(adType: AdType): PlatformConfig | null {
    const enabledPlatforms = this.getEnabledPlatforms();
    
    if (enabledPlatforms.length === 0) {
      console.warn('⚠️ No ad platforms enabled');
      return null;
    }
    
    // جرب المنصات حسب الأولوية
    for (const platform of enabledPlatforms) {
      const adUnitId = this.getAdUnitId(platform, adType);
      if (adUnitId) {
        console.log(`✅ Selected platform: ${platform.platform} (priority: ${platform.priority})`);
        return platform;
      }
    }
    
    console.warn('⚠️ No suitable platform found for ad type:', adType);
    return null;
  }
  
  /**
   * اختيار منصة عشوائية مرجحة (Weighted Random)
   * للتنويع وزيادة Competition
   */
  selectRandomWeightedPlatform(adType: AdType): PlatformConfig | null {
    const enabledPlatforms = this.getEnabledPlatforms()
      .filter(p => this.getAdUnitId(p, adType));
    
    if (enabledPlatforms.length === 0) {
      return null;
    }
    
    // حساب المجموع الكلي للأوزان
    const totalWeight = enabledPlatforms.reduce((sum, p) => sum + p.weight, 0);
    
    // اختيار عشوائي مرجح
    let random = Math.random() * totalWeight;
    
    for (const platform of enabledPlatforms) {
      random -= platform.weight;
      if (random <= 0) {
        console.log(`🎲 Randomly selected platform: ${platform.platform} (weight: ${platform.weight}/${totalWeight})`);
        return platform;
      }
    }
    
    // fallback للمنصة الأولى
    return enabledPlatforms[0];
  }
  
  /**
   * الحصول على معرف الإعلان من منصة معينة
   */
  private getAdUnitId(platform: PlatformConfig, adType: AdType): string | undefined {
    switch (adType) {
      case 'REWARDED_VIDEO':
        return platform.rewardedVideoId;
      case 'INTERSTITIAL':
        return platform.interstitialId;
      case 'BANNER':
        return platform.bannerId;
      default:
        return undefined;
    }
  }
  
  /**
   * حساب المكافأة بناءً على المنصة ونوع الإعلان
   */
  calculateReward(platform: AdPlatform, adType: AdType): number {
    const baseRewards: Record<AdType, number> = {
      REWARDED_VIDEO: 500,
      INTERSTITIAL: 100,
      BANNER: 0
    };
    
    // multiplier حسب المنصة (المنصات الأعلى دفعاً تعطي مكافأة أكبر)
    const platformMultiplier: Record<AdPlatform, number> = {
      FACEBOOK: 1.2,    // أعلى دفع
      ADMOB: 1.0,       // معيار
      APPLOVIN: 0.9,
      UNITY: 0.8,       // للألعاب
      IRONSOURCE: 0.85,
      TELEGRAM: 0.7     // للقنوات فقط
    };
    
    const baseReward = baseRewards[adType];
    const multiplier = platformMultiplier[platform] || 1.0;
    
    return Math.floor(baseReward * multiplier);
  }
  
  /**
   * عرض إعلان فيديو بمكافأة مع Mediation
   */
  async showRewardedAd(
    userId: string,
    preferredPlatform?: AdPlatform
  ): Promise<AdReward | null> {
    try {
      // اختيار المنصة
      const platform = preferredPlatform 
        ? this.getPlatform(preferredPlatform)
        : this.selectBestPlatform('REWARDED_VIDEO');
      
      if (!platform) {
        console.error('❌ No platform available for rewarded ad');
        return null;
      }
      
      const reward = this.calculateReward(platform.platform, 'REWARDED_VIDEO');
      
      console.log(`🎬 Showing rewarded ad from ${platform.platform}, reward: ${reward}`);
      
      // تسجيل المشاهدة
      await this.recordAdView(
        userId,
        'REWARDED_VIDEO',
        platform.platform,
        reward
      );
      
      return {
        type: 'coins',
        amount: reward,
        platform: platform.platform
      };
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      return null;
    }
  }
  
  /**
   * تسجيل مشاهدة إعلان في قاعدة البيانات
   */
  async recordAdView(
    userId: string,
    adType: AdType,
    platform: AdPlatform,
    reward?: number
  ): Promise<void> {
    try {
      await prisma.adWatch.create({
        data: {
          userId,
          adType,
          platform, // جديد: حفظ المنصة
          adUnitId: `${platform}_${adType}`,
          reward: reward || 0,
          completed: true
        }
      });
    } catch (error) {
      console.error('Error recording ad view:', error);
    }
  }
  
  /**
   * الحصول على إحصائيات الإعلانات للمستخدم
   */
  async getUserAdStats(userId: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // عدد الإعلانات اليوم
      const todayCount = await prisma.adWatch.count({
        where: {
          userId,
          watchedAt: { gte: today }
        }
      });
      
      // إجمالي المشاهدات
      const totalCount = await prisma.adWatch.count({
        where: { userId }
      });
      
      // إجمالي المكافآت
      const totalRewards = await prisma.adWatch.aggregate({
        where: { userId },
        _sum: { reward: true }
      });
      
      // إحصائيات لكل منصة
      const platformStats = await prisma.adWatch.groupBy({
        by: ['platform'],
        where: { userId },
        _count: { platform: true },
        _sum: { reward: true }
      });
      
      return {
        todayCount,
        totalCount,
        totalRewards: totalRewards._sum.reward || 0,
        platformStats: platformStats.map(stat => ({
          platform: stat.platform as AdPlatform,
          count: stat._count.platform,
          totalReward: stat._sum.reward || 0
        }))
      };
    } catch (error) {
      console.error('Error getting user ad stats:', error);
      return {
        todayCount: 0,
        totalCount: 0,
        totalRewards: 0,
        platformStats: []
      };
    }
  }
  
  /**
   * التحقق من الحد الأقصى للإعلانات اليومية
   */
  async canWatchAd(userId: string, adType: AdType): Promise<boolean> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayCount = await prisma.adWatch.count({
        where: {
          userId,
          adType,
          watchedAt: { gte: today }
        }
      });
      
      // الحدود اليومية
      const limits: Record<AdType, number> = {
        REWARDED_VIDEO: parseInt(process.env.NEXT_PUBLIC_AD_DAILY_LIMIT || '10'),
        INTERSTITIAL: 20,
        BANNER: 999999
      };
      
      return todayCount < limits[adType];
    } catch (error) {
      console.error('Error checking ad limit:', error);
      return false;
    }
  }
  
  /**
   * الحصول على معلومات جميع المنصات (للأدمن)
   */
  getAllPlatformsInfo() {
    const platforms = Array.from(this.platforms.values());
    
    return platforms.map(p => ({
      platform: p.platform,
      enabled: p.enabled,
      priority: p.priority,
      weight: p.weight,
      hasRewardedVideo: !!p.rewardedVideoId,
      hasInterstitial: !!p.interstitialId,
      hasBanner: !!p.bannerId
    }));
  }
}

// Singleton instance
export const multiPlatformAdManager = new MultiPlatformAdManager();
