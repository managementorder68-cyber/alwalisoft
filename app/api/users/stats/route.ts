import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  let prisma: PrismaClient | null = null;

  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json({
        success: false,
        error: 'Telegram ID is required'
      }, { status: 400 });
    }

    prisma = new PrismaClient();

    // Get user
    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
      include: {
        statistics: true,
        wallet: true
      }
    });

    if (!user) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Get task completions
    const taskCompletions = await prisma.taskCompletion.count({
      where: { userId: user.id }
    });

    // Get referrals
    const referrals = await prisma.referral.count({
      where: { referrerId: user.id }
    });

    // Get game sessions
    const gameSessions = await prisma.gameSession.count({
      where: { userId: user.id }
    });

    // Get referral tree
    const referralTree = await prisma.referralTree.findUnique({
      where: { userId: user.id }
    });

    // Calculate total earned (this is approximation)
    const totalEarned = user.balance;

    // Get withdrawals
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: user.id }
    });

    const totalWithdrawn = withdrawals
      .filter(w => w.status === 'COMPLETED')
      .reduce((sum, w) => sum + w.amount, 0);

    // Calculate streaks (simplified)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get Trust Score
    let trustScore = 100;
    try {
      const { adVerification } = await import('@/lib/ad-verification');
      trustScore = await (adVerification as any).getUserTrustScore(user.id);
    } catch (error) {
      console.error('Error calculating trust score:', error);
    }

    // Count ads watched
    const adsWatched = await prisma.adWatch.count({
      where: { userId: user.id }
    });

    const stats = {
      totalEarned,
      totalWithdrawn,
      tasksCompleted: taskCompletions,
      gamesPlayed: gameSessions,
      referralsCount: referrals,
      currentStreak: user.statistics?.currentStreak || 1,
      longestStreak: user.statistics?.longestStreak || 1,
      achievementsUnlocked: 0, // TODO: implement achievements
      joinDate: user.createdAt,
      lastActive: user.lastActiveAt,
      trustScore,
      adsWatched
    };

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: stats
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    
    if (prisma) {
      await prisma.$disconnect();
    }

    return NextResponse.json({
      success: false,
      message: error.message || 'حدث خطأ في جلب الإحصائيات'
    }, { status: 500 });
  }
}
