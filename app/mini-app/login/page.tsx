'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn, UserCheck, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user: authUser, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // If already logged in, redirect
    if (authUser) {
      console.log('✅ User already logged in, redirecting...');
      window.location.href = '/mini-app';
      return;
    }

    // Initialize Telegram Web App
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Set theme
      tg.setHeaderColor('#000000');
      tg.setBackgroundColor('#000000');
      
      // Get user data
      const initData = tg.initDataUnsafe;
      console.log('📱 Telegram initData:', initData);
      
      if (initData.user) {
        console.log('👤 Telegram user found:', initData.user.username || initData.user.first_name);
        setTelegramUser(initData.user);
        
        // Auto-login attempt
        if (!autoLoginAttempted) {
          setAutoLoginAttempted(true);
          handleAutoLogin(initData.user);
        }
      } else {
        console.log('⚠️ No Telegram user in initData');
      }
    } else {
      console.log('⚠️ Telegram WebApp not available');
    }
  }, [authUser, autoLoginAttempted]);

  const handleAutoLogin = async (user: any) => {
    console.log('🤖 Auto-login attempt for:', user.id);
    await performLogin(user, true);
  };

  const handleLogin = async () => {
    console.log('👆 Manual login clicked');
    if (!telegramUser) {
      setError('No Telegram user data available. Please open this app from Telegram.');
      return;
    }
    await performLogin(telegramUser, false);
  };

  const performLogin = async (user: any, isAutoLogin: boolean = false) => {
    if (!isAutoLogin) {
      setLoading(true);
      setError('');
    }

    try {
      console.log(`🔐 Performing ${isAutoLogin ? 'auto' : 'manual'} login for telegramId:`, user.id);
      
      // Scenario 1: Try to get existing user
      let response = await fetch(`/api/users?telegramId=${user.id}`);
      let data = await response.json();
      
      console.log('📊 API Response:', data);
      
      // Scenario 2: User exists - login directly
      if (response.ok && data.success && data.data) {
        console.log('✅ User found in database!');
        const userData = {
          id: data.data.id,
          telegramId: data.data.telegramId,
          username: data.data.username,
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          balance: data.data.balance,
          level: data.data.level,
          referralCode: data.data.referralCode
        };
        
        // Use auth context to login
        login(userData);
        
        console.log('🚀 Redirecting to /mini-app...');
        // Redirect immediately with window.location for clean navigation
        window.location.href = '/mini-app';
        return;
      }
      
      // Scenario 3: User doesn't exist - create new account
      console.log('⚠️ User not found, creating new account...');
      response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: String(user.id),
          username: user.username || `user_${user.id}`,
          firstName: user.first_name,
          lastName: user.last_name,
          languageCode: user.language_code || 'en',
        }),
      });

      data = await response.json();
      console.log('📊 Create User Response:', data);
      
      // User created successfully
      if (response.ok && data.success && data.data) {
        console.log('✅ User created successfully!');
        const userData = {
          id: data.data.id,
          telegramId: data.data.telegramId,
          username: data.data.username,
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          balance: data.data.balance,
          level: data.data.level,
          referralCode: data.data.referralCode
        };
        
        // Use auth context to login
        login(userData);
        
        console.log('🚀 Redirecting to /mini-app...');
        // Redirect immediately with window.location for clean navigation
        window.location.href = '/mini-app';
        return;
      }
      
      // Scenario 4: API failed
      console.error('❌ API failed:', data.error || 'Unknown error');
      
      if (!isAutoLogin) {
        setError(`Failed to ${response.status === 404 ? 'find or create' : 'login'} user. Please try again.`);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      
      if (!isAutoLogin) {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      if (!isAutoLogin) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4 animate-pulse">
            <Shield className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold mb-2">بوت صدام الولي</h1>
          <p className="text-purple-300">مرحباً بك في بوت المكافآت</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <div className="p-8">
            {telegramUser ? (
              <>
                {/* User Info */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold mb-1">
                    {telegramUser.first_name} {telegramUser.last_name}
                  </h2>
                  <p className="text-gray-400">@{telegramUser.username || 'user'}</p>
                </div>

                {/* Login Button */}
                <Button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      جارٍ تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      تسجيل الدخول عبر تليجرام
                    </>
                  )}
                </Button>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-200 text-sm text-center">{error}</p>
                  </div>
                )}

                {/* Info */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>✓ مصادقة آمنة عبر تليجرام</p>
                    <p>✓ بياناتك آمنة ومشفرة</p>
                    <p>✓ لا حاجة لكلمة مرور</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-400" />
                <p className="text-gray-400">جارٍ تحميل بيانات تليجرام...</p>
                <p className="text-sm text-gray-500 mt-2">
                  تأكد من فتح التطبيق من داخل تليجرام
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>بتسجيل الدخول، أنت توافق على شروط الخدمة</p>
        </div>
      </div>
    </div>
  );
}
