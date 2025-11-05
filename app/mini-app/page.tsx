'use client';

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
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function MiniAppPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    balance: 0,
    tasksCompleted: 0,
    referrals: 0,
    level: 'BEGINNER'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    if (!authLoading && !authUser) {
      router.push('/mini-app/login');
      return;
    }

    if (authUser) {
      // Initialize Telegram Web App
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        // Set theme
        tg.setHeaderColor('#000000');
        tg.setBackgroundColor('#000000');
      }
      
      loadUserData();
    }
  }, [authUser, authLoading, router]);

  const loadUserData = async () => {
    if (!authUser) return;
    
    try {
      const response = await fetch(`/api/users?telegramId=${authUser.telegramId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setStats({
            balance: data.data.balance || 0,
            tasksCompleted: data.data.tasksCompleted || 0,
            referrals: data.data.referralCount || 0,
            level: data.data.level || 'BEGINNER'
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white overflow-hidden">
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
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 shadow-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Total Balance</p>
                <div className="flex items-center gap-2">
                  <Coins className="w-8 h-8 text-yellow-400" />
                  <h2 className="text-4xl font-bold">
                    {stats.balance.toLocaleString()}
                  </h2>
                </div>
              </div>
              <Wallet className="w-16 h-16 text-white/20" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
              <div>
                <p className="text-purple-200 text-xs mb-1">Tasks Done</p>
                <p className="text-xl font-bold">{stats.tasksCompleted}</p>
              </div>
              <div>
                <p className="text-purple-200 text-xs mb-1">Referrals</p>
                <p className="text-xl font-bold">{stats.referrals}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/mini-app/tasks" className="block">
            <Button className="h-auto py-6 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 shadow-lg w-full">
              <div className="text-center w-full">
                <Target className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">Earn</p>
                <p className="text-xs opacity-80">Complete Tasks</p>
              </div>
            </Button>
          </Link>

          <Link href="/mini-app/games" className="block">
            <Button className="h-auto py-6 bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 border-0 shadow-lg w-full">
              <div className="text-center w-full">
                <Zap className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">Play</p>
                <p className="text-xs opacity-80">Mini Games</p>
              </div>
            </Button>
          </Link>

          <Link href="/mini-app/referrals" className="block">
            <Button className="h-auto py-6 bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border-0 shadow-lg w-full">
              <div className="text-center w-full">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">Invite</p>
                <p className="text-xs opacity-80">Refer Friends</p>
              </div>
            </Button>
          </Link>

          <Link href="/mini-app/rewards" className="block">
            <Button className="h-auto py-6 bg-gradient-to-br from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 border-0 shadow-lg w-full">
              <div className="text-center w-full">
                <Gift className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">Rewards</p>
                <p className="text-xs opacity-80">Daily Bonus</p>
              </div>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6 py-4 mb-20">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Task Completed</p>
                <p className="text-xs text-gray-400">+1,000 coins</p>
              </div>
              <p className="text-xs text-gray-500">2m ago</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">New Referral</p>
                <p className="text-xs text-gray-400">+5,000 coins</p>
              </div>
              <p className="text-xs text-gray-500">1h ago</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 pb-safe">
        <div className="grid grid-cols-5 gap-1 px-2 py-3">
          <Link href="/mini-app" className="flex flex-col items-center gap-1 py-2 text-purple-400">
            <Coins className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/mini-app/tasks" className="flex flex-col items-center gap-1 py-2 text-gray-400 hover:text-white">
            <Target className="w-6 h-6" />
            <span className="text-xs">Tasks</span>
          </Link>
          <Link href="/mini-app/wallet" className="flex flex-col items-center gap-1 py-2 text-gray-400 hover:text-white">
            <Wallet className="w-6 h-6" />
            <span className="text-xs">Wallet</span>
          </Link>
          <Link href="/mini-app/leaderboard" className="flex flex-col items-center gap-1 py-2 text-gray-400 hover:text-white">
            <Trophy className="w-6 h-6" />
            <span className="text-xs">Rank</span>
          </Link>
          <Link href="/mini-app/profile" className="flex flex-col items-center gap-1 py-2 text-gray-400 hover:text-white">
            <UserIcon className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
