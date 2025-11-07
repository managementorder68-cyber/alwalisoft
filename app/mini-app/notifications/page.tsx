'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Bell, BellOff, Check, X, Gift, 
  Trophy, Users, Target, Star, Trash2, CheckCheck
} from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/protected-route';

interface Notification {
  id: string;
  type: 'TASK' | 'REWARD' | 'REFERRAL' | 'ACHIEVEMENT' | 'SYSTEM' | 'GAME';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

function NotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // جلب من API الحقيقي
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        setLoading(false);
        return;
      }
      
      const response = await fetch(`/api/notifications?userId=${user.id}&limit=50`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data.notifications || []);
        }
      } else {
        console.error('Failed to load notifications:', response.status);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      });
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) return;
      
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteAllRead = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) return;
      
      const response = await fetch(`/api/notifications?userId=${user.id}&readOnly=true`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => !n.isRead));
      }
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK':
        return <Target className="w-5 h-5 text-blue-400" />;
      case 'REWARD':
        return <Gift className="w-5 h-5 text-yellow-400" />;
      case 'REFERRAL':
        return <Users className="w-5 h-5 text-green-400" />;
      case 'ACHIEVEMENT':
        return <Trophy className="w-5 h-5 text-orange-400" />;
      case 'GAME':
        return <Star className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'TASK':
        return 'bg-blue-500/20';
      case 'REWARD':
        return 'bg-yellow-500/20';
      case 'REFERRAL':
        return 'bg-green-500/20';
      case 'ACHIEVEMENT':
        return 'bg-orange-500/20';
      case 'GAME':
        return 'bg-purple-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/mini-app">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">🔔 الإشعارات</h1>
              <p className="text-sm text-purple-300">
                {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'لا يوجد إشعارات جديدة'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-24">
        {/* Actions */}
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
            الكل ({notifications.length})
          </Button>
          <Button
            onClick={() => setFilter('unread')}
            variant={filter === 'unread' ? 'default' : 'ghost'}
            className={`flex-1 ${
              filter === 'unread'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                : 'bg-white/5'
            }`}
            size="sm"
          >
            غير المقروءة ({unreadCount})
          </Button>
        </div>

        {unreadCount > 0 && (
          <div className="flex gap-2 mb-6">
            <Button
              onClick={markAllAsRead}
              className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/50"
              size="sm"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              وضع علامة مقروء على الكل
            </Button>
            <Button
              onClick={deleteAllRead}
              className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/50"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              حذف المقروءة
            </Button>
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">جاري التحميل...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <div className="p-8 text-center">
              {filter === 'unread' ? (
                <>
                  <BellOff className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400">لا يوجد إشعارات غير مقروءة</p>
                  <p className="text-sm text-gray-500 mt-2">أحسنت! لقد قرأت جميع إشعاراتك 🎉</p>
                </>
              ) : (
                <>
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400">لا يوجد إشعارات</p>
                  <p className="text-sm text-gray-500 mt-2">ستظهر إشعاراتك هنا</p>
                </>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <Card
                key={notification.id}
                className={`${
                  notification.isRead
                    ? 'bg-white/5 border-white/10'
                    : 'bg-purple-600/10 border-purple-500/50'
                } backdrop-blur-md hover:bg-white/10 transition-all`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full ${getNotificationBg(notification.type)} flex items-center justify-center flex-shrink-0`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold">{notification.title}</h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-1.5"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString('ar', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        {!notification.isRead && (
                          <Button
                            onClick={() => markAsRead(notification.id)}
                            size="sm"
                            className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/50"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            وضع علامة مقروء
                          </Button>
                        )}
                        {notification.actionUrl && (
                          <Link href={notification.actionUrl}>
                            <Button
                              size="sm"
                              className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/50"
                            >
                              عرض
                            </Button>
                          </Link>
                        )}
                        <Button
                          onClick={() => deleteNotification(notification.id)}
                          size="sm"
                          className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/50 mr-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold mb-2">💡 نصيحة</h3>
                <p className="text-sm text-gray-300">
                  سنرسل لك إشعارات حول المكافآت الجديدة، المهام، الإنجازات، والمزيد. 
                  تأكد من تفعيل الإشعارات في إعدادات Telegram للبقاء على اطلاع دائم!
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}
