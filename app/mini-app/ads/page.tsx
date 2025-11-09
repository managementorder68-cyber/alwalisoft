'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RewardedAdButton } from '@/components/rewarded-ad-button';
import { 
  Play, TrendingUp, Coins, Clock, Trophy, ArrowLeft, CheckCircle2, 
  Flame, Zap, Star, Gift, Target, Sparkles, Award, Lock, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';

interface AdStats {
  todayCount: number;
  totalCount: number;
  totalRewards: number;
  remainingToday: number;
  dailyLimit: number;
  streak?: number;
  multiplier?: number;
  trustScore?: number;
  platformStats?: Array<{
    platform: string;
    count: number;
    totalReward: number;
  }>;
}

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  requiredAds: number;
  completed: boolean;
  progress: number;
}

interface SpecialEvent {
  active: boolean;
  name: string;
  multiplier: number;
  endsAt?: Date;
}

function AdsContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [specialEvent, setSpecialEvent] = useState<SpecialEvent | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('AUTO');
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);
  const [adStartTime, setAdStartTime] = useState<number>(0);

  useEffect(() => {
    if (user?.id) {
      console.log('📊 Loading ads data for user:', user.id);
      loadStats();
      loadAdTasks();
    }
    // Always check for special events (not user-specific)
    checkSpecialEvents();
  }, [user]);

  const loadStats = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/ads/stats?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading ad stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdTasks = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/ads/tasks?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Error loading ad tasks:', error);
    }
  };

  const checkSpecialEvents = async () => {
    try {
      const response = await fetch('/api/ads/events');
      const data = await response.json();
      
      console.log('🎉 Special events response:', data);
      
      if (data.success && data.data) {
        if (data.data.active) {
          console.log('✅ Active event found:', data.data);
          setSpecialEvent({
            active: true,
            name: data.data.name,
            multiplier: data.data.multiplier,
            endsAt: data.data.endsAt ? new Date(data.data.endsAt) : undefined
          });
        } else {
          console.log('ℹ️ No active events');
          setSpecialEvent({ active: false, name: '', multiplier: 1 });
        }
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleAdStart = () => {
    setAdStartTime(Date.now());
  };

  const handleAdComplete = async (reward: number) => {
    if (!user?.id) return;
    
    const endTime = Date.now();
    const duration = endTime - adStartTime;
    
    try {
      // تسجيل المشاهدة مع بيانات التحقق
      const response = await fetch('/api/ads/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          adType: 'REWARDED_VIDEO',
          platform: selectedPlatform === 'AUTO' ? undefined : selectedPlatform,
          verification: {
            startTime: adStartTime,
            endTime,
            duration,
            clientFingerprint: await getClientFingerprint(),
            userAgent: navigator.userAgent
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const actualReward = data.data.reward || reward;
        const bonus = data.data.bonus || 0;
        const streak = data.data.streak || 0;
        const trustScore = data.data.trustScore || 100;
        
        let message = `✅ تم بنجاح!\n\n`;
        message += `🪙 حصلت على ${actualReward.toLocaleString()} عملة`;
        
        if (bonus > 0) {
          message += `\n🎁 مكافأة إضافية: ${bonus.toLocaleString()}`;
        }
        
        if (streak > 0) {
          message += `\n🔥 سلسلة: ${streak} أيام متتالية!`;
        }
        
        if (trustScore < 70) {
          message += `\n\n⚠️ تنبيه: درجة الثقة منخفضة (${trustScore}%)`;
          message += `\nتأكد من مشاهدة الإعلانات بالكامل`;
        }
        
        // تحديث المهام
        await checkTaskProgress();
        
        showAlert(message);
        loadStats();
        loadAdTasks();
      } else if (data.error === 'VERIFICATION_FAILED') {
        showAlert(
          '❌ فشل التحقق!\n\n' +
          data.message + '\n\n' +
          '⚠️ يرجى مشاهدة الإعلان بالكامل (15 ثانية على الأقل)'
        );
      } else {
        showAlert(`❌ ${data.error || 'فشل في تسجيل المشاهدة'}`);
      }
    } catch (error) {
      console.error('Error recording ad:', error);
      showAlert('❌ حدث خطأ. حاول مرة أخرى.');
    }
  };

  const handleAdFailed = (error: string) => {
    showAlert(`❌ فشل عرض الإعلان:\n${error}`);
  };

  const checkTaskProgress = async () => {
    if (!user?.id) return;
    
    try {
      await fetch('/api/ads/tasks/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
    } catch (error) {
      console.error('Error checking task progress:', error);
    }
  };

  const getClientFingerprint = async (): Promise<string> => {
    // إنشاء fingerprint بسيط من معلومات المتصفح
    const nav = navigator as any;
    const data = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 0,
      nav.deviceMemory || 0
    ].join('|');
    
    // Hash بسيط
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };

  const showAlert = (message: string) => {
    if (typeof window !== 'undefined') {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert(message);
      } else {
        alert(message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  const remainingToday = stats ? stats.dailyLimit - stats.todayCount : 0;
  const canWatch = remainingToday > 0;
  const currentMultiplier = specialEvent?.multiplier || stats?.multiplier || 1;
  const baseReward = 500;
  const totalReward = Math.floor(baseReward * currentMultiplier);
  const streak = stats?.streak || 0;
  const trustScore = stats?.trustScore || 100;

  const platforms = [
    { id: 'AUTO', name: 'تلقائي (أفضل)', icon: '🤖', color: 'from-blue-600 to-purple-600' },
    { id: 'ADMOB', name: 'Google AdMob', icon: '🎯', color: 'from-green-600 to-blue-600' },
    { id: 'UNITY', name: 'Unity Ads', icon: '🎮', color: 'from-purple-600 to-pink-600' },
    { id: 'FACEBOOK', name: 'Facebook', icon: '👥', color: 'from-blue-600 to-indigo-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-black/30 backdrop-blur-lg border-b border-white/10 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/mini-app">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Play className="w-7 h-7" />
                الإعلانات
              </h1>
              <p className="text-purple-300 text-sm">شاهد واحصل على عملات</p>
            </div>
            {streak > 0 && (
              <div className="bg-orange-500/20 border border-orange-500/50 rounded-full px-3 py-1 flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-bold">{streak}</span>
              </div>
            )}
            {trustScore < 70 && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-full px-3 py-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs font-bold">{trustScore}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Trust Score Warning */}
        {trustScore < 70 && (
          <Card className="bg-red-500/10 backdrop-blur-md border-red-500/30 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-300 mb-1">⚠️ تحذير: درجة ثقة منخفضة</h3>
                <p className="text-sm text-red-200">
                  درجة الثقة الخاصة بك: {trustScore}%
                </p>
                <p className="text-xs text-red-200 mt-2">
                  • شاهد الإعلانات بالكامل (15 ثانية على الأقل)<br />
                  • لا تغلق الإعلان مبكراً<br />
                  • حافظ على نمط مشاهدة طبيعي
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Special Event Banner */}
        {specialEvent?.active && (
          <Card className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-md border-yellow-500/50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-full">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {specialEvent.name}
                    <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                  </h3>
                  <p className="text-yellow-100 text-sm">
                    مكافأة مضاعفة {specialEvent.multiplier}× لفترة محدودة!
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Hero Section */}
        <Card className="bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-yellow-500/20 backdrop-blur-md border-yellow-500/30 overflow-hidden">
          <div className="p-6 text-center">
            <div className="bg-gradient-to-br from-yellow-600 to-orange-600 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center relative">
              <Coins className="w-10 h-10 text-white" />
              {currentMultiplier > 1 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  {currentMultiplier}×
                </div>
              )}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              اربح {totalReward.toLocaleString()} عملة
            </h2>
            <p className="text-yellow-100">
              لكل إعلان فيديو تشاهده بالكامل!
              {currentMultiplier > 1 && (
                <span className="block text-sm mt-1">
                  (مكافأة مضاعفة {currentMultiplier}× نشطة!)
                </span>
              )}
            </p>
          </div>
        </Card>

        {/* Ad Tasks */}
        {tasks.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              مهام الإعلانات
            </h3>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  className={`p-3 rounded-lg ${
                    task.completed 
                      ? 'bg-green-500/10 border border-green-500/30' 
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-blue-400" />
                        )}
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">{task.description}</p>
                    </div>
                    <div className="text-right ml-2">
                      <div className="bg-yellow-500/20 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        {task.reward}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all"
                        style={{ width: `${(task.progress / task.requiredAds) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold whitespace-nowrap">
                      {task.progress}/{task.requiredAds}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4 text-center hover:bg-white/10 transition-all">
            <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.todayCount || 0}</p>
            <p className="text-xs text-gray-400">اليوم</p>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4 text-center hover:bg-white/10 transition-all">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.totalCount || 0}</p>
            <p className="text-xs text-gray-400">المجموع</p>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4 text-center hover:bg-white/10 transition-all">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.totalRewards.toLocaleString() || 0}</p>
            <p className="text-xs text-gray-400">عملة</p>
          </Card>
        </div>

        {/* Watch Ad Button */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
          {canWatch ? (
            <>
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center relative">
                  <Play className="w-12 h-12 text-white ml-1" />
                  {currentMultiplier > 1 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                      +{Math.floor((currentMultiplier - 1) * 100)}%
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">جاهز للمشاهدة؟</h3>
                <p className="text-gray-300 text-sm mb-1">
                  متبقي اليوم: <span className="text-yellow-400 font-bold">{remainingToday}</span> إعلان
                </p>
                <p className="text-gray-400 text-xs">
                  الحد الأقصى: {stats?.dailyLimit} إعلان يومياً
                </p>
                {trustScore < 100 && (
                  <p className="text-orange-400 text-xs mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    درجة الثقة: {trustScore}% - شاهد الإعلان بالكامل!
                  </p>
                )}
              </div>

              <RewardedAdButton
                onAdComplete={handleAdComplete}
                onAdFailed={handleAdFailed}
                disabled={!canWatch}
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-500 hover:via-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 text-white font-bold py-6 text-lg"
              >
                <Play className="w-6 h-6 mr-2 ml-1" />
                شاهد الإعلان الآن
                {currentMultiplier > 1 && (
                  <span className="mr-2 bg-yellow-500/30 px-2 py-1 rounded text-sm">
                    {currentMultiplier}× مكافأة
                  </span>
                )}
              </RewardedAdButton>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="bg-green-500/20 border-2 border-green-500 w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-green-400">أحسنت!</h3>
              <p className="text-gray-300 mb-1">
                شاهدت <span className="text-yellow-400 font-bold">{stats?.todayCount}</span> إعلانات اليوم
              </p>
              <p className="text-gray-400 text-sm">
                عد غداً لمشاهدة المزيد والحصول على عملات!
              </p>
            </div>
          )}
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="bg-blue-500/10 backdrop-blur-md border-blue-500/30 p-4">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              نصائح للحصول على أقصى استفادة
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• شاهد الإعلان بالكامل (15-30 ثانية)</li>
              <li>• لا تغلق الإعلان مبكراً</li>
              <li>• حافظ على درجة ثقة عالية (&gt;80%)</li>
              <li>• أكمل مهام الإعلانات للحصول على مكافآت إضافية</li>
            </ul>
          </Card>

          {streak > 0 && (
            <Card className="bg-orange-500/10 backdrop-blur-md border-orange-500/30 p-4">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                سلسلتك النشطة: {streak} يوم
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 3 أيام: +50 عملة/إعلان</li>
                <li>• 7 أيام: +100 عملة/إعلان</li>
                <li>• 30 يوم: +200 عملة/إعلان</li>
              </ul>
            </Card>
          )}
        </div>

        {/* Daily Progress */}
        {stats && (
          <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4">
            <h4 className="font-bold mb-3">تقدم اليوم</h4>
            <div className="relative">
              <div className="bg-gray-700 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-500"
                  style={{ width: `${(stats.todayCount / stats.dailyLimit) * 100}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-400 mt-2">
                {stats.todayCount} / {stats.dailyLimit} إعلانات
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AdsPage() {
  return (
    <ProtectedRoute>
      <AdsContent />
    </ProtectedRoute>
  );
}
