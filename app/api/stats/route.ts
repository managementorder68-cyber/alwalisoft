import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get overall stats
    const [
      totalUsers,
      activeUsersToday,
      tasksCompletedToday,
      totalTasksCompleted,
      pendingWithdrawals,
      completedWithdrawals,
      totalCoinsDistributed,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          lastActiveAt: { gte: startOfDay },
        },
      }),
      prisma.taskCompletion.count({
        where: {
          completedAt: { gte: startOfDay },
        },
      }),
      prisma.taskCompletion.count(),
      prisma.withdrawal.count({
        where: { status: 'PENDING' },
      }),
      prisma.withdrawal.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.rewardLedger.aggregate({
        _sum: { amount: true },
      }),
    ]);

    // Get top users
    const topUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { balance: 'desc' },
      select: {
        id: true,
        username: true,
        firstName: true,
        balance: true,
        tasksCompleted: true,
        referralCount: true,
      },
    });

    // Get top referrers
    const topReferrerTrees = await prisma.referralTree.findMany({
      take: 10,
      orderBy: { totalReferralEarnings: 'desc' },
    });

    // Fetch user details for top referrers
    const topReferrers = await Promise.all(
      topReferrerTrees.map(async (tree) => {
        const user = await prisma.user.findUnique({
          where: { id: tree.userId },
          select: {
            username: true,
            firstName: true,
          },
        });
        return {
          ...tree,
          user,
        };
      })
    );

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsersToday,
          tasksCompletedToday,
          totalTasksCompleted,
          pendingWithdrawals,
          completedWithdrawals,
          totalCoinsDistributed: totalCoinsDistributed._sum.amount || 0,
        },
        topUsers,
        topReferrers,
      }
    });
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
