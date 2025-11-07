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
    // فتح الرابط إذا كان موجود
    if (task.actionUrl) {
      window.open(task.actionUrl, '_blank');
    }
    
    // عرض modal للتحقق إذا كانت المهمة تتطلب تحقق
    if (['TWITTER_FOLLOW', 'TELEGRAM_JOIN', 'YOUTUBE_SUBSCRIBE'].includes(task.type)) {
      setVerifyingTask(task);
    } else {
      // إكمال مباشر للمهام البسيطة
      completeTaskDirect(task.id);
    }
  };
  
  const completeTaskDirect = async (taskId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          verified: false 
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert(`✅ تم إكمال المهمة!\n🪙 ربحت ${data.data.rewardAmount} عملة`);
        }
        loadTasks();
      } else {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert(`❌ ${data.error || 'فشل إكمال المهمة'}`);
        }
      }
    } catch (error) {
      console.error('Error completing task:', error);
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

                    {!task.isCompleted && (
                      <Button
                        onClick={() => startTask(task)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
