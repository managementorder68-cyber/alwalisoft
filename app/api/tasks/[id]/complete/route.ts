import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let prisma: any = null;
  
  try {
    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();

    const body = await request.json();
    console.log('📥 Task completion request body:', body);
    
    const { userId, verified = false } = body;
    const { id: taskId } = await params;
    
    console.log('🎯 Task ID:', taskId);
    console.log('👤 User ID:', userId);

    if (!userId || !taskId) {
      console.error('❌ Missing fields:', { userId, taskId });
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        details: { userId: !!userId, taskId: !!taskId }
      }, { status: 400 });
    }

    // Get task and user
    console.log('🔍 Fetching task and user from database...');
    const [task, user] = await Promise.all([
      prisma.task.findUnique({ where: { id: taskId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

    console.log('📊 Task found:', !!task);
    console.log('📊 User found:', !!user);

    if (!task) {
      console.error('❌ Task not found:', taskId);
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Task not found',
        taskId
      }, { status: 404 });
    }

    if (!user) {
      console.error('❌ User not found:', userId);
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'User not found',
        userId
      }, { status: 404 });
    }
    
    console.log('✅ Task:', task.name);
    console.log('✅ User:', user.username);
    console.log('📱 Telegram ID:', user.telegramId);

    // Check if already completed
    const existingCompletion = await prisma.taskCompletion.findFirst({
      where: {
        userId,
        taskId,
      },
    });

    if (existingCompletion) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Task already completed'
      }, { status: 409 });
    }

    // التحقق من المهمة باستخدام نظام التحقق الشامل
    try {
      const { verifyTaskCompletion } = await import('@/lib/task-verification-engine');
      const verificationResult = await verifyTaskCompletion(
        userId,
        user.telegramId,
        task
      );

      console.log('🔍 Verification result:', verificationResult);

      if (!verificationResult.verified) {
        await prisma.$disconnect();
        return NextResponse.json({
          success: false,
          error: verificationResult.message || 'لم تستوف شروط المهمة',
          verified: false,
          data: verificationResult.data
        }, { status: 400 });
      }
    } catch (verificationError) {
      console.error('⚠️ Verification error:', verificationError);
      // نستمر في الإكمال حتى لو فشل التحقق (fallback)
    }

    // Complete task and award coins (now Int, not BigInt)
    const reward = task.reward + (task.bonusReward || 0);
    console.log('💰 Calculated reward:', reward);

    const result = await prisma.$transaction(async (tx: any) => {
      // Update user balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: reward },
          tasksCompleted: { increment: 1 },
        },
      });

      // Create task completion
      const completion = await tx.taskCompletion.create({
        data: {
          userId,
          taskId,
          rewardAmount: reward,
          verified,
        },
      });

      // Update or create wallet (upsert)
      await tx.wallet.upsert({
        where: { userId },
        create: {
          userId,
          balance: reward,
          totalEarned: reward,
          totalWithdrawn: 0
        },
        update: {
          balance: { increment: reward },
          totalEarned: { increment: reward },
        },
      });

      // Create reward ledger entry
      await tx.rewardLedger.create({
        data: {
          userId,
          type: 'TASK_COMPLETION',
          amount: reward,
          description: `Completed task: ${task.name}`,
          balanceBefore: user.balance,
          balanceAfter: user.balance + reward,
        },
      });

      // Update or create statistics (upsert)
      await tx.userStatistics.upsert({
        where: { userId },
        create: {
          userId,
          dailyEarnings: reward,
          weeklyEarnings: reward,
          monthlyEarnings: reward,
          totalEarnings: reward,
          lastTaskCompletedAt: new Date(),
          currentStreak: 0,
          longestStreak: 0
        },
        update: {
          dailyEarnings: { increment: reward },
          weeklyEarnings: { increment: reward },
          monthlyEarnings: { increment: reward },
          totalEarnings: { increment: reward },
          lastTaskCompletedAt: new Date(),
        },
      });

      // Update task completions count
      await tx.task.update({
        where: { id: taskId },
        data: {
          completionsCount: { increment: 1 },
        },
      });

      return {
        completion,
        newBalance: updatedUser.balance,
        reward,
      };
    });

    // إرسال إشعار للمستخدم
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: 'REWARD_RECEIVED',
          title: '✅ مهمة مكتملة!',
          message: `تم إكمال مهمة "${task.name}" وحصلت على ${result.reward.toLocaleString()} عملة.`,
          data: JSON.stringify({
            taskId,
            taskName: task.name,
            reward: result.reward
          })
        }
      });
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // لا نفشل الطلب إذا فشل الإشعار
    }

    // توزيع عمولات الإحالة
    try {
      const { distributeReferralCommissions } = await import('@/lib/referral-system');
      await distributeReferralCommissions(
        userId,
        result.reward,
        `Task: ${task.name}`
      );
    } catch (commissionError) {
      console.error('Error distributing commissions:', commissionError);
      // لا نفشل الطلب إذا فشل توزيع العمولات
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: {
        rewardAmount: result.reward,
        newBalance: result.newBalance,
        verified,
      },
      message: 'Task completed successfully'
    });
  } catch (error) {
    console.error('❌ POST /api/tasks/[id]/complete error:', error);
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    if (prisma) {
      await prisma.$disconnect();
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
