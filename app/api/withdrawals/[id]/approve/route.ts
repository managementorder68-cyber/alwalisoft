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

    const { txHash, notes } = await request.json();
    const { id: withdrawalId } = await params;

    if (!txHash) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Transaction hash is required'
      }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Withdrawal not found'
      }, { status: 404 });
    }

    if (withdrawal.status !== 'PENDING') {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Withdrawal is not pending'
      }, { status: 400 });
    }

    // Update withdrawal and wallet
    const updated = await prisma.$transaction(async (tx) => {
      // Update withdrawal
      const updatedWithdrawal = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'COMPLETED',
          txHash,
          processorNotes: notes,
          completedAt: new Date(),
        },
      });

      // Update wallet
      await tx.wallet.update({
        where: { userId: withdrawal.userId },
        data: {
          lockedBalance: { decrement: withdrawal.amount },
          totalWithdrawn: { increment: withdrawal.amount },
        },
      });

      // Update user statistics
      await tx.userStatistics.update({
        where: { userId: withdrawal.userId },
        data: {
          totalWithdrawals: { increment: withdrawal.amount },
        },
      });

      return updatedWithdrawal;
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Withdrawal approved successfully'
    });
  } catch (error) {
    console.error('POST /api/withdrawals/[id]/approve error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
