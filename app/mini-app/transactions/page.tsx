'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, TrendingUp, TrendingDown, Gift, Target,
  Gamepad2, Users, Calendar, Filter, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/protected-route';

interface Transaction {
  id: string;
  type: 'TASK' | 'GAME' | 'REFERRAL' | 'DAILY_REWARD' | 'WITHDRAWAL' | 'ACHIEVEMENT';
  amount: number;
  description: string;
  createdAt: string;
}

type FilterType = 'all' | 'income' | 'expense';

function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    transactionCount: 0
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await fetch('/api/transactions?limit=100');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTransactions(data.data.transactions || []);
          calculateStats(data.data.transactions || []);
        }
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (txns: Transaction[]) => {
    const income = txns
      .filter(t => t.type !== 'WITHDRAWAL')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = txns
      .filter(t => t.type === 'WITHDRAWAL')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    setStats({
      totalIncome: income,
      totalExpense: expense,
      transactionCount: txns.length
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'TASK':
        return <Target className="w-5 h-5 text-blue-400" />;
      case 'GAME':
        return <Gamepad2 className="w-5 h-5 text-purple-400" />;
      case 'REFERRAL':
        return <Users className="w-5 h-5 text-green-400" />;
      case 'DAILY_REWARD':
        return <Gift className="w-5 h-5 text-yellow-400" />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="w-5 h-5 text-red-400" />;
      case 'ACHIEVEMENT':
        return <TrendingUp className="w-5 h-5 text-orange-400" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    if (type === 'WITHDRAWAL') return 'text-red-400';
    return 'text-green-400';
  };

  const getTransactionSign = (type: string) => {
    if (type === 'WITHDRAWAL') return '-';
    return '+';
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'TASK': return 'مهمة';
      case 'GAME': return 'لعبة';
      case 'REFERRAL': return 'إحالة';
      case 'DAILY_REWARD': return 'مكافأة يومية';
      case 'WITHDRAWAL': return 'سحب';
      case 'ACHIEVEMENT': return 'إنجاز';
      default: return type;
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'income') return t.type !== 'WITHDRAWAL';
    if (filter === 'expense') return t.type === 'WITHDRAWAL';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/mini-app/profile">
            <Button variant="ghost" size="icon" className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">📊 سجل المعاملات</h1>
            <p className="text-sm text-purple-300">تاريخ حركاتك المالية</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-24">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 border-green-500/50">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="w-5 h-5 text-green-400" />
                <p className="text-sm text-green-200">إجمالي الدخل</p>
              </div>
              <p className="text-2xl font-bold text-green-400">
                +{stats.totalIncome.toLocaleString()}
              </p>
              <p className="text-xs text-green-300 mt-1">💰 عملة</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-600/30 to-pink-600/30 border-red-500/50">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-200">إجمالي المصروفات</p>
              </div>
              <p className="text-2xl font-bold text-red-400">
                -{stats.totalExpense.toLocaleString()}
              </p>
              <p className="text-xs text-red-300 mt-1">💰 عملة</p>
            </div>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'ghost'}
            className={`flex-1 ${
              filter === 'all' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                : 'bg-white/5'
            }`}
            size="sm"
          >
            الكل ({transactions.length})
          </Button>
          <Button
            onClick={() => setFilter('income')}
            variant={filter === 'income' ? 'default' : 'ghost'}
            className={`flex-1 ${
              filter === 'income' 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                : 'bg-white/5'
            }`}
            size="sm"
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            الدخل
          </Button>
          <Button
            onClick={() => setFilter('expense')}
            variant={filter === 'expense' ? 'default' : 'ghost'}
            className={`flex-1 ${
              filter === 'expense' 
                ? 'bg-gradient-to-r from-red-600 to-pink-600' 
                : 'bg-white/5'
            }`}
            size="sm"
          >
            <TrendingDown className="w-4 h-4 mr-1" />
            المصروفات
          </Button>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">جاري التحميل...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400">لا توجد معاملات</p>
              <p className="text-sm text-gray-500 mt-2">
                ابدأ بإكمال المهام واللعب لتظهر معاملاتك هنا
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Group by Date */}
            {(() => {
              const grouped: { [key: string]: Transaction[] } = {};
              filteredTransactions.forEach(t => {
                const date = new Date(t.createdAt).toLocaleDateString('ar', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
                if (!grouped[date]) grouped[date] = [];
                grouped[date].push(t);
              });

              return Object.entries(grouped).map(([date, txns]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-2 mt-4">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-400 font-bold">{date}</p>
                    <div className="flex-1 h-px bg-white/10"></div>
                  </div>
                  
                  <div className="space-y-2">
                    {txns.map(transaction => (
                      <Card 
                        key={transaction.id}
                        className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all"
                      >
                        <div className="p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                            {getTransactionIcon(transaction.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate">{transaction.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-white/10 rounded text-xs">
                                {getTypeName(transaction.type)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(transaction.createdAt).toLocaleTimeString('ar', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className={`text-xl font-bold ${getTransactionColor(transaction.type)}`}>
                              {getTransactionSign(transaction.type)}
                              {Math.abs(transaction.amount).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">عملة</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <ProtectedRoute>
      <TransactionsContent />
    </ProtectedRoute>
  );
}
