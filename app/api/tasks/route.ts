import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const active = searchParams.get('active');
    const level = searchParams.get('level');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    console.log('📋 GET /api/tasks - userId:', userId);

    const where: any = {};
    
    if (category) where.category = category;
    if (type) where.type = type;
    if (active !== null) where.isActive = active === 'true';
    if (level) where.minLevel = level;

    // Only active and not expired tasks
    if (active !== 'false') {
      where.isActive = true;
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isFeatured: 'desc' },
          { priority: 'desc' },
          { reward: 'desc' },
        ],
      }),
      prisma.task.count({ where }),
    ]);

    // إضافة حالة isCompleted لكل مهمة
    let tasksWithCompletion = tasks;
    
    if (userId) {
      console.log('🔍 Checking completion status for userId:', userId);
      
      // جلب جميع المهام المكتملة للمستخدم
      const completedTasks = await prisma.taskCompletion.findMany({
        where: { userId },
        select: { taskId: true }
      });
      
      const completedTaskIds = new Set(completedTasks.map(tc => tc.taskId));
      console.log('✅ Completed task IDs:', Array.from(completedTaskIds));
      
      // إضافة isCompleted لكل مهمة
      tasksWithCompletion = tasks.map(task => ({
        ...task,
        isCompleted: completedTaskIds.has(task.id)
      })) as any;
      
      console.log('📊 Tasks with completion:', tasksWithCompletion.map((t: any) => ({ 
        id: t.id, 
        name: t.name, 
        isCompleted: t.isCompleted 
      })));
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: {
        tasks: tasksWithCompletion,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    });
  } catch (error) {
    console.error('GET /api/tasks error:', error);
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
      verificationData,
      channelId,
      channelUsername,
      groupId,
      videoUrl,
      postUrl,
      isBonus,
      isFeatured,
      startsAt,
      expiresAt,
      cooldownMinutes,
      priority,
    } = body;

    // Validate required fields
    if (!name || !description || !category || !type || !reward) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        name,
        description,
        category,
        type,
        difficulty: difficulty || 'EASY',
        reward,
        bonusReward,
        minLevel: minLevel || 'BEGINNER',
        maxCompletions,
        requirement,
        verificationData,
        channelId,
        channelUsername,
        groupId,
        videoUrl,
        postUrl,
        isBonus: isBonus || false,
        isFeatured: isFeatured || false,
        startsAt: startsAt ? new Date(startsAt) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        cooldownMinutes,
        priority: priority || 0,
      },
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
