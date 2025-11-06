import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let prisma: PrismaClient | null = null;

  try {
    const { id } = params;
    const { status } = await req.json();

    if (!['APPROVED', 'REJECTED', 'COMPLETED'].includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'حالة غير صالحة'
      }, { status: 400 });
    }

    prisma = new PrismaClient();

    const withdrawal = await prisma.withdrawal.update({
      where: { id },
      data: {
        status,
        processedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: withdrawal
    });
  } catch (error: any) {
    console.error('Error updating withdrawal:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'حدث خطأ في تحديث الطلب'
    }, { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
