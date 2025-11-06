import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    const transactions = await prisma.rewardLedger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: false,
      message: 'Error fetching transactions'
    }, { status: 500 });
  }
}
