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
      where: { telegramId: String(userId) }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'المستخدم غير موجود'
      }, { status: 404 });
    }

    // Check last daily claim
    const now = new Date();
    const lastClaim = user.lastDailyReward;
    let canClaim = true;
    let streak = user.dailyStreak || 0;

    if (lastClaim) {
      const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
      
      // Can only claim once per day (24 hours)
      if (hoursSinceLastClaim < 24) {
        canClaim = false;
      }
      
      // Reset streak if more than 48 hours passed
      if (hoursSinceLastClaim > 48) {
        streak = 0;
      }
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: {
        canClaim,
        streak,
        lastClaim
      }
    });
  } catch (error) {
    console.error('Error checking daily reward:', error);
    await prisma.$disconnect();
    
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
      where: { id: userId }
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
    const lastClaim = user.lastDailyReward;
    
    if (lastClaim) {
      const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastClaim < 24) {
        await prisma.$disconnect();
        return NextResponse.json({
          success: false,
          message: 'You can only claim once per day'
        }, { status: 400 });
      }
    }

    // Calculate streak and reward
    let newStreak = (user.dailyStreak || 0) + 1;
    if (lastClaim) {
      const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastClaim > 48) {
        newStreak = 1; // Reset streak
      }
    }

    // Calculate reward based on streak (max 7 days)
    const rewards = [100, 150, 200, 300, 500, 750, 1000];
    const rewardIndex = Math.min(newStreak - 1, rewards.length - 1);
    const reward = rewards[rewardIndex];

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        balance: user.balance + reward,
        dailyStreak: newStreak,
        lastDailyReward: now
      }
    });

    // Create transaction
    await prisma.transaction.create({
      data: {
        userId,
        type: 'DAILY_BONUS',
        amount: reward,
        description: `Daily reward - Day ${newStreak}`
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
