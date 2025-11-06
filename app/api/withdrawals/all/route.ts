import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  let prisma: PrismaClient | null = null;

  try {
    prisma = new PrismaClient();

    const withdrawals = await prisma.withdrawal.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 100,
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            telegramId: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: withdrawals,
      count: withdrawals.length
    });
  } catch (error: any) {
    console.error('Error fetching withdrawals:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'حدث خطأ في جلب طلبات السحب'
    }, { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
