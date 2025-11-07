'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Send, Check, X, Clock, DollarSign, AlertCircle, Eye
} from 'lucide-react';
import Link from 'next/link';

interface Withdrawal {
  id: string;
  userId: string;
  user: {
    username: string;
    firstName: string;
    telegramId: string;
  };
  amount: number;
  method: string;
  details: any;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  processedAt?: string;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    try {
      const response = await fetch(`/api/withdrawals/all?_t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      console.log('📊 Loading withdrawals for admin...');
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Withdrawals data:', data);
        
        if (data.success) {
          setWithdrawals(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWithdrawalStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        loadWithdrawals();
      }
    } catch (error) {
      console.error('Error updating withdrawal:', error);
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => 
    filterStatus === 'all' || w.status === filterStatus
  );

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === 'PENDING').length,
    completed: withdrawals.filter(w => w.status === 'COMPLETED').length,
    rejected: withdrawals.filter(w => w.status === 'REJECTED').length,
    totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0),
    pendingAmount: withdrawals.filter(w => w.status === 'PENDING').reduce((sum, w) => sum + w.amount, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'APPROVED': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'COMPLETED': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'قيد المراجعة';
      case 'APPROVED': return 'مُوافق عليه';
      case 'COMPLETED': return 'مكتمل';
      case 'REJECTED': return 'مرفوض';
      default: return status;
    }
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
                <Send className="w-7 h-7 text-yellow-400" />
                طلبات السحب
              </h1>
              <p className="text-purple-300 text-sm">
                {stats.pending} طلب قيد المراجعة
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 border-purple-500/50">
            <div className="p-4">
              <Send className="w-6 h-6 text-purple-400 mb-2" />
              <p className="text-xl font-bold">{stats.total}</p>
              <p className="text-xs text-purple-200">إجمالي الطلبات</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-600/30 to-yellow-800/30 border-yellow-500/50">
            <div className="p-4">
              <Clock className="w-6 h-6 text-yellow-400 mb-2" />
              <p className="text-xl font-bold">{stats.pending}</p>
              <p className="text-xs text-yellow-200">قيد المراجعة</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/30 to-green-800/30 border-green-500/50">
            <div className="p-4">
              <Check className="w-6 h-6 text-green-400 mb-2" />
              <p className="text-xl font-bold">{stats.completed}</p>
              <p className="text-xs text-green-200">مكتمل</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-600/30 to-red-800/30 border-red-500/50">
            <div className="p-4">
              <X className="w-6 h-6 text-red-400 mb-2" />
              <p className="text-xl font-bold">{stats.rejected}</p>
              <p className="text-xs text-red-200">مرفوض</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600/30 to-blue-800/30 border-blue-500/50">
            <div className="p-4">
              <DollarSign className="w-6 h-6 text-blue-400 mb-2" />
              <p className="text-lg font-bold">{stats.totalAmount.toLocaleString()}</p>
              <p className="text-xs text-blue-200">إجمالي المبالغ</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600/30 to-orange-800/30 border-orange-500/50">
            <div className="p-4">
              <AlertCircle className="w-6 h-6 text-orange-400 mb-2" />
              <p className="text-lg font-bold">{stats.pendingAmount.toLocaleString()}</p>
              <p className="text-xs text-orange-200">معلقة</p>
            </div>
          </Card>
        </div>

        {/* Filter */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-6">
          <div className="p-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">جميع الطلبات</option>
              <option value="PENDING">قيد المراجعة</option>
              <option value="APPROVED">مُوافق عليه</option>
              <option value="COMPLETED">مكتمل</option>
              <option value="REJECTED">مرفوض</option>
            </select>
          </div>
        </Card>

        {/* Withdrawals List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">جارٍ تحميل الطلبات...</p>
          </div>
        ) : filteredWithdrawals.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <div className="p-12 text-center">
              <Send className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">لا توجد طلبات سحب</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredWithdrawals.map((withdrawal) => (
              <Card key={withdrawal.id} className="bg-white/5 backdrop-blur-md border-white/10">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {/* User Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                          {withdrawal.user.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold">{withdrawal.user.firstName}</p>
                          <p className="text-xs text-gray-400">@{withdrawal.user.username || 'لا يوجد'}</p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">المبلغ</p>
                          <p className="text-lg font-bold text-yellow-400">
                            {withdrawal.amount.toLocaleString()} نقطة
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">الطريقة</p>
                          <p className="font-bold">{withdrawal.method}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">التاريخ</p>
                          <p className="text-sm">{new Date(withdrawal.createdAt).toLocaleString('ar')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">الحالة</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(withdrawal.status)}`}>
                            {getStatusLabel(withdrawal.status)}
                          </span>
                        </div>
                      </div>

                      {/* Payment Details */}
                      {withdrawal.details && (
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-xs text-gray-400 mb-2">تفاصيل الدفع:</p>
                          <pre className="text-xs text-gray-300 overflow-auto">
                            {JSON.stringify(withdrawal.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {withdrawal.status === 'PENDING' && (
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => updateWithdrawalStatus(withdrawal.id, 'APPROVED')}
                          className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          موافقة
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateWithdrawalStatus(withdrawal.id, 'REJECTED')}
                          className="bg-red-600 hover:bg-red-700 whitespace-nowrap"
                        >
                          <X className="w-4 h-4 mr-1" />
                          رفض
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:bg-blue-500/20 whitespace-nowrap"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          تفاصيل
                        </Button>
                      </div>
                    )}

                    {withdrawal.status === 'APPROVED' && (
                      <Button
                        size="sm"
                        onClick={() => updateWithdrawalStatus(withdrawal.id, 'COMPLETED')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        تأكيد الإرسال
                      </Button>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="text-xs text-gray-500 pt-3 border-t border-white/10">
                    <span>ID: {withdrawal.id}</span>
                    <span className="mx-2">•</span>
                    <span>Telegram ID: {withdrawal.user.telegramId}</span>
                    {withdrawal.processedAt && (
                      <>
                        <span className="mx-2">•</span>
                        <span>تمت المعالجة: {new Date(withdrawal.processedAt).toLocaleString('ar')}</span>
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
