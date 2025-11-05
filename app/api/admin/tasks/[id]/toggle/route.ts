import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { handleApiError } from '@/lib/error-handler';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let prisma: PrismaClient | null = null;

  try {
    const { id } = params;
    const body = await req.json();
    const { isActive } = body;

    if (isActive === undefined) {
      return NextResponse.json({
        success: false,
        message: 'isActive is required'
      }, { status: 400 });
    }

    prisma = new PrismaClient();

    const task = await prisma.task.update({
      where: { id },
      data: { isActive }
    });

    return NextResponse.json({
      success: true,
      data: task,
      message: `تم ${isActive ? 'تفعيل' : 'إيقاف'} المهمة بنجاح`
    });
  } catch (error: any) {
    return handleApiError(error);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
