'use client';

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
  description: string;
  reward: number;
  difficulty: string;
  category: string;
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

  const completeTask = async (taskId: string) => {
    if (!user) {
      console.error('❌ No user found');
      return;
    }
    
    try {
      console.log('📤 Completing task:', taskId, 'for user:', user.id);
      
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,  // Use database user ID
          verified: false 
        })
      });
      
      const data = await response.json();
      console.log('📦 Task completion response:', data);
      
      if (response.ok && data.success) {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert(`✅ تم إكمال المهمة!\n🪙 ربحت ${data.data.rewardAmount} عملة`);
        }
        loadTasks(); // Reload tasks
      } else {
        const errorMsg = data.error || 'فشل إكمال المهمة';
        console.error('❌ Task completion failed:', errorMsg);
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert(`❌ ${errorMsg}`);
        }
      }
    } catch (error) {
      console.error('❌ Error completing task:', error);
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('❌ حدث خطأ. حاول مرة أخرى.');
      }
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
                        onClick={() => completeTask(task.id)}
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
