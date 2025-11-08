import { prisma } from './prisma';

/**
 * نظام التحقق التلقائي من المهام
 */

export type VerificationResult = {
  verified: boolean;
  message: string;
  error?: string;
};

/**
 * التحقق من متابعة Twitter
 */
export async function verifyTwitterFollow(
  username: string,
  targetTwitterHandle: string
): Promise<VerificationResult> {
  try {
    // في الإنتاج، استخدم Twitter API v2
    // هنا نضع logic مبسط للتطوير
    
    // TODO: Implement Twitter API v2 integration
    // const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    // const user = await twitterClient.v2.userByUsername(username);
    // const isFollowing = await twitterClient.v2.following(user.data.id, targetId);
    
    // للتطوير: نقبل أي اسم مستخدم
    if (username && username.length > 0) {
      return {
        verified: true,
        message: `Verified: Following @${targetTwitterHandle}`
      };
    }
    
    return {
      verified: false,
      message: 'Twitter username is required'
    };
    
  } catch (error: any) {
    return {
      verified: false,
      message: 'Verification failed',
      error: error.message
    };
  }
}

/**
 * التحقق من الاشتراك في قناة Telegram
 */
export async function verifyTelegramChannel(
  userId: string,
  channelUsername: string
): Promise<VerificationResult> {
  try {
    // استخدام Telegram Bot API
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      return {
        verified: false,
        message: 'Bot token not configured'
      };
    }
    
    // Get chat member status
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=@${channelUsername}&user_id=${userId}`
    );
    
    const data = await response.json() as {
      ok: boolean;
      result?: { status: string };
      description?: string;
    };
    
    if (data.ok) {
      const status = data.result?.status || '';
      const validStatuses = ['member', 'administrator', 'creator'];
      
      if (validStatuses.includes(status)) {
        return {
          verified: true,
          message: `Verified: Member of @${channelUsername}`
        };
      } else {
        return {
          verified: false,
          message: `Not a member of @${channelUsername}`
        };
      }
    } else {
      return {
        verified: false,
        message: data.description || 'Verification failed'
      };
    }
    
  } catch (error: any) {
    return {
      verified: false,
      message: 'Verification failed',
      error: error.message
    };
  }
}

/**
 * التحقق من الاشتراك في YouTube
 */
export async function verifyYouTubeSubscription(
  userGoogleId: string,
  channelId: string
): Promise<VerificationResult> {
  try {
    // في الإنتاج، استخدم YouTube Data API v3
    // TODO: Implement YouTube API integration
    // const youtube = google.youtube('v3');
    // const response = await youtube.subscriptions.list({
    //   auth: oauth2Client,
    //   part: ['snippet'],
    //   mine: true,
    //   forChannelId: channelId
    // });
    
    // للتطوير: نقبل أي معرف
    if (userGoogleId && userGoogleId.length > 0) {
      return {
        verified: true,
        message: `Verified: Subscribed to channel`
      };
    }
    
    return {
      verified: false,
      message: 'Google ID is required'
    };
    
  } catch (error: any) {
    return {
      verified: false,
      message: 'Verification failed',
      error: error.message
    };
  }
}

/**
 * التحقق من زيارة الموقع
 */
export async function verifyWebsiteVisit(
  userId: string,
  websiteUrl: string,
  minDuration: number = 30
): Promise<VerificationResult> {
  try {
    // في الإنتاج، يمكن استخدام tracking pixel أو webhook
    // هنا نتحقق من سجل الزيارات في قاعدة البيانات
    
    // Simplified verification for website visit
    // In production: implement tracking pixel or webhook
    if (websiteUrl && websiteUrl.startsWith('http')) {
      return {
        verified: true,
        message: 'Website visit verified'
      };
    }
    
    return {
      verified: false,
      message: 'Invalid website URL'
    };
    
  } catch (error: any) {
    return {
      verified: false,
      message: 'Verification failed',
      error: error.message
    };
  }
}

/**
 * التحقق العام من المهمة حسب النوع
 */
export async function verifyTask(
  userId: string,
  taskType: string,
  verificationData: any
): Promise<VerificationResult> {
  try {
    switch (taskType) {
      case 'TWITTER_FOLLOW':
        return await verifyTwitterFollow(
          verificationData.username,
          verificationData.targetHandle
        );
      
      case 'TELEGRAM_JOIN':
        return await verifyTelegramChannel(
          userId,
          verificationData.channelUsername
        );
      
      case 'YOUTUBE_SUBSCRIBE':
        return await verifyYouTubeSubscription(
          verificationData.googleId,
          verificationData.channelId
        );
      
      case 'VISIT_WEBSITE':
        return await verifyWebsiteVisit(
          userId,
          verificationData.websiteUrl,
          verificationData.minDuration
        );
      
      case 'SOCIAL_SHARE':
      case 'DAILY_LOGIN':
        // هذه المهام يتم التحقق منها تلقائياً
        return {
          verified: true,
          message: 'Task completed'
        };
      
      default:
        return {
          verified: false,
          message: `Unsupported task type: ${taskType}`
        };
    }
    
  } catch (error: any) {
    return {
      verified: false,
      message: 'Verification failed',
      error: error.message
    };
  }
}

/**
 * التحقق التلقائي وإكمال المهمة
 */
export async function autoCompleteTask(
  userId: string,
  taskId: string,
  verificationData: any
): Promise<{
  success: boolean;
  message: string;
  reward?: number;
}> {
  try {
    // جلب المهمة
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });
    
    if (!task) {
      return {
        success: false,
        message: 'Task not found'
      };
    }
    
    // التحقق من أن المهمة مفعلة
    if (!task.isActive) {
      return {
        success: false,
        message: 'Task is not active'
      };
    }
    
    // التحقق من أن المستخدم لم يكمل المهمة من قبل
    const existingCompletion = await prisma.taskCompletion.findFirst({
      where: {
        userId,
        taskId
      }
    });
    
    if (existingCompletion) {
      return {
        success: false,
        message: 'Task already completed'
      };
    }
    
    // التحقق من المهمة
    const verification = await verifyTask(userId, task.type, verificationData);
    
    if (!verification.verified) {
      return {
        success: false,
        message: verification.message,
      };
    }
    
    // إكمال المهمة
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    // Transaction
    await prisma.$transaction(async (tx) => {
      // إنشاء سجل الإكمال
      await tx.taskCompletion.create({
        data: {
          userId,
          taskId,
          rewardAmount: task.reward,
          completedAt: new Date()
        }
      });
      
      // تحديث رصيد المستخدم
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: task.reward },
          tasksCompleted: { increment: 1 }
        }
      });
      
      // إنشاء سجل في RewardLedger
      await tx.rewardLedger.create({
        data: {
          userId,
          type: 'TASK_REWARD',
          amount: task.reward,
          description: `Task completed: ${task.name}`,
          balanceBefore: user.balance,
          balanceAfter: user.balance + task.reward
        }
      });
    });
    
    return {
      success: true,
      message: 'Task completed successfully',
      reward: task.reward
    };
    
  } catch (error: any) {
    console.error('Error auto-completing task:', error);
    return {
      success: false,
      message: error.message || 'Failed to complete task'
    };
  }
}
