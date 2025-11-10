import { NextResponse } from 'next/server';
import { adManager } from '@/lib/ad-manager';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body?.userId;
    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId required' }, { status: 400 });
    }

    const result = await adManager.prepareRewardedForUser(userId);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message || 'not allowed' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: { amount: result.amount, adUnitId: result.adUnitId } });
  } catch (err) {
    console.error('prepare-rewarded error', err);
    return NextResponse.json({ success: false, message: 'server error' }, { status: 500 });
  }
}
