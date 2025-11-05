import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestedAt: 'desc' },
        include: {
          user: {
            select: {
              username: true,
              telegramId: true,
            },
          },
        },
      }),
      prisma.withdrawal.count({ where }),
    ]);

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    });
  } catch (error) {
    console.error('GET /api/withdrawals error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const { userId, amount, walletAddress, network = 'TRC20' } = await request.json();

    if (!userId || !amount || !walletAddress) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Check balance (amount is now Int)
    const amountInt = Number(amount);
    if (user.balance < amountInt) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Insufficient balance'
      }, { status: 400 });
    }

    // Check minimum withdrawal
    const minAmount = 5000000; // 5 USDT
    if (amountInt < minAmount) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Amount is below minimum withdrawal'
      }, { status: 400 });
    }

    // Calculate USDT amount
    const usdtAmount = Number(amountInt) / 1000000;

    // Create withdrawal request
    const withdrawal = await prisma.$transaction(async (tx) => {
      // Lock balance
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: amountInt },
        },
      });

      // Update wallet
      await tx.wallet.update({
        where: { userId },
        data: {
          lockedBalance: { increment: amountInt },
        },
      });

      // Create withdrawal
      const newWithdrawal = await tx.withdrawal.create({
        data: {
          userId,
          amount: amountInt,
          usdtAmount,
          walletAddress,
          network,
          status: 'PENDING',
        },
      });

      return newWithdrawal;
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: withdrawal,
      message: 'Withdrawal request created successfully'
    });
  } catch (error) {
    console.error('POST /api/withdrawals error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
