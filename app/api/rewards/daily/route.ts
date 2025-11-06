import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Check if user can claim daily reward
export async function GET(req: NextRequest) {
  let prisma: PrismaClient | null = null;
  
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'معرف المستخدم مطلوب'
      }, { status: 400 });
    }

    prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { telegramId: String(userId) },
      include: { statistics: true }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'المستخدم غير موجود'
      }, { status: 404 });
    }

    // Check last daily claim from DailyBonus
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastBonus = await prisma.dailyBonus.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    let canClaim = true;
    let streak = user.statistics?.currentStreak || 0;

    if (lastBonus && lastBonus.claimedAt) {
      const hoursSinceLastClaim = (now.getTime() - lastBonus.claimedAt.getTime()) / (1000 * 60 * 60);
      
      // Can only claim once per day (24 hours)
      if (hoursSinceLastClaim < 24) {
        canClaim = false;
      }
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: {
        canClaim,
        streak,
        lastClaim: lastBonus?.claimedAt
      }
    });
  } catch (error) {
    console.error('Error checking daily reward:', error);
    if (prisma) await prisma.$disconnect();
    
    return NextResponse.json({
      success: false,
      message: 'Error checking daily reward'
    }, { status: 500 });
  }
}

// Claim daily reward
export async function POST(req: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { statistics: true }
    });

    if (!user) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Check if can claim
    const now = new Date();
    const lastBonus = await prisma.dailyBonus.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    if (lastBonus && lastBonus.claimedAt) {
      const hoursSinceLastClaim = (now.getTime() - lastBonus.claimedAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastClaim < 24) {
        await prisma.$disconnect();
        return NextResponse.json({
          success: false,
          message: 'You can only claim once per day'
        }, { status: 400 });
      }
    }

    // Calculate streak and reward
    let newStreak = (user.statistics?.currentStreak || 0) + 1;
    if (lastBonus && lastBonus.claimedAt) {
      const hoursSinceLastClaim = (now.getTime() - lastBonus.claimedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastClaim > 48) {
        newStreak = 1; // Reset streak
      }
    }

    // Calculate reward based on streak (max 7 days)
    const rewards = [100, 150, 200, 300, 500, 750, 1000];
    const rewardIndex = Math.min(newStreak - 1, rewards.length - 1);
    const reward = rewards[rewardIndex];

    // Update user balance
    await prisma.user.update({
      where: { id: userId },
      data: {
        balance: { increment: reward }
      }
    });

    // Update statistics
    await prisma.userStatistics.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        currentStreak: newStreak,
        longestStreak: newStreak
      },
      update: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, user.statistics?.longestStreak || 0)
      }
    });

    // Create daily bonus record
    await prisma.dailyBonus.create({
      data: {
        userId: user.id,
        day: newStreak,
        reward,
        claimed: true,
        claimedAt: now
      }
    });

    // Create reward ledger entry
    await prisma.rewardLedger.create({
      data: {
        userId,
        type: 'DAILY_BONUS',
        amount: reward,
        description: `Daily reward - Day ${newStreak}`,
        balanceBefore: user.balance,
        balanceAfter: user.balance + reward
      }
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: {
        reward,
        newStreak,
        newBalance: user.balance + reward
      }
    });
  } catch (error) {
    console.error('Error claiming daily reward:', error);
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: false,
      message: 'Error claiming daily reward'
    }, { status: 500 });
  }
}
