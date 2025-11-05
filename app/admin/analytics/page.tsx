'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, TrendingUp, Users, Coins, Target, Calendar,
  Activity, BarChart3, PieChart
} from 'lucide-react';
import Link from 'next/link';

interface Analytics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    totalRevenue: number;
  };
  growth: {
    usersGrowth: number;
    revenueGrowth: number;
    engagementGrowth: number;
  };
  topTasks: Array<{
    name: string;
    completions: number;
    reward: number;
  }>;
  topUsers: Array<{
    username: string;
    balance: number;
    tasksCompleted: number;
  }>;
  dailyStats: Array<{
    date: string;
    users: number;
    tasks: number;
    revenue: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">التحليلات</h1>
              <p className="text-sm text-purple-300">إحصائيات وتحليلات شاملة</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            <Button
              onClick={() => setTimeRange('7d')}
              variant={timeRange === '7d' ? 'default' : 'ghost'}
              size="sm"
            >
              7 أيام
            </Button>
            <Button
              onClick={() => setTimeRange('30d')}
              variant={timeRange === '30d' ? 'default' : 'ghost'}
              size="sm"
            >
              30 يوم
            </Button>
            <Button
              onClick={() => setTimeRange('90d')}
              variant={timeRange === '90d' ? 'default' : 'ghost'}
              size="sm"
            >
              90 يوم
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">جاري التحميل...</p>
          </div>
        ) : analytics ? (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 border-0 shadow-xl">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-blue-100 text-sm mb-1">المستخدمون</p>
                      <h2 className="text-4xl font-bold">{analytics.overview.totalUsers.toLocaleString()}</h2>
                    </div>
                    <Users className="w-12 h-12 text-white/30" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-300" />
                    <span className="text-green-300">+{analytics.overview.newUsersToday} اليوم</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-600 to-emerald-600 border-0 shadow-xl">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-green-100 text-sm mb-1">المستخدمون النشطون</p>
                      <h2 className="text-4xl font-bold">{analytics.overview.activeUsers.toLocaleString()}</h2>
                    </div>
                    <Activity className="w-12 h-12 text-white/30" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-200">
                      {((analytics.overview.activeUsers / analytics.overview.totalUsers) * 100).toFixed(1)}% نسبة النشاط
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-600 to-orange-600 border-0 shadow-xl">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-yellow-100 text-sm mb-1">إجمالي الأرصدة</p>
                      <h2 className="text-4xl font-bold">{analytics.overview.totalRevenue.toLocaleString()}</h2>
                    </div>
                    <Coins className="w-12 h-12 text-white/30" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-yellow-200" />
                    <span className="text-yellow-200">+{analytics.growth.revenueGrowth}%</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0 shadow-xl">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-purple-100 text-sm mb-1">معدل التفاعل</p>
                      <h2 className="text-4xl font-bold">{analytics.growth.engagementGrowth}%</h2>
                    </div>
                    <Target className="w-12 h-12 text-white/30" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-purple-200">نمو ممتاز 🚀</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top Tasks */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold">أكثر المهام شعبية</h3>
                  </div>

                  <div className="space-y-3">
                    {analytics.topTasks.map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center font-bold text-purple-300">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{task.name}</p>
                            <p className="text-xs text-gray-400">{task.completions} إنجاز</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Coins className="w-4 h-4" />
                          <span className="font-bold">{task.reward}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Top Users */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <PieChart className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-bold">أفضل المستخدمين</h3>
                  </div>

                  <div className="space-y-3">
                    {analytics.topUsers.map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center font-bold">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </div>
                          <div>
                            <p className="font-medium">@{user.username}</p>
                            <p className="text-xs text-gray-400">{user.tasksCompleted} مهمة</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Coins className="w-4 h-4" />
                          <span className="font-bold">{user.balance.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Daily Stats Chart */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold">إحصائيات يومية</h3>
                </div>

                <div className="space-y-2">
                  {analytics.dailyStats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                      <div className="text-sm text-gray-400 w-24">
                        {new Date(stat.date).toLocaleDateString('ar')}
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-1">مستخدمون</p>
                          <p className="font-bold">{stat.users}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-1">مهام</p>
                          <p className="font-bold">{stat.tasks}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-1">عملات</p>
                          <p className="font-bold text-yellow-400">{stat.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </>
        ) : (
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <div className="p-8 text-center">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400">لا توجد بيانات</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
