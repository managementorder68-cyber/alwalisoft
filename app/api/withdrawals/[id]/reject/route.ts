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

    const { reason, notes } = await request.json();
    const { id: withdrawalId } = await params;

    if (!reason) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Rejection reason is required'
      }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
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

    // Update withdrawal and restore balance
    const updated = await prisma.$transaction(async (tx) => {
      // Update withdrawal
      const updatedWithdrawal = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'REJECTED',
          failureReason: reason,
          processorNotes: notes,
        },
      });

      // Restore user balance
      await tx.user.update({
        where: { id: withdrawal.userId },
        data: {
          balance: { increment: withdrawal.amount },
        },
      });

      // Update wallet
      await tx.wallet.update({
        where: { userId: withdrawal.userId },
        data: {
          lockedBalance: { decrement: withdrawal.amount },
        },
      });

      return updatedWithdrawal;
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Withdrawal rejected'
    });
  } catch (error) {
    console.error('POST /api/withdrawals/[id]/reject error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
