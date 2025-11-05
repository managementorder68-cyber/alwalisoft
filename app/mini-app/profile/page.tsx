'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, User, Coins, Target, Users, Trophy,
  Calendar, TrendingUp, Award, Star, Gift, Edit,
  Settings, ExternalLink, Copy, Check
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';

interface UserStats {
  totalEarned: number;
  totalWithdrawn: number;
  tasksCompleted: number;
  gamesPlayed: number;
  referralsCount: number;
  currentStreak: number;
  longestStreak: number;
  achievementsUnlocked: number;
  joinDate: string;
  lastActive: string;
}

function ProfileContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/users/stats');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (user?.referralCode) {
      const botUsername = 'makeittooeasy_bot';
      const referralLink = `https://t.me/${botUsername}?start=${user.referralCode}`;
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getLevel = () => {
    if (!user) return { name: 'مبتدئ', color: 'text-gray-400', progress: 0 };
    const balance = user.balance || 0;
    
    if (balance >= 100000) return { name: 'أسطوري', color: 'text-purple-400', progress: 100 };
    if (balance >= 50000) return { name: 'محترف', color: 'text-blue-400', progress: 75 };
    if (balance >= 20000) return { name: 'متقدم', color: 'text-green-400', progress: 50 };
    if (balance >= 5000) return { name: 'متوسط', color: 'text-yellow-400', progress: 25 };
    return { name: 'مبتدئ', color: 'text-gray-400', progress: 10 };
  };

  const level = getLevel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/mini-app">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">👤 الملف الشخصي</h1>
              <p className="text-sm text-purple-300">معلوماتك وإحصائياتك</p>
            </div>
          </div>
          <Link href="/mini-app/settings">
            <Button variant="ghost" size="icon" className="text-white">
              <Settings className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-24">
        {/* Profile Card */}
        <Card className="bg-gradient-to-br from-purple-600/30 to-blue-600/30 border-purple-500/50 mb-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
          
          <div className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl font-bold relative">
                  {user?.firstName?.charAt(0) || 'U'}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-black"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.firstName || 'المستخدم'}</h2>
                  <p className="text-purple-200">@{user?.username || 'user'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full bg-white/10 text-sm font-bold ${level.color}`}>
                      {level.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-200">تقدم المستوى</span>
                <span className="text-sm font-bold">{level.progress}%</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${level.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white/5 rounded-lg backdrop-blur-sm">
                <Coins className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                <p className="text-xl font-bold">{user?.balance?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-300">الرصيد</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg backdrop-blur-sm">
                <Users className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                <p className="text-xl font-bold">{stats?.referralsCount || 0}</p>
                <p className="text-xs text-gray-300">الإحالات</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg backdrop-blur-sm">
                <Target className="w-5 h-5 mx-auto mb-1 text-green-400" />
                <p className="text-xl font-bold">{stats?.tasksCompleted || 0}</p>
                <p className="text-xs text-gray-300">المهام</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Referral Link */}
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50 mb-6">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold">رابط الإحالة الخاص بك</h3>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-white/5 rounded-lg text-sm font-mono truncate">
                t.me/makeittooeasy_bot?start={user?.referralCode || '...'}
              </div>
              <Button
                onClick={copyReferralLink}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              شارك الرابط واحصل على 500 عملة لكل صديق ينضم!
            </p>
          </div>
        </Card>

        {/* Statistics */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            الإحصائيات التفصيلية
          </h3>

          <div className="space-y-3">
            {/* Earnings */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-bold">إجمالي الأرباح</p>
                    <p className="text-xs text-gray-400">كل الأوقات</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-green-400">
                  {stats?.totalEarned?.toLocaleString() || 0} 💰
                </p>
              </div>
            </Card>

            {/* Withdrawals */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-bold">المسحوبات</p>
                    <p className="text-xs text-gray-400">كل الأوقات</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-red-400">
                  {stats?.totalWithdrawn?.toLocaleString() || 0} 💰
                </p>
              </div>
            </Card>

            {/* Games */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-bold">الألعاب الملعوبة</p>
                    <p className="text-xs text-gray-400">كل الأوقات</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-purple-400">
                  {stats?.gamesPlayed || 0}
                </p>
              </div>
            </Card>

            {/* Streak */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-bold">سلسلة الأيام</p>
                    <p className="text-xs text-gray-400">الحالية / الأطول</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-400">
                    {stats?.currentStreak || 0} 🔥
                  </p>
                  <p className="text-xs text-gray-400">
                    الأطول: {stats?.longestStreak || 0}
                  </p>
                </div>
              </div>
            </Card>

            {/* Achievements */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-bold">الإنجازات</p>
                    <p className="text-xs text-gray-400">محققة / إجمالي</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-yellow-400">
                  {stats?.achievementsUnlocked || 0} / 14
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Activity */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            النشاط
          </h3>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">تاريخ الانضمام</span>
                <span className="font-bold">
                  {stats?.joinDate ? new Date(stats.joinDate).toLocaleDateString('ar') : '-'}
                </span>
              </div>
              <div className="h-px bg-white/10"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">آخر نشاط</span>
                <span className="font-bold">
                  {stats?.lastActive ? new Date(stats.lastActive).toLocaleDateString('ar') : '-'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/mini-app/achievements" className="block">
            <Card className="bg-gradient-to-br from-yellow-600 to-orange-600 border-0 hover:scale-105 transition-transform">
              <div className="p-4 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">الإنجازات</p>
              </div>
            </Card>
          </Link>

          <Link href="/mini-app/transactions" className="block">
            <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 border-0 hover:scale-105 transition-transform">
              <div className="p-4 text-center">
                <ExternalLink className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">السجلات</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
