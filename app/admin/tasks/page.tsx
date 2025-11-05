'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Plus, Edit, Trash2, Target, CheckCircle, 
  XCircle, Clock, Coins, Filter
} from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  name: string;
  description: string;
  reward: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  type: string;
  isActive: boolean;
  completionsCount: number;
  maxCompletions: number | null;
  createdAt: string;
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reward: 100,
    difficulty: 'EASY',
    category: 'SOCIAL',
    type: 'TELEGRAM',
    requirement: '',
    isActive: true
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks?limit=100');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTasks(data.data.tasks || []);
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return task.isActive;
    if (filter === 'inactive') return !task.isActive;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('تم إنشاء المهمة بنجاح!');
        setShowAddModal(false);
        loadTasks();
        setFormData({
          name: '',
          description: '',
          reward: 100,
          difficulty: 'EASY',
          category: 'SOCIAL',
          type: 'TELEGRAM',
          requirement: '',
          isActive: true
        });
      } else {
        const data = await response.json();
        alert(data.message || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('حدث خطأ في إنشاء المهمة');
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error('Error toggling task:', error);
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
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">إدارة المهام</h1>
              <p className="text-sm text-purple-300">إنشاء وتعديل المهام</p>
            </div>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            مهمة جديدة
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Stats & Filters */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card 
            onClick={() => setFilter('all')}
            className={`cursor-pointer transition-all ${
              filter === 'all' 
                ? 'bg-purple-600 border-purple-400' 
                : 'bg-white/5 border-white/10'
            } backdrop-blur-md hover:scale-105`}
          >
            <div className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{tasks.length}</p>
              <p className="text-xs text-gray-300">جميع المهام</p>
            </div>
          </Card>

          <Card 
            onClick={() => setFilter('active')}
            className={`cursor-pointer transition-all ${
              filter === 'active' 
                ? 'bg-green-600 border-green-400' 
                : 'bg-white/5 border-white/10'
            } backdrop-blur-md hover:scale-105`}
          >
            <div className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="text-2xl font-bold">{tasks.filter(t => t.isActive).length}</p>
              <p className="text-xs text-gray-300">نشطة</p>
            </div>
          </Card>

          <Card 
            onClick={() => setFilter('inactive')}
            className={`cursor-pointer transition-all ${
              filter === 'inactive' 
                ? 'bg-red-600 border-red-400' 
                : 'bg-white/5 border-white/10'
            } backdrop-blur-md hover:scale-105`}
          >
            <div className="p-4 text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p className="text-2xl font-bold">{tasks.filter(t => !t.isActive).length}</p>
              <p className="text-xs text-gray-300">موقوفة</p>
            </div>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <div className="p-4 text-center">
              <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold">
                {tasks.reduce((sum, t) => sum + (t.completionsCount || 0), 0)}
              </p>
              <p className="text-xs text-gray-300">إنجازات</p>
            </div>
          </Card>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">جاري التحميل...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{task.name}</h3>
                        {task.isActive ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                            نشطة
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                            موقوفة
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                          {task.category}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                          {task.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="font-bold">{task.reward.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>{task.completionsCount || 0} إنجاز</span>
                        </div>
                        {task.maxCompletions && (
                          <div className="flex items-center gap-1 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>حد: {task.maxCompletions}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => toggleTaskStatus(task.id, task.isActive)}
                      variant={task.isActive ? "destructive" : "default"}
                      className="text-xs"
                    >
                      {task.isActive ? (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          إيقاف
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          تفعيل
                        </>
                      )}
                    </Button>
                    
                    <Button size="sm" variant="ghost" className="text-xs">
                      <Edit className="w-3 h-3 mr-1" />
                      تعديل
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {filteredTasks.length === 0 && (
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <div className="p-8 text-center">
                  <Target className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400">لا توجد مهام</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-gradient-to-br from-purple-900 to-blue-900 border-purple-500/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">إنشاء مهمة جديدة</h2>
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="ghost"
                  size="icon"
                >
                  <XCircle className="w-6 h-6" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم المهمة</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 outline-none"
                    placeholder="مثال: انضم إلى قناتنا"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الوصف</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 outline-none"
                    rows={3}
                    placeholder="وصف تفصيلي للمهمة..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">المكافأة</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.reward}
                      onChange={(e) => setFormData({...formData, reward: Number(e.target.value)})}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">الصعوبة</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 outline-none"
                    >
                      <option value="EASY">سهلة</option>
                      <option value="MEDIUM">متوسطة</option>
                      <option value="HARD">صعبة</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الفئة</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 outline-none"
                    >
                      <option value="SOCIAL">اجتماعي</option>
                      <option value="ENGAGEMENT">تفاعل</option>
                      <option value="REFERRAL">إحالة</option>
                      <option value="DAILY">يومي</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">النوع</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 outline-none"
                    >
                      <option value="TELEGRAM">تيليجرام</option>
                      <option value="YOUTUBE">يوتيوب</option>
                      <option value="TWITTER">تويتر</option>
                      <option value="OTHER">أخرى</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">المتطلبات (اختياري)</label>
                  <input
                    type="text"
                    value={formData.requirement}
                    onChange={(e) => setFormData({...formData, requirement: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 outline-none"
                    placeholder="مثال: @channel_username"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm">تفعيل المهمة فوراً</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 h-12"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    إنشاء المهمة
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    variant="ghost"
                    className="flex-1 h-12"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
