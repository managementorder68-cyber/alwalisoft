'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Target, Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight,
  Coins, Clock, CheckCircle, XCircle, TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  name: string;
  description: string;
  reward: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  isActive: boolean;
  completionCount: number;
  createdAt: string;
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?limit=50&active=all&_t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      console.log('📊 Loading tasks for admin...');
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Tasks data:', data);
        
        if (data.success && data.data.tasks) {
          setTasks(data.data.tasks || []);
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}/toggle`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        loadTasks(); // Reload tasks
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTask = async (taskId: string, taskName: string) => {
    if (!confirm(`هل أنت متأكد من حذف المهمة "${taskName}"؟\nهذا الإجراء لا يمكن التراجع عنه.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('✅ تم حذف المهمة بنجاح');
        loadTasks(); // Reload tasks
      } else {
        alert('❌ فشل حذف المهمة');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('❌ حدث خطأ أثناء حذف المهمة');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesDifficulty = filterDifficulty === 'all' || task.difficulty === filterDifficulty;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && task.isActive) ||
      (filterStatus === 'inactive' && !task.isActive);
    
    return matchesDifficulty && matchesStatus;
  });

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => t.isActive).length,
    completed: tasks.reduce((sum, t) => sum + (t.completionCount || 0), 0),
    totalRewards: tasks.reduce((sum, t) => sum + (t.reward * (t.completionCount || 0)), 0)
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-500/20 text-green-400';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400';
      case 'HARD': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'سهل';
      case 'MEDIUM': return 'متوسط';
      case 'HARD': return 'صعب';
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="text-white">
                  <ArrowLeft className="w-6 h-6" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <Target className="w-7 h-7 text-green-400" />
                  إدارة المهام
                </h1>
                <p className="text-purple-300 text-sm">
                  {filteredTasks.length} مهمة
                </p>
              </div>
            </div>
            <Link href="/admin/tasks/create">
              <Button 
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                مهمة جديدة
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 border-purple-500/50">
            <div className="p-4">
              <Target className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-purple-200">إجمالي المهام</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/30 to-green-800/30 border-green-500/50">
            <div className="p-4">
              <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-green-200">مهمة نشطة</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600/30 to-blue-800/30 border-blue-500/50">
            <div className="p-4">
              <TrendingUp className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-2xl font-bold">{stats.completed.toLocaleString()}</p>
              <p className="text-sm text-blue-200">مرة اكتمال</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-600/30 to-yellow-800/30 border-yellow-500/50">
            <div className="p-4">
              <Coins className="w-8 h-8 text-yellow-400 mb-2" />
              <p className="text-2xl font-bold">{stats.totalRewards.toLocaleString()}</p>
              <p className="text-sm text-yellow-200">مكافآت مُوزعة</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-6">
          <div className="p-4">
            <div className="flex gap-4">
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">جميع المستويات</option>
                <option value="EASY">سهل</option>
                <option value="MEDIUM">متوسط</option>
                <option value="HARD">صعب</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشطة</option>
                <option value="inactive">غير نشطة</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">جارٍ تحميل المهام...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <div className="p-12 text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">لا توجد مهام</p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة أول مهمة
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold">{task.name}</h3>
                        {task.isActive ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(task.difficulty)}`}>
                          {getDifficultyLabel(task.difficulty)}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300">
                          {task.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="font-bold">{task.reward.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span>{task.completionCount || 0} مرة</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                    <Button
                      size="sm"
                      onClick={() => toggleTaskStatus(task.id, task.isActive)}
                      className={task.isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}
                    >
                      {task.isActive ? <ToggleRight className="w-4 h-4 mr-1" /> : <ToggleLeft className="w-4 h-4 mr-1" />}
                      {task.isActive ? 'نشط' : 'معطّل'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-400 hover:bg-blue-500/20"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      عرض
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-400 hover:bg-green-500/20"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      حذف
                    </Button>
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
