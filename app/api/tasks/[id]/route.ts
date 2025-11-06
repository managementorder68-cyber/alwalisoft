import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let prisma: PrismaClient | null = null;

  try {
    prisma = new PrismaClient();
    const taskId = params.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Task not found'
      }, { status: 404 });
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: task
    });
  } catch (error: any) {
    console.error('Error fetching task:', error);
    
    if (prisma) {
      await prisma.$disconnect();
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let prisma: PrismaClient | null = null;

  try {
    prisma = new PrismaClient();
    const taskId = params.id;
    const body = await request.json();

    const {
      name,
      description,
      category,
      type,
      difficulty,
      reward,
      bonusReward,
      minLevel,
      maxCompletions,
      requirement,
      channelId,
      channelUsername,
      groupId,
      videoUrl,
      postUrl,
      isActive,
      isBonus,
      isFeatured,
      startsAt,
      expiresAt,
      cooldownMinutes,
      priority,
    } = body;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        name,
        description,
        category,
        type,
        difficulty,
        reward,
        bonusReward,
        minLevel,
        maxCompletions,
        requirement,
        channelId,
        channelUsername,
        groupId,
        videoUrl,
        postUrl,
        isActive,
        isBonus,
        isFeatured,
        startsAt: startsAt ? new Date(startsAt) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        cooldownMinutes,
        priority,
        updatedAt: new Date()
      }
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating task:', error);
    
    if (prisma) {
      await prisma.$disconnect();
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let prisma: PrismaClient | null = null;

  try {
    prisma = new PrismaClient();
    const taskId = params.id;

    await prisma.task.delete({
      where: { id: taskId }
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    
    if (prisma) {
      await prisma.$disconnect();
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
