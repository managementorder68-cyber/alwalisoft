'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Users, Search, Filter, Edit, Trash2, Eye,
  Coins, Target, Calendar, TrendingUp, Ban, CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  telegramId: string;
  username: string;
  firstName: string;
  lastName?: string;
  balance: number;
  level: string;
  referralCount: number;
  tasksCompleted: number;
  createdAt: string;
  lastActiveAt?: string;
  status: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users/all');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telegramId?.includes(searchTerm);
      
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'balance') return b.balance - a.balance;
      if (sortBy === 'referrals') return b.referralCount - a.referralCount;
      if (sortBy === 'tasks') return b.tasksCompleted - a.tasksCompleted;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    avgBalance: users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.balance, 0) / users.length) : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Users className="w-7 h-7 text-blue-400" />
                إدارة المستخدمين
              </h1>
              <p className="text-purple-300 text-sm">
                {filteredUsers.length} من {users.length} مستخدم
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-600/30 to-blue-800/30 border-blue-500/50">
            <div className="p-4">
              <Users className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-blue-200">إجمالي المستخدمين</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/30 to-green-800/30 border-green-500/50">
            <div className="p-4">
              <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-green-200">مستخدم نشط</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-600/30 to-yellow-800/30 border-yellow-500/50">
            <div className="p-4">
              <Coins className="w-8 h-8 text-yellow-400 mb-2" />
              <p className="text-2xl font-bold">{stats.totalBalance.toLocaleString()}</p>
              <p className="text-sm text-yellow-200">إجمالي الأرصدة</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 border-purple-500/50">
            <div className="p-4">
              <TrendingUp className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-2xl font-bold">{stats.avgBalance.toLocaleString()}</p>
              <p className="text-sm text-purple-200">متوسط الرصيد</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-6">
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث بالاسم أو username أو telegram ID..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">جميع الحالات</option>
                <option value="ACTIVE">نشط</option>
                <option value="INACTIVE">غير نشط</option>
                <option value="BANNED">محظور</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="createdAt">الأحدث</option>
                <option value="balance">الرصيد</option>
                <option value="referrals">الإحالات</option>
                <option value="tasks">المهام</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">جارٍ تحميل المستخدمين...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <div className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">لا توجد نتائج</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl font-bold flex-shrink-0">
                        {user.firstName?.charAt(0) || 'U'}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold">
                            {user.firstName} {user.lastName || ''}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            user.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                            user.status === 'BANNED' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user.status === 'ACTIVE' ? 'نشط' : user.status === 'BANNED' ? 'محظور' : 'غير نشط'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">@{user.username || 'لا يوجد'}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-yellow-400" />
                            <div>
                              <p className="text-xs text-gray-400">الرصيد</p>
                              <p className="font-bold">{user.balance.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-green-400" />
                            <div>
                              <p className="text-xs text-gray-400">المهام</p>
                              <p className="font-bold">{user.tasksCompleted || 0}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            <div>
                              <p className="text-xs text-gray-400">الإحالات</p>
                              <p className="font-bold">{user.referralCount || 0}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            <div>
                              <p className="text-xs text-gray-400">الانضمام</p>
                              <p className="font-bold text-xs">
                                {new Date(user.createdAt).toLocaleDateString('ar')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:bg-blue-500/20"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-green-400 hover:bg-green-500/20"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-white/10">
                    <span>Telegram ID: {user.telegramId}</span>
                    <span>•</span>
                    <span>المستوى: {user.level}</span>
                    {user.lastActiveAt && (
                      <>
                        <span>•</span>
                        <span>آخر نشاط: {new Date(user.lastActiveAt).toLocaleDateString('ar')}</span>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
