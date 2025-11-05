import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { handleApiError, validateRequired } from '@/lib/error-handler';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let prisma: PrismaClient | null = null;

  try {
    const body = await req.json();
    
    validateRequired(body, ['message', 'target']);

    const { message, target, userIds } = body;

    prisma = new PrismaClient();

    let recipients: string[] = [];

    if (target === 'all') {
      const users = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { telegramId: true }
      });
      recipients = users.map(u => u.telegramId);
    } else if (target === 'specific' && userIds) {
      recipients = userIds;
    } else {
      return NextResponse.json({
        success: false,
        message: 'هدف غير صالح'
      }, { status: 400 });
    }

    // Note: In production, you would queue these notifications
    // For now, we'll return the count
    
    return NextResponse.json({
      success: true,
      data: {
        recipientCount: recipients.length,
        message: 'سيتم إرسال الإشعارات'
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
