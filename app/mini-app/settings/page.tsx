'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, User, Globe, Bell, Shield, Info,
  ChevronRight, Moon, Sun, Volume2, VolumeX, Lock, Save
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';

function SettingsContent() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('ar');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    if (user?.id) {
      loadSettings();
    }
  }, [user]);
  
  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/settings?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setNotifications(data.data.notificationsEnabled ?? true);
          setSound(data.data.soundEnabled ?? true);
          setDarkMode(data.data.darkMode ?? true);
          setLanguage(data.data.language || 'ar');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  const saveSettings = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          notificationsEnabled: notifications,
          soundEnabled: sound,
          darkMode,
          language
        })
      });
      
      if (response.ok) {
        setHasChanges(false);
        alert('تم حفظ الإعدادات بنجاح! ✅');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSettingChange = (setter: (value: boolean) => void, value: boolean) => {
    setter(value);
    setHasChanges(true);
  };

  const handleLogout = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showConfirm(
        'هل أنت متأكد من تسجيل الخروج؟',
        (confirmed) => {
          if (confirmed) {
            logout();
          }
        }
      );
    } else {
      if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        logout();
      }
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
            <h1 className="text-2xl font-bold">⚙️ الإعدادات</h1>
            <p className="text-sm text-purple-300">إدارة حسابك وتفضيلاتك</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-24">
        {/* User Info */}
        <Card className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-purple-500/50 mb-6">
          <div className="p-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{user?.firstName || 'المستخدم'}</h3>
              <p className="text-sm text-purple-200">@{user?.username || 'username'}</p>
              <p className="text-xs text-purple-300 mt-1">
                ID: {user?.telegramId}
              </p>
            </div>
          </div>
        </Card>

        {/* Settings Sections */}
        <div className="space-y-4">
          {/* Account Settings */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-3 px-2">الحساب</h3>
            <Card className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden">
              <Link href="/mini-app/profile">
                <button className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">الملف الشخصي</p>
                      <p className="text-xs text-gray-400">عرض وتعديل معلوماتك</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </Link>

              <div className="h-px bg-white/10"></div>

              <button className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">الخصوصية والأمان</p>
                    <p className="text-xs text-gray-400">إدارة خصوصيتك</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </Card>
          </div>

          {/* App Settings */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-3 px-2">التطبيق</h3>
            <Card className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden">
              <button 
                onClick={() => handleSettingChange(setNotifications, !notifications)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">الإشعارات</p>
                    <p className="text-xs text-gray-400">
                      {notifications ? 'مفعّلة' : 'معطّلة'}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  notifications ? 'bg-green-500' : 'bg-gray-600'
                } relative`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications ? 'right-1' : 'left-1'
                  }`}></div>
                </div>
              </button>

              <div className="h-px bg-white/10"></div>

              <button 
                onClick={() => handleSettingChange(setSound, !sound)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    {sound ? (
                      <Volume2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-bold">الأصوات</p>
                    <p className="text-xs text-gray-400">
                      {sound ? 'مفعّلة' : 'معطّلة'}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  sound ? 'bg-green-500' : 'bg-gray-600'
                } relative`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    sound ? 'right-1' : 'left-1'
                  }`}></div>
                </div>
              </button>

              <div className="h-px bg-white/10"></div>

              <button 
                onClick={() => handleSettingChange(setDarkMode, !darkMode)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    {darkMode ? (
                      <Moon className="w-5 h-5 text-indigo-400" />
                    ) : (
                      <Sun className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-bold">الوضع الداكن</p>
                    <p className="text-xs text-gray-400">
                      {darkMode ? 'مفعّل' : 'معطّل'}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  darkMode ? 'bg-indigo-500' : 'bg-gray-600'
                } relative`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    darkMode ? 'right-1' : 'left-1'
                  }`}></div>
                </div>
              </button>

              <div className="h-px bg-white/10"></div>

              <button className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-pink-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">اللغة</p>
                    <p className="text-xs text-gray-400">
                      {language === 'ar' ? 'العربية' : 'English'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </Card>
          </div>

          {/* Info & Support */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-3 px-2">المعلومات والدعم</h3>
            <Card className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden">
              <Link href="/mini-app/help">
                <button className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Info className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">المساعدة والأسئلة الشائعة</p>
                      <p className="text-xs text-gray-400">احصل على المساعدة</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </Link>

              <div className="h-px bg-white/10"></div>

              <button className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                    <Info className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">عن التطبيق</p>
                    <p className="text-xs text-gray-400">الإصدار 2.0.0</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </Card>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <Card className="bg-gradient-to-r from-green-600 to-green-700 border-green-500/50 overflow-hidden animate-pulse">
              <button 
                onClick={saveSettings}
                disabled={saving}
                className="w-full p-4 flex items-center justify-center gap-3 hover:from-green-700 hover:to-green-800 transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5 text-white" />
                <span className="font-bold text-white">
                  {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
                </span>
              </button>
            </Card>
          )}

          {/* Logout */}
          <Card className="bg-red-600/20 border-red-500/50 overflow-hidden">
            <button 
              onClick={handleLogout}
              className="w-full p-4 flex items-center justify-center gap-3 hover:bg-red-600/30 transition-colors"
            >
              <Lock className="w-5 h-5 text-red-400" />
              <span className="font-bold text-red-400">تسجيل الخروج</span>
            </button>
          </Card>
        </div>

        {/* Version Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>بوت صدام الولي</p>
          <p className="text-xs mt-1">الإصدار 2.0.0 © 2025</p>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
