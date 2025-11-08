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
  postUrl?: string;
  videoUrl?: string;
  channelUsername?: string;
  verificationData?: any;
  isCompleted?: boolean;
}

function TasksContent() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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
    console.log('   ID:', task.id);
    console.log('   Name:', task.name);
    console.log('   Category:', task.category);
    console.log('   postUrl:', task.postUrl);
    console.log('   verificationData:', task.verificationData);
    
    if (!user) {
      console.error('❌ No user');
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('⚠️ الرجاء تسجيل الدخول أولاً');
      } else {
        alert('⚠️ الرجاء تسجيل الدخول أولاً');
      }
      return;
    }
    
    // فتح الرابط إذا كان موجوداً
    const linkToOpen = task.postUrl || task.videoUrl;
    
    if (linkToOpen) {
      console.log('🔗 Opening link:', linkToOpen);
      if (typeof window !== 'undefined') {
        window.open(linkToOpen, '_blank');
      }
    } else {
      console.log('ℹ️ No link to open');
    }
    
    // تحديد إذا كانت المهمة تحتاج تأكيد
    const needsConfirmation = [
      'CHANNEL_SUBSCRIPTION', 
      'GROUP_JOIN', 
      'SOCIAL_FOLLOW',
      'VIDEO_WATCH',
      'POST_INTERACTION'
    ].includes(task.category);
    
    if (needsConfirmation && linkToOpen) {
      // انتظر ثانيتين ثم اطلب تأكيد
      console.log('⏳ Waiting 2 seconds before confirmation...');
      setTimeout(() => {
        const confirmMsg = 'هل أكملت المهمة؟\n\n' + 
          (task.channelUsername ? `قناة: @${task.channelUsername}\n` : '') +
          'اضغط OK للمتابعة';
        
        console.log('❓ Asking for confirmation');
        
        if (typeof window !== 'undefined') {
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showConfirm(confirmMsg, (confirmed) => {
              if (confirmed) {
                console.log('✅ User confirmed');
                completeTask(task.id);
              } else {
                console.log('❌ User cancelled');
              }
            });
          } else {
            if (confirm(confirmMsg)) {
              console.log('✅ User confirmed');
              completeTask(task.id);
            } else {
              console.log('❌ User cancelled');
            }
          }
        }
      }, 2000);
    } else {
      // إكمال فوري للمهام البسيطة
      console.log('⚡ Auto-completing task (no confirmation needed)');
      setTimeout(() => {
        completeTask(task.id);
      }, 500);
    }
  };

  const completeTask = async (taskId: string) => {
    console.log('━'.repeat(50));
    console.log('🚀 completeTask started');
    console.log('   taskId:', taskId);
    console.log('   user:', user);
    
    if (!user) {
      console.error('❌ No user');
      alert('⚠️ الرجاء تسجيل الدخول');
      return;
    }
    
    let userId = user.id;
    console.log('   userId from context:', userId);
    console.log('   telegramId:', user.telegramId);
    
    // إذا لم يكن userId موجوداً، جلبه من API
    if (!userId && user.telegramId) {
      console.log('⚠️ No userId, fetching from API...');
      try {
        const userResponse = await fetch(`/api/users?telegramId=${user.telegramId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success && userData.data?.id) {
            userId = userData.data.id;
            console.log('✅ Got userId from API:', userId);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching userId:', error);
      }
    }
    
    if (!userId) {
      console.error('❌ Still no userId!');
      alert('❌ فشل التحقق من المستخدم. أعد تسجيل الدخول');
      return;
    }
    
    console.log('✅ Final userId:', userId);
    console.log('📤 Sending POST request...');
    
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userId,
          verified: false 
        })
      });
      
      console.log('📊 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', JSON.stringify(data, null, 2));
      
      if (response.ok && data.success) {
        const reward = data.data?.rewardAmount || data.data?.reward || 0;
        console.log('✅✅✅ Task completed! Reward:', reward);
        
        const message = `✅ تم إكمال المهمة!\n🪙 ربحت ${reward.toLocaleString()} عملة`;
        
        if (typeof window !== 'undefined') {
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showAlert(message);
          } else {
            alert(message);
          }
        }
        
        setTimeout(() => loadTasks(), 500);
      } else {
        const errorMsg = data.error || data.message || 'فشل';
        console.error('❌❌❌ Task failed:', errorMsg);
        console.error('Full data:', data);
        
        let fullMessage = `❌ ${errorMsg}`;
        
        if (data.data) {
          if (data.data.currentCount !== undefined && data.data.required !== undefined) {
            fullMessage += `\n\n📊 حالياً: ${data.data.currentCount}\n🎯 مطلوب: ${data.data.required}`;
          }
          if (data.data.currentBalance !== undefined) {
            fullMessage += `\n\n💰 رصيدك: ${data.data.currentBalance.toLocaleString()}\n🎯 مطلوب: ${data.data.required.toLocaleString()}`;
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
      console.error('❌❌❌ Exception:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'N/A'
      });
      
      alert('❌ حدث خطأ. تحقق من Console (F12)');
    }
    
    console.log('━'.repeat(50));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">جارٍ تحميل المهام...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-black/30 backdrop-blur-lg border-b border-white/10 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/mini-app">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Target className="w-7 h-7" />
                المهام
              </h1>
              <p className="text-purple-300 text-sm">{tasks.length} مهمة متاحة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {tasks.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-md border-white/10 p-12 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">لا توجد مهام متاحة حالياً</p>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{task.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="font-bold text-yellow-400">{task.reward.toLocaleString()}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-purple-500/20 px-2 py-1 rounded">
                        {task.category}
                      </span>
                    </div>
                  </div>
                </div>

                {task.isCompleted ? (
                  <div className="w-full">
                    <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-3 text-center">
                      <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-400" />
                      <p className="text-green-400 font-bold">✅ تم الإنجاز بنجاح</p>
                      <p className="text-xs text-green-300 mt-1">لقد ربحت {task.reward.toLocaleString()} عملة</p>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={() => startTask(task)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/50"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    ابدأ المهمة
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
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
