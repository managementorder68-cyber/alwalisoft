import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { handleApiError } from '@/lib/error-handler';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  let prisma: PrismaClient | null = null;

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d';

    prisma = new PrismaClient();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    // Overview stats
    const totalUsers = await prisma.user.count();
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await prisma.user.count({
      where: { lastActiveAt: { gte: sevenDaysAgo } }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await prisma.user.count({
      where: { createdAt: { gte: today } }
    });

    const totalRevenueData = await prisma.user.aggregate({
      _sum: { balance: true }
    });
    const totalRevenue = totalRevenueData._sum.balance || 0;

    // Calculate growth (mock for now - would need historical data)
    const usersGrowth = 12;
    const revenueGrowth = 15;
    const engagementGrowth = 85;

    // Top tasks
    const topTasks = await prisma.task.findMany({
      take: 5,
      orderBy: { completionsCount: 'desc' },
      select: {
        name: true,
        completionsCount: true,
        reward: true
      }
    });

    // Top users
    const topUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { balance: 'desc' },
      select: {
        username: true,
        balance: true,
        tasksCompleted: true
      }
    });

    // Daily stats (mock data - would need actual aggregation)
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const usersCount = await prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      });

      const tasksCount = await prisma.taskCompletion.count({
        where: {
          completedAt: {
            gte: date,
            lt: nextDate
          }
        }
      });

      const revenueData = await prisma.transaction.aggregate({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          },
          type: { in: ['TASK_REWARD', 'REFERRAL_REWARD', 'GAME_REWARD'] }
        },
        _sum: { amount: true }
      });

      dailyStats.push({
        date: date.toISOString(),
        users: usersCount,
        tasks: tasksCount,
        revenue: revenueData._sum.amount || 0
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          newUsersToday,
          totalRevenue
        },
        growth: {
          usersGrowth,
          revenueGrowth,
          engagementGrowth
        },
        topTasks: topTasks.map(t => ({
          name: t.name,
          completions: t.completionsCount || 0,
          reward: t.reward
        })),
        topUsers: topUsers.map(u => ({
          username: u.username,
          balance: u.balance,
          tasksCompleted: u.tasksCompleted || 0
        })),
        dailyStats
      }
    });
  } catch (error: any) {
    return handleApiError(error);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
