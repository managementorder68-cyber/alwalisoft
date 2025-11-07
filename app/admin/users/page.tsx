'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Users, Search, Edit, Trash2, Eye,
  Coins, Target, Calendar, TrendingUp, Ban, CheckCircle, Shield, X
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'ban' | 'activate' | 'edit' | 'delete' | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch(`/api/users/all?_t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      
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

  const handleAction = (user: User, action: typeof actionType) => {
    setSelectedUser(user);
    setActionType(action);
    setShowActionModal(true);
  };

  const executeAction = async () => {
    if (!selectedUser || !actionType) return;
    
    try {
      if (actionType === 'delete') {
        const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert('✅ تم حذف المستخدم بنجاح');
          loadUsers();
        }
      } else {
        const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: actionType })
        });
        
        if (response.ok) {
          const messages = {
            ban: '✅ تم حظر المستخدم',
            activate: '✅ تم تفعيل المستخدم',
            edit: '✅ تم تحديث المستخدم'
          };
          alert(messages[actionType] || '✅ تم تنفيذ الإجراء');
          loadUsers();
        }
      }
    } catch (error) {
      console.error('Error executing action:', error);
      alert('❌ حدث خطأ أثناء تنفيذ الإجراء');
    } finally {
      setShowActionModal(false);
      setSelectedUser(null);
      setActionType(null);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                إدارة المستخدمين
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {filteredUsers.length} من {users.length} مستخدم
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="p-4">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المستخدمين</p>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="p-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">مستخدم نشط</p>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="p-4">
              <Coins className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBalance.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الأرصدة</p>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="p-4">
              <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgBalance.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">متوسط الرصيد</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg mb-6">
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
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">جميع الحالات</option>
                <option value="ACTIVE">نشط</option>
                <option value="SUSPENDED">معلق</option>
                <option value="BANNED">محظور</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">جارٍ تحميل المستخدمين...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">لا توجد نتائج</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                        {user.firstName?.charAt(0) || 'U'}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName || ''}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            user.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            user.status === 'BANNED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {user.status === 'ACTIVE' ? 'نشط' : user.status === 'BANNED' ? 'محظور' : user.status === 'SUSPENDED' ? 'معلق' : 'غير نشط'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">@{user.username || 'لا يوجد'}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">الرصيد</p>
                              <p className="font-bold text-gray-900 dark:text-white">{user.balance.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">المهام</p>
                              <p className="font-bold text-gray-900 dark:text-white">{user.tasksCompleted || 0}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">الإحالات</p>
                              <p className="font-bold text-gray-900 dark:text-white">{user.referralCount || 0}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">الانضمام</p>
                              <p className="font-bold text-xs text-gray-900 dark:text-white">
                                {new Date(user.createdAt).toLocaleDateString('ar')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      
                      {user.status === 'ACTIVE' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleAction(user, 'ban')}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                          onClick={() => handleAction(user, 'activate')}
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleAction(user, 'delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
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

      {/* Action Modal */}
      {showActionModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">تأكيد الإجراء</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowActionModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                هل أنت متأكد من {
                  actionType === 'ban' ? 'حظر' :
                  actionType === 'activate' ? 'تفعيل' :
                  actionType === 'delete' ? 'حذف' : 'تعديل'
                } المستخدم <strong>{selectedUser.firstName}</strong>؟
              </p>
              
              <div className="flex gap-3">
                <Button
                  onClick={executeAction}
                  className={`flex-1 ${
                    actionType === 'delete' || actionType === 'ban'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  تأكيد
                </Button>
                <Button
                  onClick={() => setShowActionModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
