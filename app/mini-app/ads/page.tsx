'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, TrendingUp, Coins, Clock, Trophy, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';

interface AdStats {
  todayCount: number;
  totalCount: number;
  totalRewards: number;
  remainingToday: number;
  dailyLimit: number;
}

function AdsContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdStats | null>(null);
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    loadStats();
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

  const watchAd = async () => {
    if (!user?.id || watching) return;
    
    setWatching(true);
    
    try {
      console.log('🎬 Starting ad...');
      
      // في الإنتاج، هنا يتم عرض الإعلان الفعلي
      // للتطوير: نحاكي مشاهدة إعلان (3 ثوان)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // إرسال طلب لتسجيل المشاهدة وإضافة المكافأة
      const response = await fetch('/api/ads/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          adType: 'REWARDED_VIDEO'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const reward = data.data.reward || 500;
        
        if (typeof window !== 'undefined') {
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showAlert(
              `✅ تم بنجاح!\n🪙 حصلت على ${reward.toLocaleString()} عملة`
            );
          } else {
            alert(`✅ تم بنجاح!\n🪙 حصلت على ${reward.toLocaleString()} عملة`);
          }
        }
        
        // إعادة تحميل الإحصائيات
        loadStats();
      } else {
        const errorMsg = data.error || 'فشل في تسجيل المشاهدة';
        
        if (typeof window !== 'undefined') {
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showAlert(`❌ ${errorMsg}`);
          } else {
            alert(`❌ ${errorMsg}`);
          }
        }
      }
    } catch (error) {
      console.error('Error watching ad:', error);
      alert('❌ حدث خطأ. حاول مرة أخرى.');
    } finally {
      setWatching(false);
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Hero Section */}
        <Card className="bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-yellow-500/20 backdrop-blur-md border-yellow-500/30 overflow-hidden">
          <div className="p-6 text-center">
            <div className="bg-gradient-to-br from-yellow-600 to-orange-600 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Coins className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">اربح 500 عملة</h2>
            <p className="text-yellow-100">لكل إعلان فيديو تشاهده!</p>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4 text-center">
            <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.todayCount || 0}</p>
            <p className="text-xs text-gray-400">اليوم</p>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.totalCount || 0}</p>
            <p className="text-xs text-gray-400">المجموع</p>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4 text-center">
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
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white ml-1" />
                </div>
                <h3 className="text-xl font-bold mb-2">جاهز للمشاهدة؟</h3>
                <p className="text-gray-300 text-sm mb-1">
                  متبقي اليوم: <span className="text-yellow-400 font-bold">{remainingToday}</span> إعلان
                </p>
                <p className="text-gray-400 text-xs">
                  الحد الأقصى: {stats?.dailyLimit} إعلان يومياً
                </p>
              </div>

              <Button
                onClick={watchAd}
                disabled={watching}
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-500 hover:via-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 text-white font-bold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {watching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    جارٍ تحميل الإعلان...
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-2 ml-1" />
                    شاهد الإعلان الآن
                  </>
                )}
              </Button>
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
              كيف تربح عملات؟
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• شاهد إعلان فيديو كامل (30 ثانية)</li>
              <li>• احصل على 500 عملة فوراً</li>
              <li>• يمكنك مشاهدة {stats?.dailyLimit} إعلانات يومياً</li>
            </ul>
          </Card>

          <Card className="bg-purple-500/10 backdrop-blur-md border-purple-500/30 p-4">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-400" />
              استخدم العملات
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• اسحب رصيدك كاش حقيقي</li>
              <li>• افتح صناديق المكافآت</li>
              <li>• تنافس في لوحة المتصدرين</li>
            </ul>
          </Card>
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
