import { NextRequest, NextResponse } from 'next/server';
import { adManager } from '@/lib/ad-manager';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const body = await request.json();
    const { userId, adType = 'REWARDED_VIDEO' } = body;

    console.log('🎬 Ad watch request:', { userId, adType });

    if (!userId) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Missing userId'
      }, { status: 400 });
    }

    // التحقق من المستخدم
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // التحقق من الحد الأقصى اليومي
    const canWatch = await adManager.canWatchAd(userId, adType);
    
    if (!canWatch) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'وصلت للحد الأقصى من الإعلانات اليوم',
        message: 'يمكنك مشاهدة المزيد غداً'
      }, { status: 429 });
    }

    // حساب المكافأة
    const reward = adManager.calculateReward(adType);
    
    console.log('💰 Calculated reward:', reward);

    // تسجيل المشاهدة في قاعدة البيانات
    await prisma.$transaction(async (tx) => {
      // 1. تسجيل مشاهدة الإعلان
      await tx.adWatch.create({
        data: {
          userId,
          adType,
          adUnitId: adManager.getAdUnitId(adType),
          reward,
          completed: true
        }
      });

      // 2. إضافة المكافأة للمحفظة
      await tx.wallet.upsert({
        where: { userId },
        update: {
          balance: { increment: reward }
        },
        create: {
          userId,
          balance: reward
        }
      });

      // 3. تحديث الإحصائيات
      await tx.userStatistics.upsert({
        where: { userId },
        update: {
          // يمكن إضافة حقل adsWatched في المستقبل
        },
        create: {
          userId
        }
      });

      // 4. إنشاء إشعار
      await tx.notification.create({
        data: {
          userId,
          type: 'REWARD_RECEIVED',
          title: 'مكافأة الإعلان',
          message: `حصلت على ${reward.toLocaleString()} عملة من مشاهدة الإعلان!`,
          data: {
            type: 'ad_reward',
            amount: reward,
            adType
          }
        }
      });
    });

    console.log('✅ Ad watch recorded successfully');

    // الحصول على الرصيد الجديد
    const updatedWallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: {
        reward,
        newBalance: updatedWallet?.balance || 0,
        message: `حصلت على ${reward.toLocaleString()} عملة!`
      }
    });
  } catch (error) {
    console.error('Error recording ad watch:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
