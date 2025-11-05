'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // In development, any password works
      if (process.env.NODE_ENV === 'development') {
        document.cookie = `admin_token=${password}; path=/; max-age=86400`;
        router.push('/admin');
        return;
      }

      // In production, you should validate against your backend
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        const data = await response.json();
        document.cookie = `admin_token=${data.token}; path=/; max-age=86400`;
        router.push('/admin');
      } else {
        setError('كلمة المرور غير صحيحة');
      }
    } catch (error) {
      setError('حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md w-full">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">
            تسجيل دخول الأدمن
          </h1>
          <p className="text-gray-300 text-center mb-8">
            أدخل كلمة المرور للوصول إلى لوحة التحكم
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-yellow-600/20 border border-yellow-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-200">
                <p className="font-bold mb-1">وضع التطوير</p>
                <p>أي كلمة مرور ستعمل في وضع التطوير</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pl-12 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="أدخل كلمة المرور"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-600/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  جاري الدخول...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  دخول
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-400 text-center">
              ⚠️ هذه الصفحة محمية. الوصول للمسؤولين فقط.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
