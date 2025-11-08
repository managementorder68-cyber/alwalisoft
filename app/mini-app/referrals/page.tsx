'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Copy, Share2, ArrowLeft, Coins, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';

function ReferralsContent() {
  const { user: authUser } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    level1: 0,
    level2: 0,
    level3: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authUser?.telegramId) {
      loadAllData();
    }
  }, [authUser]);

  const loadAllData = async () => {
    if (!authUser) return;
    
    setLoading(true);
    try {
      // 1. جلب بيانات المستخدم الكاملة
      console.log('🔄 Loading user data for telegramId:', authUser.telegramId);
      const userResponse = await fetch(`/api/users?telegramId=${authUser.telegramId}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.success && userData.data) {
          console.log('✅ User data loaded:', userData.data);
          setUserData(userData.data);
          
          // 2. جلب إحصائيات الإحالات باستخدام userId الصحيح
          await loadReferralStats(userData.data.id);
        } else {
          console.error('❌ User data invalid:', userData);
        }
      } else {
        console.error('❌ Failed to load user data:', userResponse.status);
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReferralStats = async (userId: string) => {
    try {
      console.log('🔄 Loading referral stats for userId:', userId);
      const statsResponse = await fetch(`/api/referrals?userId=${userId}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('📊 Referral stats loaded:', statsData);
        
        if (statsData.success) {
          setReferrals(statsData.data.referrals || []);
          if (statsData.data.tree) {
            setStats({
              total: statsData.data.tree.level1Count + statsData.data.tree.level2Count + statsData.data.tree.level3Count,
              level1: statsData.data.tree.level1Count || 0,
              level2: statsData.data.tree.level2Count || 0,
              level3: statsData.data.tree.level3Count || 0,
              totalEarnings: statsData.data.tree.totalReferralEarnings || 0
            });
          }
        }
      } else {
        console.error('❌ Failed to load referral stats:', statsResponse.status);
      }
    } catch (error) {
      console.error('❌ Error loading referral stats:', error);
    }
  };

  const copyReferralLink = () => {
    const botUsername = 'makeittooeasy_bot';
    const referralCode = userData?.referralCode || authUser?.referralCode || 'ref_code';
    const referralLink = `https://t.me/${botUsername}?start=${referralCode}`;
    
    console.log('📋 Copying referral link:', referralLink);
    
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(referralLink);
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('تم نسخ الرابط! 📋');
      } else {
        alert('تم نسخ الرابط! 📋');
      }
    }
  };

  const shareReferralLink = () => {
    const botUsername = 'makeittooeasy_bot';
    const referralCode = userData?.referralCode || authUser?.referralCode || 'ref_code';
    const referralLink = `https://t.me/${botUsername}?start=${referralCode}`;
    const shareText = `🎁 انضم إلينا واربح المكافآت!\n\n💰 احصل على نقاط إضافية باستخدام رابط الدعوة!\n\n${referralLink}`;
    
    console.log('🔗 Sharing referral link:', referralLink);
    
    if (typeof window !== 'undefined') {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`);
      } else {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`, '_blank');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg font-bold">جارٍ تحميل بيانات الإحالات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/mini-app">
            <Button variant="ghost" size="icon" className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">الإحالات</h1>
            <p className="text-sm text-purple-300">ادعُ أصدقاءك واكسب المكافآت</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-24">
        {/* Stats Overview */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-2xl mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-blue-200 text-sm mb-1">إجمالي الأرباح</p>
                <div className="flex items-center gap-2">
                  <Coins className="w-8 h-8 text-yellow-400" />
                  <h2 className="text-3xl font-bold">{stats.totalEarnings.toLocaleString()}</h2>
                </div>
              </div>
              <Users className="w-16 h-16 text-white/20" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.level1}</p>
                <p className="text-xs text-blue-200">Level 1</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.level2}</p>
                <p className="text-xs text-blue-200">Level 2</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.level3}</p>
                <p className="text-xs text-blue-200">Level 3</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Referral Link */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-6">
          <div className="p-5">
            <h3 className="font-bold text-lg mb-3">رابط الإحالة الخاص بك</h3>
            <div className="bg-black/30 rounded-lg p-3 mb-3 font-mono text-sm break-all">
              {userData?.referralCode ? `t.me/makeittooeasy_bot?start=${userData.referralCode}` : (authUser?.referralCode ? `t.me/makeittooeasy_bot?start=${authUser.referralCode}` : 'جاري التحميل...')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={copyReferralLink}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                نسخ الرابط
              </Button>
              <Button
                onClick={shareReferralLink}
                className="bg-green-600 hover:bg-green-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                مشاركة
              </Button>
            </div>
          </div>
        </Card>

        {/* Rewards Info */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-6">
          <div className="p-5">
            <h3 className="font-bold text-lg mb-4">مكافآت الإحالة الحقيقية</h3>
            
            {/* ملاحظة توضيحية */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-300">
                💡 <strong>نظام العمولات المحسّن:</strong> مكافأة فورية + عمولة دائمة من كل نشاطات إحالاتك!
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="font-bold text-blue-400">1</span>
                  </div>
                  <div>
                    <p className="font-medium">المستوى 1 - دعوة مباشرة</p>
                    <p className="text-xs text-gray-400">عند التسجيل + 10% من نشاطاته</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-400">5,000</p>
                  <p className="text-xs text-green-400">+ 10%</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="font-bold text-purple-400">2</span>
                  </div>
                  <div>
                    <p className="font-medium">المستوى 2 - صديق الصديق</p>
                    <p className="text-xs text-gray-400">5% من نشاطات إحالات إحالاتك</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-400">5%</p>
                  <p className="text-xs text-gray-400">عمولة</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <span className="font-bold text-pink-400">3</span>
                  </div>
                  <div>
                    <p className="font-medium">المستوى 3 - الشبكة الممتدة</p>
                    <p className="text-xs text-gray-400">2% من المستوى الثالث</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-400">2%</p>
                  <p className="text-xs text-gray-400">عمولة</p>
                </div>
              </div>
            </div>

            {/* مثال حقيقي */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-400 mb-2">📊 <strong>مثال حقيقي:</strong></p>
              <p className="text-xs text-gray-300">
                إحالتك أكملت مهمة بـ <strong>1,000 عملة</strong>:<br/>
                • أنت تحصل: <strong className="text-green-400">+100 عملة</strong> (10% عمولة)<br/>
                • مُحيلك: <strong className="text-purple-400">+50 عملة</strong> (5% عمولة)<br/>
                • مُحيل مُحيلك: <strong className="text-pink-400">+20 عملة</strong> (2% عمولة)<br/>
                <span className="text-yellow-400 font-bold">✨ عمولات تلقائية فورية!</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Recent Referrals */}
        <div>
          <h3 className="text-lg font-semibold mb-4">الإحالات الأخيرة</h3>
          {referrals.length === 0 ? (
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <div className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400">لا توجد إحالات بعد</p>
                <p className="text-sm text-gray-500 mt-1">ابدأ بدعوة الأصدقاء لكسب المكافآت!</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {referrals.slice(0, 10).map((referral: any, index) => (
                <Card key={index} className="bg-white/5 backdrop-blur-md border-white/10">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{referral.referred?.username || 'مستخدم'}</p>
                        <p className="text-xs text-gray-400">المستوى {referral.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">+{referral.commission?.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">مكتسبة</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReferralsPage() {
  return (
    <ProtectedRoute>
      <ReferralsContent />
    </ProtectedRoute>
  );
}
