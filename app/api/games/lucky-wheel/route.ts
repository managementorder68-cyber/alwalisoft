import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let prisma: PrismaClient | null = null;
  
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'معرف المستخدم مطلوب'
      }, { status: 400 });
    }

    prisma = new PrismaClient();

    // Find user
    const user = await prisma.user.findUnique({
      where: { telegramId: String(userId) }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'المستخدم غير موجود'
      }, { status: 404 });
    }

    // Check daily play limit (example: 5 plays per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPlays = await prisma.rewardLedger.count({
      where: {
        userId: user.id,
        type: 'GAME_WIN',
        description: { contains: 'Lucky Wheel' },
        createdAt: { gte: today }
      }
    });

    if (todayPlays >= 5) {
      return NextResponse.json({
        success: false,
        message: 'لقد وصلت للحد الأقصى من اللعب اليوم (5 مرات)'
      }, { status: 429 });
    }

    // Generate random reward (100-10000 coins)
    const possibleRewards = [100, 200, 500, 1000, 2000, 5000, 10000];
    const reward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];

    // Update user balance
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: { increment: reward }
      }
    });

    // Create reward ledger record
    await prisma.rewardLedger.create({
      data: {
        userId: user.id,
        type: 'GAME_WIN',
        amount: reward,
        description: `Lucky Wheel reward: ${reward} coins`,
        balanceBefore: user.balance,
        balanceAfter: user.balance + reward
      }
    });

    return NextResponse.json({
      success: true,
      reward,
      newBalance: updatedUser.balance,
      playsRemaining: 5 - todayPlays - 1,
      message: 'تم اللعب بنجاح!'
    });
  } catch (error: any) {
    console.error('Error in lucky wheel game:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'حدث خطأ أثناء اللعب'
    }, { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
