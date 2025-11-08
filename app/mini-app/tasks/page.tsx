'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, CheckCircle, Clock, Coins, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';

interface Task {
  id: string;
  name: string;
  title?: string;
  description: string;
  reward: number;
  difficulty: string;
  category: string;
  type: string;
  actionUrl?: string;
  postUrl?: string;
  videoUrl?: string;
  channelUsername?: string;
  groupId?: string;
  verificationData?: any;
  isCompleted?: boolean;
}

function TasksContent() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingTask, setVerifyingTask] = useState<Task | null>(null);
  const [verificationInput, setVerificationInput] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const userId = user?.id;
      const url = userId 
        ? `/api/tasks?active=true&limit=20&userId=${userId}`
        : '/api/tasks?active=true&limit=20';
        
      console.log('🔍 Loading tasks from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Tasks loaded:', data);
        
        if (data.success) {
          setTasks(data.data.tasks || data.data || []);
        }
      } else {
        console.error('❌ Failed to load tasks:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTask = (task: Task) => {
    console.log('🎯 Starting task:', task);
    
    if (!user) {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('⚠️ الرجاء تسجيل الدخول أولاً');
      } else {
        alert('⚠️ الرجاء تسجيل الدخول أولاً');
      }
      return;
    }
    
    // تحديد الرابط المناسب (postUrl أو videoUrl أو actionUrl)
    const linkToOpen = task.postUrl || task.videoUrl || task.actionUrl;
    
    // فتح الرابط إذا كان موجود
    if (linkToOpen) {
      console.log('🔗 Opening link:', linkToOpen);
      if (typeof window !== 'undefined') {
        window.open(linkToOpen, '_blank');
      }
    } else {
      console.log('ℹ️ No link to open for this task');
    }
    
    // تحديد نوع المهمة بناءً على category
    const needsVerification = [
      'CHANNEL_SUBSCRIPTION', 
      'GROUP_JOIN', 
      'SOCIAL_FOLLOW',
      'VIDEO_WATCH',
      'POST_INTERACTION'
    ].includes(task.category);
    
    if (needsVerification && linkToOpen) {
      // إعطاء وقت للمستخدم لفتح الرابط وإكمال المهمة
      setTimeout(() => {
        const confirmMsg = 'هل أكملت المهمة؟\n\n' + 
          (task.channelUsername ? `قناة: @${task.channelUsername}\n` : '') +
          'اضغط OK للحصول على المكافأة';
        
        if (typeof window !== 'undefined') {
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showConfirm(confirmMsg, (confirmed) => {
              if (confirmed) {
                completeTaskDirect(task.id);
              }
            });
          } else {
            if (confirm(confirmMsg)) {
              completeTaskDirect(task.id);
            }
          }
        }
      }, 2000);
    } else {
      // إكمال مباشر للمهام البسيطة (مثل تسجيل الدخول)
      setTimeout(() => {
        completeTaskDirect(task.id);
      }, 500);
    }
  };
  
  const completeTaskDirect = async (taskId: string) => {
    console.log('🎯 completeTaskDirect called with taskId:', taskId);
    console.log('👤 Current user:', user);
    
    if (!user) {
      console.error('❌ No user found');
      alert('⚠️ الرجاء تسجيل الدخول أولاً');
      return;
    }
    
    // التأكد من وجود userId (UUID)
    let userId = user.id;
    console.log('🔑 Initial userId:', userId);
    console.log('📱 Telegram ID:', user.telegramId);
    
    if (!userId) {
      console.log('⚠️ No userId, will try to fetch from API');
      if (!user.telegramId) {
        console.error('❌ No telegramId either!');
        alert('❌ بيانات المستخدم غير كاملة، الرجاء إعادة تسجيل الدخول');
        return;
      }
      
      try {
        console.log('🔄 Fetching user data from API...');
        const userResponse = await fetch(`/api/users?telegramId=${user.telegramId}`);
        console.log('📊 User API response status:', userResponse.status);
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('📊 User API data:', userData);
          
          if (userData.success && userData.data?.id) {
            userId = userData.data.id;
            console.log('✅ Got userId from API:', userId);
          } else {
            console.error('❌ Invalid user data structure:', userData);
          }
        } else {
          console.error('❌ Failed to fetch user:', userResponse.status);
        }
      } catch (error) {
        console.error('❌ Error fetching userId:', error);
      }
    }
    
    if (!userId) {
      console.error('❌ Still no valid userId after all attempts');
      alert('❌ فشل التحقق من المستخدم. الرجاء:\n1. مسح Cache\n2. إعادة تسجيل الدخول');
      return;
    }
    
    console.log('✅ Final userId:', userId);
    console.log('🚀 Sending completion request...');
    
    try {
      const requestBody = { 
        userId: userId,
        verified: false 
      };
      console.log('📤 Request body:', requestBody);
      
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (response.ok && data.success) {
        const reward = data.data?.rewardAmount || data.data?.reward || 0;
        console.log('✅ Task completed successfully! Reward:', reward);
        
        const message = `✅ تم إكمال المهمة!\n🪙 ربحت ${reward.toLocaleString()} عملة`;
        if (typeof window !== 'undefined') {
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showAlert(message);
          } else {
            alert(message);
          }
        }
        
        // إعادة تحميل المهام
        console.log('🔄 Reloading tasks...');
        setTimeout(() => loadTasks(), 500);
      } else {
        const errorMsg = data.error || data.message || 'فشل إكمال المهمة';
        console.error('❌ Task completion failed:', errorMsg);
        console.error('❌ Full error data:', data);
        
        // بناء رسالة خطأ مفصلة
        let fullMessage = `❌ ${errorMsg}`;
        
        // إضافة تفاصيل إضافية إن وجدت
        if (data.data) {
          if (data.data.currentCount !== undefined && data.data.required !== undefined) {
            fullMessage += `\n\n📊 حالياً: ${data.data.currentCount}\n🎯 مطلوب: ${data.data.required}`;
          }
          if (data.data.currentBalance !== undefined && data.data.required !== undefined) {
            fullMessage += `\n\n💰 رصيدك: ${data.data.currentBalance.toLocaleString()}\n🎯 مطلوب: ${data.data.required.toLocaleString()}`;
          }
          if (data.data.missingFields && data.data.missingFields.length > 0) {
            fullMessage += `\n\n📝 يجب إكمال: ${data.data.missingFields.join(', ')}`;
          }
        }
        
        if (typeof window !== 'undefined') {
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showAlert(fullMessage);
          } else {
            alert(fullMessage);
          }
        }
      }
    } catch (error) {
      console.error('❌ Exception during task completion:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      const errorMsg = '❌ حدث خطأ أثناء إكمال المهمة. الرجاء المحاولة مرة أخرى.';
      if (typeof window !== 'undefined') {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert(errorMsg);
        } else {
          alert(errorMsg);
        }
      }
    }
  };
  
  const verifyAndComplete = async () => {
    if (!user || !verifyingTask) return;
    
    let verificationData: any = {};
    
    // تجهيز بيانات التحقق حسب نوع المهمة
    switch (verifyingTask.type) {
      case 'TWITTER_FOLLOW':
        verificationData = {
          username: verificationInput,
          targetHandle: verifyingTask.actionUrl?.replace('https://twitter.com/', '') || '',
          taskName: verifyingTask.title || verifyingTask.name
        };
        break;
      
      case 'TELEGRAM_JOIN':
        verificationData = {
          channelUsername: verifyingTask.actionUrl?.replace('https://t.me/', '') || '',
          taskName: verifyingTask.title || verifyingTask.name
        };
        break;
      
      case 'YOUTUBE_SUBSCRIBE':
        verificationData = {
          googleId: verificationInput,
          channelId: verifyingTask.actionUrl?.split('/channel/')[1] || '',
          taskName: verifyingTask.title || verifyingTask.name
        };
        break;
    }
    
    try {
      const response = await fetch('/api/tasks/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          taskId: verifyingTask.id,
          verificationData
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert(`✅ تم التحقق بنجاح!\n🪙 ربحت ${data.data.reward} عملة`);
        }
        setVerifyingTask(null);
        setVerificationInput('');
        loadTasks();
      } else {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert(`❌ ${data.message || 'فشل التحقق'}`);
        }
      }
    } catch (error) {
      console.error('Error verifying task:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-500/20 text-green-400';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400';
      case 'HARD': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
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
            <h1 className="text-2xl font-bold">المهام</h1>
            <p className="text-sm text-purple-300">أكمل المهام لكسب النقاط</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">جارٍ تحميل المهام...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">لا توجد مهام متاحة</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card 
                key={task.id}
                className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{task.name}</h3>
                      <p className="text-sm text-gray-400">{task.description}</p>
                    </div>
                    {task.isCompleted && (
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                      {task.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                      {task.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span className="font-bold text-lg">{task.reward.toLocaleString()}</span>
                      <span className="text-sm text-gray-400">نقطة</span>
                    </div>

                    {task.isCompleted ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-bold">مكتملة</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          console.log('🖱️ Button clicked for task:', task.id);
                          startTask(task);
                        }}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 active:scale-95 transition-transform"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        ابدأ المهمة
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {verifyingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-gradient-to-br from-purple-900 to-blue-900 border-purple-500/50 shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">✅ تحقق من المهمة</h2>
                <button
                  onClick={() => {
                    setVerifyingTask(null);
                    setVerificationInput('');
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300">
                  {verifyingTask.type === 'TWITTER_FOLLOW' && 'الرجاء إدخال اسم حسابك على Twitter:'}
                  {verifyingTask.type === 'TELEGRAM_JOIN' && 'سيتم التحقق تلقائياً من اشتراكك في القناة:'}
                  {verifyingTask.type === 'YOUTUBE_SUBSCRIBE' && 'الرجاء إدخال معرف Google الخاص بك:'}
                </p>

                {/* Input (ليس للـ Telegram) */}
                {verifyingTask.type !== 'TELEGRAM_JOIN' && (
                  <input
                    type="text"
                    value={verificationInput}
                    onChange={(e) => setVerificationInput(e.target.value)}
                    placeholder={
                      verifyingTask.type === 'TWITTER_FOLLOW' 
                        ? '@username' 
                        : 'Your Google ID'
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                )}

                {/* Info */}
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
                  <p className="text-xs text-blue-200">
                    💡 تأكد من إكمال المهمة المطلوبة قبل التحقق
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => {
                      setVerifyingTask(null);
                      setVerificationInput('');
                    }}
                    className="flex-1 bg-white/10 hover:bg-white/20 border-0"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={verifyAndComplete}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-0"
                  >
                    تحقق الآن
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <TasksContent />
    </ProtectedRoute>
  );
}
