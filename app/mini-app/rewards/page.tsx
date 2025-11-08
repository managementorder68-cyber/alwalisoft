'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Gift, Calendar, Coins, TrendingUp, Star, 
  Sparkles, Zap, Crown, Flame, Trophy
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { RewardedAdButton } from '@/components/rewarded-ad-button';

interface DailyReward {
  canClaim: boolean;
  nextClaimTime?: string;
  currentStreak: number;
  rewardAmount: number;
  maxReward: number;
}

interface WeeklyStats {
  tasksCompleted: number;
  gamesPlayed: number;
  referralsMade: number;
  totalEarned: number;
}

function RewardsContent() {
  const { user, refreshUser } = useAuth();
  const [dailyReward, setDailyReward] = useState<DailyReward | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    tasksCompleted: 0,
    gamesPlayed: 0,
    referralsMade: 0,
    totalEarned: 0
  });
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (user?.telegramId) {
      loadDailyReward();
      loadWeeklyStats();
    }
  }, [user]);

  const loadDailyReward = async () => {
    if (!user?.telegramId) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('🔄 Loading daily reward for user:', user.telegramId);
      const response = await fetch(`/api/rewards/daily?userId=${user.telegramId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Daily reward data:', data);
        if (data.success && data.data) {
          setDailyReward({
            canClaim: data.data.canClaim || false,
            nextClaimTime: data.data.lastClaim,
            currentStreak: data.data.streak || 0,
            rewardAmount: data.data.streak ? [100, 150, 200, 300, 500, 750, 1000][Math.min(data.data.streak - 1, 6)] : 100,
            maxReward: 1000
          });
        }
      } else {
        console.error('❌ Failed to load daily reward:', response.status);
      }
    } catch (error) {
      console.error('❌ Error loading daily reward:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyStats = async () => {
    if (!user) return;
    
    try {
      // جلب الإحصائيات من API
      const response = await fetch(`/api/users/stats?telegramId=${user.telegramId}&_t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setWeeklyStats({
            tasksCompleted: data.data.tasksCompleted || 0,
            gamesPlayed: data.data.gamesPlayed || 0,
            referralsMade: data.data.referralsCount || 0,
            totalEarned: data.data.totalEarned || 0
          });
        }
      }
    } catch (error) {
      console.error('Error loading weekly stats:', error);
    }
  };

  const claimDailyReward = async () => {
    if (!user?.id && !user?.telegramId) {
      alert('❌ الرجاء تسجيل الدخول أولاً');
      return;
    }
    
    setClaiming(true);
    try {
      // جلب userId الصحيح
      let userId = user.id;
      if (!userId && user.telegramId) {
        console.log('🔄 Getting userId from telegramId:', user.telegramId);
        const userResponse = await fetch(`/api/users?telegramId=${user.telegramId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success && userData.data?.id) {
            userId = userData.data.id;
          }
        }
      }
      
      if (!userId) {
        alert('❌ فشل التحقق من المستخدم');
        setClaiming(false);
        return;
      }
      
      console.log('🎁 Claiming daily reward for userId:', userId);
      const response = await fetch('/api/rewards/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Claim response:', data);
        if (data.success) {
          const reward = data.data?.reward || data.data?.rewardAmount || 0;
          const newStreak = data.data?.newStreak || data.data?.streak || 0;
          
          if (refreshUser) {
            await refreshUser();
          }
          await loadDailyReward();
          
          const message = `🎉 تم استلام المكافأة اليومية!\n💰 حصلت على ${reward.toLocaleString()} عملة\n🔥 سلسلة: ${newStreak} ${newStreak === 1 ? 'يوم' : 'أيام'}`;
          
          if (typeof window !== 'undefined') {
            if (window.Telegram?.WebApp) {
              window.Telegram.WebApp.showAlert(message);
            } else {
              alert(message);
            }
          }
        } else {
          const errorMsg = data.message || 'فشل استلام المكافأة';
          alert(`❌ ${errorMsg}`);
        }
      } else {
        const errorData = await response.json();
        alert(`❌ ${errorData.message || 'حدث خطأ'}`);
      }
    } catch (error) {
      console.error('❌ Error claiming reward:', error);
      alert('❌ حدث خطأ أثناء استلام المكافأة');
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('حدث خطأ. حاول مرة أخرى.');
      }
    } finally {
      setClaiming(false);
    }
  };

  const getTimeUntilNextClaim = () => {
    if (!dailyReward?.nextClaimTime) return '';
    
    const now = new Date().getTime();
    const nextClaim = new Date(dailyReward.nextClaimTime).getTime();
    const diff = nextClaim - now;

    if (diff <= 0) return 'الآن!';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours} ساعة ${minutes} دقيقة`;
  };

  const getStreakLevel = () => {
    const streak = dailyReward?.currentStreak || 0;
    if (streak >= 30) return { name: 'أسطوري', icon: <Crown className="w-6 h-6" />, color: 'text-purple-400' };
    if (streak >= 14) return { name: 'محترف', icon: <Trophy className="w-6 h-6" />, color: 'text-yellow-400' };
    if (streak >= 7) return { name: 'متقدم', icon: <Flame className="w-6 h-6" />, color: 'text-orange-400' };
    if (streak >= 3) return { name: 'مجتهد', icon: <Zap className="w-6 h-6" />, color: 'text-blue-400' };
    return { name: 'مبتدئ', icon: <Sparkles className="w-6 h-6" />, color: 'text-gray-400' };
  };

  const streakLevel = getStreakLevel();

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
            <h1 className="text-2xl font-bold">🎁 المكافآت</h1>
            <p className="text-sm text-purple-300">احصل على مكافآتك اليومية</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">جاري التحميل...</p>
          </div>
        ) : (
          <>
            {/* Daily Reward Card */}
            <Card className="bg-gradient-to-br from-yellow-600 to-orange-600 border-0 shadow-2xl mb-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
              
              <div className="p-6 relative">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <Gift className="w-20 h-20 mx-auto mb-3" />
                    {dailyReward?.canClaim && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold mb-2">المكافأة اليومية</h2>
                  <p className="text-yellow-100">لا تنسَ الحصول على عملاتك!</p>
                </div>

                {dailyReward?.canClaim ? (
                  <Button
                    onClick={claimDailyReward}
                    disabled={claiming}
                    className="w-full bg-white text-orange-600 hover:bg-gray-100 font-bold py-6 text-lg shadow-2xl hover:scale-105 transition-transform"
                  >
                    {claiming ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-600 mr-2"></div>
                        جاري الحصول على المكافأة...
                      </>
                    ) : (
                      <>
                        ✨ احصل على {dailyReward.rewardAmount} عملة
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="text-center bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-80" />
                    <p className="text-white/90 mb-2 text-lg">المكافأة التالية متاحة بعد:</p>
                    <p className="text-4xl font-bold mb-2">{getTimeUntilNextClaim()}</p>
                    <p className="text-sm text-yellow-100">ارجع غداً للحصول على مكافأتك!</p>
                  </div>
                )}

                {/* Streak Info */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-5 h-5 text-orange-400" />
                      <p className="text-sm text-yellow-100">سلسلة الأيام</p>
                    </div>
                    <p className="text-3xl font-bold">{dailyReward?.currentStreak || 0}</p>
                    <p className={`text-sm ${streakLevel.color} font-bold`}>{streakLevel.name}</p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <p className="text-sm text-yellow-100">المكافأة التالية</p>
                    </div>
                    <p className="text-3xl font-bold">
                      {Math.min(
                        (dailyReward?.rewardAmount || 500) + 50,
                        dailyReward?.maxReward || 1000
                      )}
                    </p>
                    <p className="text-sm text-yellow-100">عملة</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Watch Ad for Reward */}
            <Card className="bg-gradient-to-br from-purple-600 to-blue-600 border-0 shadow-xl mb-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              
              <div className="p-6 relative text-center">
                <div className="mb-4">
                  <Zap className="w-16 h-16 mx-auto text-yellow-400 animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold mb-2">شاهد إعلان واربح!</h3>
                <p className="text-purple-100 mb-6">
                  احصل على 500 عملة مجاناً بمشاهدة إعلان قصير
                </p>
                
                {user?.id && (
                  <RewardedAdButton
                    userId={user.id}
                    rewardAmount={500}
                    buttonText="شاهد إعلان واربح 500 عملة"
                    onRewardEarned={(amount) => {
                      refreshUser();
                      loadWeeklyStats();
                    }}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 text-lg"
                  />
                )}
                
                <p className="text-xs text-purple-200 mt-3">
                  💡 يمكنك مشاهدة حتى 10 إعلانات يومياً
                </p>
              </div>
            </Card>

            {/* Weekly Stats */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                إحصائيات هذا الأسبوع
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border-blue-500/50">
                  <div className="p-4 text-center">
                    <p className="text-3xl font-bold mb-1">{weeklyStats.tasksCompleted}</p>
                    <p className="text-sm text-blue-200">مهمة مكتملة</p>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-500/50">
                  <div className="p-4 text-center">
                    <p className="text-3xl font-bold mb-1">{weeklyStats.gamesPlayed}</p>
                    <p className="text-sm text-purple-200">لعبة ملعوبة</p>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 border-green-500/50">
                  <div className="p-4 text-center">
                    <p className="text-3xl font-bold mb-1">{weeklyStats.referralsMade}</p>
                    <p className="text-sm text-green-200">إحالة جديدة</p>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-600/30 to-orange-600/30 border-yellow-500/50">
                  <div className="p-4 text-center">
                    <p className="text-3xl font-bold mb-1">{weeklyStats.totalEarned}</p>
                    <p className="text-sm text-yellow-200">عملة مكتسبة</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Reward Tiers */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                مستويات المكافآت
              </h3>
              
              <div className="space-y-3">
                {[
                  { day: 1, coins: 500, icon: '🎁', label: 'مبتدئ' },
                  { day: 3, coins: 600, icon: '⭐', label: 'مجتهد' },
                  { day: 7, coins: 850, icon: '🔥', label: 'متقدم' },
                  { day: 14, coins: 950, icon: '🏆', label: 'محترف' },
                  { day: 30, coins: 1000, icon: '👑', label: 'أسطوري' }
                ].map((tier, index) => {
                  const isUnlocked = (dailyReward?.currentStreak || 0) >= tier.day;
                  const isCurrent = (dailyReward?.currentStreak || 0) === tier.day;
                  
                  return (
                    <Card 
                      key={index}
                      className={`${
                        isCurrent
                          ? 'bg-gradient-to-r from-yellow-600/40 to-orange-600/40 border-yellow-500 scale-105'
                          : isUnlocked
                          ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-purple-500/50'
                          : 'bg-white/5 border-white/10'
                      } backdrop-blur-md transition-all`}
                    >
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-full ${
                            isUnlocked ? 'bg-gradient-to-br from-purple-500 to-blue-500' : 'bg-white/10'
                          } flex items-center justify-center text-2xl font-bold relative`}>
                            {isUnlocked ? '✓' : tier.icon}
                            {isCurrent && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-lg">{tier.label}</p>
                            <p className="text-sm text-gray-400">
                              {tier.day} {tier.day === 1 ? 'يوم' : 'أيام'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {isUnlocked ? '✨ محقق!' : isCurrent ? '⚡ حالي' : '🔒 مغلق'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-yellow-400">{tier.coins}</p>
                          <p className="text-xs text-gray-400">عملة/يوم</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* How it Works */}
            <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50">
              <div className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-lg mb-3">كيف تعمل المكافآت؟</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>احصل على مكافأتك مرة واحدة كل 24 ساعة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>المكافأة الأساسية: 500 عملة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>+50 عملة لكل يوم متتالي (سلسلة الأيام)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>الحد الأقصى: 1000 عملة يومياً</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-400 font-bold">⚠️</span>
                        <span className="text-orange-200">إذا فاتك يوم، تبدأ السلسلة من جديد!</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-purple-600/20 rounded-lg border border-purple-500/30">
                  <p className="text-sm text-center text-purple-200">
                    💡 <span className="font-bold">نصيحة:</span> افتح البوت يومياً للحفاظ على سلسلتك وزيادة مكافآتك!
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default function RewardsPage() {
  return (
    <ProtectedRoute>
      <RewardsContent />
    </ProtectedRoute>
  );
}
