'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle2, Clock, Coins, Target } from 'lucide-react';
import Link from 'next/link';

interface AdTask {
  id: string;
  title: string;
  description: string;
  reward: number;
  requiredAds: number;
  progress: number;
  completed: boolean;
}

interface AdTasksWidgetProps {
  userId: string;
  compact?: boolean;
  className?: string;
}

/**
 * Ad Tasks Widget Component
 * يعرض مهام الإعلانات مع التقدم
 */
export function AdTasksWidget({ userId, compact = false, className = '' }: AdTasksWidgetProps) {
  const [tasks, setTasks] = useState<AdTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/ads/tasks?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Error loading ad tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={`bg-white/5 backdrop-blur-md border-white/10 ${className}`}>
        <div className="p-4 text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-pulse" />
          <p className="text-sm text-gray-400">جارٍ التحميل...</p>
        </div>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return null;
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const totalRewards = tasks.reduce((sum, t) => sum + (t.completed ? t.reward : 0), 0);

  if (compact) {
    // Compact view
    return (
      <Card className={`bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-purple-600/20 backdrop-blur-md border-purple-500/30 ${className}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-purple-600/30 p-2 rounded-lg">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">مهام الإعلانات</h3>
                <p className="text-xs text-purple-300">
                  {completedCount} / {tasks.length} مكتمل
                </p>
              </div>
            </div>
            <Link href="/mini-app/ads">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Play className="w-4 h-4 mr-1" />
                شاهد
              </Button>
            </Link>
          </div>

          {totalRewards > 0 && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-2 flex items-center justify-center gap-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold text-yellow-400">
                +{totalRewards.toLocaleString()} عملة مكتسبة!
              </span>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Full view
  return (
    <Card className={`bg-white/5 backdrop-blur-md border-white/10 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <Target className="w-5 h-5 text-purple-400" />
            مهام الإعلانات
          </h3>
          <Link href="/mini-app/ads">
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500">
              <Play className="w-4 h-4 mr-1" />
              شاهد إعلان
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div 
              key={task.id}
              className={`p-3 rounded-lg border transition-all ${
                task.completed 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-white/5 border-white/10 hover:border-purple-500/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm flex items-center gap-2 text-white">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    )}
                    <span>{task.title}</span>
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">{task.description}</p>
                </div>
                <div className={`ml-2 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 whitespace-nowrap ${
                  task.completed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  <Coins className="w-3 h-3" />
                  {task.reward}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      task.completed 
                        ? 'bg-green-500' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600'
                    }`}
                    style={{ width: `${(task.progress / task.requiredAds) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-gray-400 whitespace-nowrap">
                  {task.progress}/{task.requiredAds}
                </span>
              </div>
            </div>
          ))}
        </div>

        {completedCount === tasks.length && (
          <div className="mt-4 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg text-center">
            <p className="text-green-400 font-bold text-sm">
              🎉 أحسنت! أكملت جميع مهام الإعلانات اليوم!
            </p>
            <p className="text-xs text-green-300 mt-1">
              إجمالي المكافآت: {totalRewards.toLocaleString()} عملة
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
