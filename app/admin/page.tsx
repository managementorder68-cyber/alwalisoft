'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Target, Wallet, TrendingUp, AlertCircle, 
  CheckCircle, Clock, ArrowUpRight, Coins
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  completedTasks: number;
  totalBalance: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalBalance: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-6 py-6">
          <h1 className="text-3xl font-bold mb-2">🛡️ لوحة تحكم الأدمن</h1>
          <p className="text-purple-300">Admin Dashboard - بوت صدام الولي</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">جاري التحميل...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Users */}
              <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 border-0 shadow-xl">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-blue-100 text-sm mb-1">إجمالي المستخدمين</p>
                      <h2 className="text-4xl font-bold">{stats.totalUsers.toLocaleString()}</h2>
                    </div>
                    <Users className="w-12 h-12 text-white/30" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>نشط: {stats.activeUsers}</span>
                  </div>
                </div>
              </Card>

              {/* Tasks */}
              <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0 shadow-xl">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-purple-100 text-sm mb-1">المهام</p>
                      <h2 className="text-4xl font-bold">{stats.totalTasks.toLocaleString()}</h2>
                    </div>
                    <Target className="w-12 h-12 text-white/30" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>مكتملة: {stats.completedTasks}</span>
                  </div>
                </div>
              </Card>

              {/* Balance */}
              <Card className="bg-gradient-to-br from-yellow-600 to-orange-600 border-0 shadow-xl">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-yellow-100 text-sm mb-1">إجمالي الأرصدة</p>
                      <h2 className="text-4xl font-bold">{stats.totalBalance.toLocaleString()}</h2>
                    </div>
                    <Coins className="w-12 h-12 text-white/30" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>عملة</span>
                  </div>
                </div>
              </Card>

              {/* Withdrawals */}
              <Card className="bg-gradient-to-br from-green-600 to-emerald-600 border-0 shadow-xl">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-green-100 text-sm mb-1">السحوبات</p>
                      <h2 className="text-4xl font-bold">{stats.totalWithdrawals.toLocaleString()}</h2>
                    </div>
                    <Wallet className="w-12 h-12 text-white/30" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>معلقة: {stats.pendingWithdrawals}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/admin/users">
                <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">إدارة المستخدمين</h3>
                      <p className="text-sm text-gray-400">عرض وإدارة المستخدمين</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/admin/tasks">
                <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Target className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">إدارة المهام</h3>
                      <p className="text-sm text-gray-400">إضافة وتعديل المهام</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/admin/withdrawals">
                <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">طلبات السحب</h3>
                      <p className="text-sm text-gray-400">مراجعة وموافقة السحوبات</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/admin/analytics">
                <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">التحليلات</h3>
                      <p className="text-sm text-gray-400">إحصائيات وتحليلات شاملة</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>

            {/* Warning Card */}
            <Card className="mt-6 bg-gradient-to-r from-orange-600/20 to-red-600/20 border-orange-500/50">
              <div className="p-6 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">⚠️ تحذير أمني</h3>
                  <p className="text-sm text-gray-300">
                    هذه لوحة تحكم الأدمن. يجب حمايتها بكلمة مرور قوية وعدم مشاركة الوصول.
                    قم بإضافة authentication middleware لحماية هذه الصفحات في الإنتاج.
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
