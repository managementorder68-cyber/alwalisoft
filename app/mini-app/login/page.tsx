'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn, UserCheck, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [telegramUser, setTelegramUser] = useState<any>(null);

  useEffect(() => {
    // Check if already logged in
    const storedUser = localStorage.getItem('telegram_user');
    if (storedUser) {
      router.push('/mini-app');
      return;
    }

    // Initialize Telegram Web App
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Set theme
      tg.setHeaderColor('#000000');
      tg.setBackgroundColor('#000000');
      
      // Get user data
      const initData = tg.initDataUnsafe;
      if (initData.user) {
        setTelegramUser(initData.user);
      }
    }
  }, [router]);

  const handleLogin = async () => {
    if (!telegramUser) {
      setError('No Telegram user data available. Please open this app from Telegram.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Try to get user from database
      let response = await fetch(`/api/users?telegramId=${telegramUser.id}`);
      let data = await response.json();
      
      // If user doesn't exist, create them
      if (!response.ok || !data.success || !data.data) {
        // Create new user
        response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegramId: String(telegramUser.id),
            username: telegramUser.username || `user_${telegramUser.id}`,
            firstName: telegramUser.first_name,
            lastName: telegramUser.last_name,
            languageCode: telegramUser.language_code || 'en',
          }),
        });

        data = await response.json();
        
        if (!response.ok || !data.success) {
          setError('Failed to create account. Please try again or contact support.');
          return;
        }
      }
      
      // User exists or was created successfully
      if (data.success && data.data) {
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
        
        localStorage.setItem('telegram_user', JSON.stringify(userData));
        
        // Success animation
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert('✅ تم تسجيل الدخول بنجاح!');
        }
        
        // Redirect to main app
        setTimeout(() => {
          router.push('/mini-app');
        }, 500);
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
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
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Login with Telegram
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
                    <p>✓ Secure Telegram authentication</p>
                    <p>✓ Your data is safe and encrypted</p>
                    <p>✓ No password required</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-400" />
                <p className="text-gray-400">Loading Telegram data...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Please make sure you opened this app from Telegram
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>By logging in, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
}
