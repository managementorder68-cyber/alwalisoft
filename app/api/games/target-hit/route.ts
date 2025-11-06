import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let prisma: PrismaClient | null = null;

  try {
    const body = await req.json();
    const { userId, score, reward } = body;

    if (!userId || score === undefined || !reward) {
      return NextResponse.json({
        success: false,
        message: 'معرف المستخدم والنقاط والمكافأة مطلوبة'
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

    // Check daily play limit (10 plays per day for target hit)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPlays = await prisma.rewardLedger.count({
      where: {
        userId: user.id,
        type: 'GAME_WIN',
        description: { contains: 'Target Hit' },
        createdAt: { gte: today }
      }
    });

    if (todayPlays >= 10) {
      return NextResponse.json({
        success: false,
        message: 'لقد وصلت للحد الأقصى من اللعب اليوم (10 مرات)'
      }, { status: 429 });
    }

    // Validate reward (max 500 per game)
    const validatedReward = Math.min(reward, 500);

    // Update user balance
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: { increment: validatedReward }
      }
    });

    // Create reward ledger record
    await prisma.rewardLedger.create({
      data: {
        userId: user.id,
        type: 'GAME_WIN',
        amount: validatedReward,
        description: `Target Hit reward: ${validatedReward} coins (Score: ${score})`,
        balanceBefore: user.balance,
        balanceAfter: user.balance + validatedReward
      }
    });

    return NextResponse.json({
      success: true,
      score,
      reward: validatedReward,
      newBalance: updatedUser.balance,
      playsRemaining: 10 - todayPlays - 1,
      message: 'تم اللعب بنجاح!'
    });
  } catch (error: any) {
    console.error('Error in target hit game:', error);
    
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
