'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Coins, 
  Users, 
  Target, 
  Gift, 
  TrendingUp,
  Zap,
  Trophy,
  Wallet,
  User as UserIcon,
  Bell,
  HelpCircle,
  Play
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function MiniAppPage() {
  const { user: authUser, loading: authLoading, login } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    balance: 0,
    tasksCompleted: 0,
    referrals: 0,
    level: 'BEGINNER'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 MiniApp useEffect - authUser:', authUser?.username, 'authLoading:', authLoading);

    // Initialize Telegram Web App
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#000000');
      tg.setBackgroundColor('#000000');
    }

    // Wait for auth to finish loading
    if (authLoading) {
      console.log('⏳ Auth still loading...');
      return;
    }

    // If not logged in, redirect to login
    if (!authUser) {
      console.log('❌ No user found, redirecting to login...');
      window.location.href = '/mini-app/login';
      return;
    }

    // User is logged in - load data
    console.log('✅ User logged in, loading data for:', authUser.username);
    loadUserData();
  }, [authUser, authLoading]);

  const loadUserData = async () => {
    if (!authUser) return;
    
    try {
      // Add cache busting and explicit headers
      const response = await fetch(`/api/users?telegramId=${authUser.telegramId}&_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      console.log('📊 Fetching user data for:', authUser.telegramId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 API Response:', data);
        
        if (data.success && data.data) {
          const userData = {
            balance: data.data.balance || 0,
            tasksCompleted: data.data.tasksCompleted || 0,
            referrals: data.data.referralCount || 0,
            level: data.data.level || 'BEGINNER'
          };
          
          console.log('📊 Setting stats:', userData);
          setStats(userData);
          
          // Update localStorage with latest data
          if (authUser) {
            const updatedUser = {
              ...authUser,
              balance: userData.balance,
              level: userData.level
            };
            localStorage.setItem('telegram_user', JSON.stringify(updatedUser));
          }
        } else {
          console.error('❌ Invalid data structure:', data);
        }
      } else {
        console.error('❌ API error:', response.status);
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };


  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg font-bold">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Header */}
      <div className="relative px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {authUser?.firstName || 'User'} 👋
            </h1>
            <p className="text-purple-300 text-sm">Level: {stats.level}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/mini-app/notifications">
              <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 relative">
                <Bell className="w-5 h-5 text-purple-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  3
                </span>
              </Button>
            </Link>
            <Link href="/mini-app/help">
              <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20">
                <HelpCircle className="w-5 h-5 text-purple-400" />
              </Button>
            </Link>
            <Link href="/mini-app/profile">
              <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 cursor-pointer hover:bg-white/20 transition-colors">
                <UserIcon className="w-5 h-5 text-purple-400 inline mr-2" />
                <span className="font-bold">{stats.level}</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-2xl hover:shadow-3xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1 font-semibold">إجمالي الرصيد</p>
                <div className="flex items-center gap-2">
                  <Coins className="w-8 h-8 text-yellow-300 drop-shadow-lg" />
                  <h2 className="text-4xl font-bold text-white drop-shadow-lg">
                    {stats.balance.toLocaleString()}
                  </h2>
                </div>
              </div>
              <Wallet className="w-16 h-16 text-white/20" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/30">
              <div>
                <p className="text-blue-100 text-xs mb-1 font-semibold">المهام المنجزة</p>
                <p className="text-2xl font-bold text-white">{stats.tasksCompleted}</p>
              </div>
              <div>
                <p className="text-blue-100 text-xs mb-1 font-semibold">الإحالات</p>
                <p className="text-2xl font-bold text-white">{stats.referrals}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4">
        <h3 className="text-xl font-bold mb-4 text-white">الإجراءات السريعة</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/mini-app/tasks" className="block">
            <Button className="h-auto py-6 bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-xl hover:shadow-2xl transition-all w-full">
              <div className="text-center w-full">
                <Target className="w-8 h-8 mx-auto mb-2 drop-shadow-lg" />
                <p className="font-bold text-base">اربح</p>
                <p className="text-xs font-medium opacity-90">أكمل المهام</p>
              </div>
            </Button>
          </Link>

          <Link href="/mini-app/ads" className="block">
            <Button className="h-auto py-6 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 shadow-xl hover:shadow-2xl transition-all w-full relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-bl">
                جديد!
              </div>
              <div className="text-center w-full">
                <Play className="w-8 h-8 mx-auto mb-2 drop-shadow-lg" />
                <p className="font-bold text-base">إعلانات</p>
                <p className="text-xs font-medium opacity-90">شاهد واربح</p>
              </div>
            </Button>
          </Link>

          <Link href="/mini-app/referrals" className="block">
            <Button className="h-auto py-6 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0 shadow-xl hover:shadow-2xl transition-all w-full">
              <div className="text-center w-full">
                <Users className="w-8 h-8 mx-auto mb-2 drop-shadow-lg" />
                <p className="font-bold text-base">ادعُ</p>
                <p className="text-xs font-medium opacity-90">أصدقاءك</p>
              </div>
            </Button>
          </Link>

          <Link href="/mini-app/rewards" className="block">
            <Button className="h-auto py-6 bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0 shadow-xl hover:shadow-2xl transition-all w-full">
              <div className="text-center w-full">
                <Gift className="w-8 h-8 mx-auto mb-2 drop-shadow-lg" />
                <p className="font-bold text-base">المكافآت</p>
                <p className="text-xs font-medium opacity-90">مكافأة يومية</p>
              </div>
            </Button>
          </Link>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="px-6 py-4 mb-20">
        <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg border-blue-400/30 shadow-xl">
          <div className="p-6 text-center">
            <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-md">🎉 مرحباً بك!</h3>
            <p className="text-gray-100 text-base font-medium">
              ابدأ بإكمال المهام اليومية لكسب المزيد من النقاط
            </p>
            <p className="text-gray-200 text-sm mt-2 font-medium">
              ادعُ أصدقاءك واحصل على مكافآت إضافية! 🚀
            </p>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 pb-safe shadow-2xl">
        <div className="grid grid-cols-5 gap-1 px-2 py-3">
          <Link href="/mini-app" className="flex flex-col items-center gap-1 py-2 text-blue-400 transition-colors">
            <Coins className="w-6 h-6 drop-shadow-lg" />
            <span className="text-xs font-semibold">الرئيسية</span>
          </Link>
          <Link href="/mini-app/tasks" className="flex flex-col items-center gap-1 py-2 text-gray-300 hover:text-white transition-colors">
            <Target className="w-6 h-6" />
            <span className="text-xs font-medium">المهام</span>
          </Link>
          <Link href="/mini-app/wallet" className="flex flex-col items-center gap-1 py-2 text-gray-300 hover:text-white transition-colors">
            <Wallet className="w-6 h-6" />
            <span className="text-xs font-medium">المحفظة</span>
          </Link>
          <Link href="/mini-app/leaderboard" className="flex flex-col items-center gap-1 py-2 text-gray-300 hover:text-white transition-colors">
            <Trophy className="w-6 h-6" />
            <span className="text-xs font-medium">الترتيب</span>
          </Link>
          <Link href="/mini-app/profile" className="flex flex-col items-center gap-1 py-2 text-gray-300 hover:text-white transition-colors">
            <UserIcon className="w-6 h-6" />
            <span className="text-xs font-medium">الملف</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
