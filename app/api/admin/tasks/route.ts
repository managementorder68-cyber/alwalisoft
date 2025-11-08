import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiException } from '@/lib/error-handler';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/tasks
 * إنشاء مهمة جديدة
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      reward,
      bonusReward,
      difficulty,
      category,
      type,
      isActive,
      verificationData,
      channelUsername,
      groupId,
      postUrl,
      videoUrl
    } = body;
    
    console.log('📥 Creating task with data:', body);
    
    if (!name || !description || !reward) {
      throw new ApiException('Required fields missing: name, description, reward', 400, 'MISSING_FIELDS');
    }
    
    const taskData: any = {
      name,
      description,
      reward: parseInt(reward),
      bonusReward: bonusReward ? parseInt(bonusReward) : 0,
      difficulty: difficulty || 'EASY',
      category: category || 'CHANNEL_SUBSCRIPTION',
      type: type || 'ONE_TIME',
      isActive: isActive !== undefined ? isActive : true,
      verificationData: verificationData || null,
      channelUsername: channelUsername || null,
      groupId: groupId || null,
      postUrl: postUrl || null,
      videoUrl: videoUrl || null
    };
    
    console.log('💾 Creating task:', taskData);
    
    const task = await prisma.task.create({
      data: taskData
    });
    
    console.log('✅ Task created:', task.id);
    
    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating task:', error);
    return handleApiError(error);
  }
}
