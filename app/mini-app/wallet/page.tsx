'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Wallet as WalletIcon, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle, XCircle, Coins, Plus, TrendingUp, DollarSign,
  CreditCard, Send, Download, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';

interface WithdrawalRequest {
  id: string;
  amount: number;
  method: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
}

interface WalletStats {
  totalEarned: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
  thisWeekEarnings: number;
}

function WalletContent() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [stats, setStats] = useState<WalletStats>({
    totalEarned: 0,
    totalWithdrawn: 0,
    pendingWithdrawals: 0,
    thisWeekEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    method: 'TON',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      // Load withdrawals
      const withdrawalsResponse = await fetch('/api/withdrawals');
      if (withdrawalsResponse.ok) {
        const data = await withdrawalsResponse.json();
        if (data.success) {
          setWithdrawals(data.data.slice(0, 5) || []);
        }
      }

      // Load wallet stats من API الحقيقي
      const statsResponse = await fetch(`/api/wallet/stats?userId=${user.id}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats({
            totalEarned: statsData.data.totalEarned || 0,
            totalWithdrawn: statsData.data.totalWithdrawn || 0,
            pendingWithdrawals: statsData.data.pendingWithdrawals || 0,
            thisWeekEarnings: statsData.data.thisWeekEarnings || 0
          });
        }
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400 bg-green-500/20';
      case 'PENDING':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'REJECTED':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;
    
    const amount = parseInt(withdrawForm.amount);
    
    // Validation
    if (!amount || amount < 10000) {
      alert('الحد الأدنى للسحب 10,000 عملة');
      return;
    }
    
    if (amount > (user.balance || 0)) {
      alert('رصيدك غير كافٍ');
      return;
    }
    
    if (!withdrawForm.address) {
      alert('الرجاء إدخال عنوان المحفظة');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount,
          method: withdrawForm.method,
          walletAddress: withdrawForm.address
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('تم إرسال طلب السحب بنجاح! ✅');
          setShowWithdrawModal(false);
          setWithdrawForm({ amount: '', method: 'TON', address: '' });
          loadWalletData(); // Reload data
        } else {
          alert(data.message || 'حدث خطأ');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'فشل إرسال الطلب');
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      alert('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/mini-app">
            <Button variant="ghost" size="icon" className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">💰 المحفظة</h1>
            <p className="text-sm text-purple-300">إدارة رصيدك ومعاملاتك</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-24">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-yellow-600 to-orange-600 border-0 shadow-2xl mb-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-yellow-200 text-sm mb-2">الرصيد المتاح</p>
                <div className="flex items-center gap-3">
                  <Coins className="w-10 h-10 text-white" />
                  <h2 className="text-5xl font-bold">{user?.balance?.toLocaleString() || 0}</h2>
                </div>
                <p className="text-yellow-100 text-sm mt-2">
                  ≈ ${((user?.balance || 0) / 1000000).toFixed(2)} USDT
                </p>
              </div>
              <WalletIcon className="w-20 h-20 text-white/20" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/mini-app/tasks" className="block">
                <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md border-0 font-bold">
                  <Plus className="w-5 h-5 mr-2" />
                  اكسب المزيد
                </Button>
              </Link>
              <Button 
                onClick={() => setShowWithdrawModal(true)}
                className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md border-0 font-bold"
              >
                <Send className="w-5 h-5 mr-2" />
                سحب
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 border-green-500/50">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="w-5 h-5 text-green-400" />
                <p className="text-sm text-green-200">إجمالي الأرباح</p>
              </div>
              <p className="text-3xl font-bold text-green-400">
                {stats.totalEarned.toLocaleString()}
              </p>
              <p className="text-xs text-green-300 mt-1">كل الأوقات</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-600/30 to-pink-600/30 border-red-500/50">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-200">المسحوبات</p>
              </div>
              <p className="text-3xl font-bold text-red-400">
                {stats.totalWithdrawn.toLocaleString()}
              </p>
              <p className="text-xs text-red-300 mt-1">كل الأوقات</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border-blue-500/50">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <p className="text-sm text-blue-200">هذا الأسبوع</p>
              </div>
              <p className="text-3xl font-bold text-blue-400">
                {stats.thisWeekEarnings.toLocaleString()}
              </p>
              <p className="text-xs text-blue-300 mt-1">أرباح</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-600/30 to-orange-600/30 border-yellow-500/50">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <p className="text-sm text-yellow-200">قيد المعالجة</p>
              </div>
              <p className="text-3xl font-bold text-yellow-400">
                {stats.pendingWithdrawals.toLocaleString()}
              </p>
              <p className="text-xs text-yellow-300 mt-1">طلبات</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3">إجراءات سريعة</h3>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/mini-app/transactions">
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                <div className="p-4 text-center">
                  <Download className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                  <p className="text-xs font-bold">السجلات</p>
                </div>
              </Card>
            </Link>

            <Card 
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.showAlert('💳 طرق الدفع المتاحة:\n\n• TON Wallet\n• USDT (TRC20)\n• USDT (ERC20)\n• Bitcoin');
                  } else {
                    alert('💳 طرق الدفع المتاحة:\n\n• TON Wallet\n• USDT (TRC20)\n• USDT (ERC20)\n• Bitcoin');
                  }
                }
              }}
            >
              <div className="p-4 text-center">
                <CreditCard className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <p className="text-xs font-bold">طرق الدفع</p>
              </div>
            </Card>

            <Card 
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.showAlert('💱 أسعار التحويل:\n\n• 1,000,000 عملة = 1 USDT\n• 10,000 عملة (الحد الأدنى للسحب) = 0.01 USDT\n\n📊 الأسعار محدثة يومياً');
                  } else {
                    alert('💱 أسعار التحويل:\n\n• 1,000,000 عملة = 1 USDT\n• 10,000 عملة (الحد الأدنى للسحب) = 0.01 USDT\n\n📊 الأسعار محدثة يومياً');
                  }
                }
              }}
            >
              <div className="p-4 text-center">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <p className="text-xs font-bold">الأسعار</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div>
          <h3 className="text-lg font-bold mb-3">طلبات السحب الأخيرة</h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">جاري التحميل...</p>
            </div>
          ) : withdrawals.length === 0 ? (
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <div className="p-8 text-center">
                <WalletIcon className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400">لا توجد طلبات سحب</p>
                <p className="text-sm text-gray-500 mt-2">
                  اكسب المزيد من العملات وابدأ السحب!
                </p>
                <Link href="/mini-app/tasks">
                  <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    ابدأ الكسب
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <Card key={withdrawal.id} className="bg-white/5 backdrop-blur-md border-white/10">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                          <Send className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="font-bold">طلب سحب</p>
                          <p className="text-xs text-gray-400">{withdrawal.method}</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-red-400">
                        -{withdrawal.amount.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(withdrawal.status)}
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status === 'PENDING' && 'قيد المعالجة'}
                          {withdrawal.status === 'COMPLETED' && 'مكتمل'}
                          {withdrawal.status === 'REJECTED' && 'مرفوض'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(withdrawal.createdAt).toLocaleDateString('ar')}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}

              <Link href="/mini-app/transactions">
                <Button variant="ghost" className="w-full text-purple-400 hover:text-purple-300">
                  عرض جميع المعاملات
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Info Card */}
        <Card className="mt-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <WalletIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold mb-2">💡 معلومات مهمة</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• الحد الأدنى للسحب: 10,000 عملة</li>
                  <li>• معدل التحويل: 1,000,000 عملة = 1 USDT</li>
                  <li>• وقت المعالجة: 24-48 ساعة</li>
                  <li>• لا توجد رسوم على السحب</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-gradient-to-br from-purple-900 to-blue-900 border-purple-500/50 shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">💸 طلب سحب</h2>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium mb-2">المبلغ (عملة)</label>
                  <input
                    type="number"
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                    placeholder="10,000"
                    min="10000"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    الحد الأدنى: 10,000 عملة (~0.01 USDT)
                  </p>
                </div>

                {/* Method */}
                <div>
                  <label className="block text-sm font-medium mb-2">طريقة السحب</label>
                  <select
                    value={withdrawForm.method}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, method: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="TON">TON Wallet</option>
                    <option value="USDT_TRC20">USDT (TRC20)</option>
                    <option value="USDT_ERC20">USDT (ERC20)</option>
                    <option value="BTC">Bitcoin</option>
                  </select>
                </div>

                {/* Wallet Address */}
                <div>
                  <label className="block text-sm font-medium mb-2">عنوان المحفظة</label>
                  <input
                    type="text"
                    value={withdrawForm.address}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, address: e.target.value })}
                    placeholder="UQxxxxxxxxxxxxxx..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    تأكد من صحة العنوان - لا يمكن التراجع عن المعاملة!
                  </p>
                </div>

                {/* Info */}
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                  <p className="text-xs text-yellow-200">
                    ⚠️ ستتم مراجعة طلبك خلال 24-48 ساعة. سيتم إرسال إشعار عند الموافقة.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 border-0"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0"
                  >
                    {submitting ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function WalletPage() {
  return (
    <ProtectedRoute>
      <WalletContent />
    </ProtectedRoute>
  );
}
