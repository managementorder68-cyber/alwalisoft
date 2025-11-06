import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  let prisma: PrismaClient | null = null;

  try {
    prisma = new PrismaClient();

    // Get all users with their stats
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 100, // limit to 100 users for performance
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        balance: true,
        level: true,
        referralCount: true,
        tasksCompleted: true,
        status: true,
        createdAt: true,
        lastActiveAt: true,
        referralCode: true
      }
    });

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'حدث خطأ في جلب المستخدمين'
    }, { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
