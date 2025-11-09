import { NextRequest, NextResponse } from 'next/server';
import { adManager } from '@/lib/ad-manager';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing userId'
      }, { status: 400 });
    }

    // الحصول على إحصائيات المستخدم
    const stats = await adManager.getUserAdStats(userId);
    
    // الحد الأقصى اليومي (من المتغيرات البيئية أو القيمة الافتراضية)
    const dailyLimit = parseInt(process.env.NEXT_PUBLIC_AD_DAILY_LIMIT || '10');
    
    // حساب المتبقي اليوم
    const remainingToday = Math.max(0, dailyLimit - stats.todayCount);

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        dailyLimit,
        remainingToday
      }
    });
  } catch (error) {
    console.error('Error getting ad stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
