import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const { userId, verified = false } = await request.json();
    const { id: taskId } = await params;

    if (!userId || !taskId) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Get task and user
    const [task, user] = await Promise.all([
      prisma.task.findUnique({ where: { id: taskId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

    if (!task) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Task not found'
      }, { status: 404 });
    }

    if (!user) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

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

    // Complete task and award coins (now Int, not BigInt)
    const reward = task.reward + (task.bonusReward || 0);

    const result = await prisma.$transaction(async (tx) => {
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

      // Update wallet
      await tx.wallet.update({
        where: { userId },
        data: {
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

      // Update statistics
      await tx.userStatistics.update({
        where: { userId },
        data: {
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
    console.error('POST /api/tasks/[id]/complete error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
