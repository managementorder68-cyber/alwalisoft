import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { handleApiError, validateRequired } from '@/lib/error-handler';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let prisma: PrismaClient | null = null;

  try {
    const body = await req.json();
    
    validateRequired(body, ['name', 'description', 'reward', 'difficulty', 'category', 'type']);

    prisma = new PrismaClient();

    const task = await prisma.task.create({
      data: {
        name: body.name,
        description: body.description,
        reward: Number(body.reward),
        difficulty: body.difficulty,
        category: body.category,
        type: body.type,
        requirement: body.requirement || null,
        isActive: body.isActive !== false,
        minLevel: body.minLevel || 1,
        maxCompletions: body.maxCompletions || null
      }
    });

    return NextResponse.json({
      success: true,
      data: task,
      message: 'تم إنشاء المهمة بنجاح'
    });
  } catch (error: any) {
    return handleApiError(error);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
