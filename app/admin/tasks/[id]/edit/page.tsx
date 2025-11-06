'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface Task {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  difficulty: string;
  reward: number;
  bonusReward?: number;
  minLevel: string;
  maxCompletions?: number;
  requirement?: string;
  channelId?: string;
  channelUsername?: string;
  groupId?: string;
  videoUrl?: string;
  postUrl?: string;
  isActive: boolean;
  isBonus: boolean;
  isFeatured: boolean;
  cooldownMinutes?: number;
  priority: number;
}

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTask(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!task) return;
    
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setTask(prev => prev ? { ...prev, [name]: checked } : null);
    } else if (type === 'number') {
      setTask(prev => prev ? { ...prev, [name]: parseInt(value) || 0 } : null);
    } else {
      setTask(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    
    setSaving(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
      });

      if (response.ok) {
        alert('✅ تم تحديث المهمة بنجاح!');
        router.push('/admin/tasks');
      } else {
        const error = await response.json();
        alert(`❌ خطأ: ${error.error || 'فشل تحديث المهمة'}`);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('❌ حدث خطأ أثناء تحديث المهمة');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">❌ المهمة غير موجودة</p>
          <Link href="/admin/tasks">
            <Button>العودة للمهام</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/tasks">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">تعديل المهمة</h1>
              <p className="text-purple-300 text-sm">{task.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <form onSubmit={handleSubmit}>
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 p-6">
            {/* معلومات أساسية */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 text-purple-300">المعلومات الأساسية</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم المهمة *</label>
                  <input
                    type="text"
                    name="name"
                    value={task.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الوصف *</label>
                  <textarea
                    name="description"
                    value={task.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الفئة *</label>
                    <select
                      name="category"
                      value={task.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                    >
                      <option value="DAILY">يومية</option>
                      <option value="SOCIAL_MEDIA">وسائل التواصل</option>
                      <option value="REFERRAL">إحالة</option>
                      <option value="PROFILE">الملف الشخصي</option>
                      <option value="ACHIEVEMENT">إنجاز</option>
                      <option value="GAME">لعبة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">النوع *</label>
                    <select
                      name="type"
                      value={task.type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                    >
                      <option value="DAILY_CHECK_IN">تسجيل دخول يومي</option>
                      <option value="TELEGRAM_JOIN">انضمام لتليجرام</option>
                      <option value="SOCIAL_SHARE">مشاركة اجتماعية</option>
                      <option value="REFERRAL">إحالة</option>
                      <option value="GAME_PLAY">لعب لعبة</option>
                      <option value="PROFILE_COMPLETE">إكمال الملف</option>
                      <option value="ACHIEVEMENT">إنجاز</option>
                      <option value="VIDEO_WATCH">مشاهدة فيديو</option>
                      <option value="POST_LIKE">إعجاب بمنشور</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الصعوبة *</label>
                    <select
                      name="difficulty"
                      value={task.difficulty}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                    >
                      <option value="EASY">سهل</option>
                      <option value="MEDIUM">متوسط</option>
                      <option value="HARD">صعب</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">المستوى المطلوب</label>
                    <select
                      name="minLevel"
                      value={task.minLevel}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                    >
                      <option value="BEGINNER">مبتدئ</option>
                      <option value="INTERMEDIATE">متوسط</option>
                      <option value="ADVANCED">متقدم</option>
                      <option value="EXPERT">خبير</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* المكافآت */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 text-purple-300">المكافآت</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">المكافأة الأساسية * (نقطة)</label>
                  <input
                    type="number"
                    name="reward"
                    value={task.reward}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">المكافأة الإضافية (نقطة)</label>
                  <input
                    type="number"
                    name="bonusReward"
                    value={task.bonusReward || 0}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* الإعدادات */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 text-purple-300">الإعدادات</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الحد الأقصى للإكمال</label>
                  <input
                    type="number"
                    name="maxCompletions"
                    value={task.maxCompletions || 0}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">وقت الانتظار (بالدقائق)</label>
                  <input
                    type="number"
                    name="cooldownMinutes"
                    value={task.cooldownMinutes || 0}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الأولوية</label>
                  <input
                    type="number"
                    name="priority"
                    value={task.priority}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* روابط */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 text-purple-300">روابط إضافية</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">معرف القناة</label>
                    <input
                      type="text"
                      name="channelId"
                      value={task.channelId || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">اسم القناة</label>
                    <input
                      type="text"
                      name="channelUsername"
                      value={task.channelUsername || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">رابط الفيديو</label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={task.videoUrl || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">رابط المنشور</label>
                  <input
                    type="url"
                    name="postUrl"
                    value={task.postUrl || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* خيارات */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 text-purple-300">خيارات</h2>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={task.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-white/10 bg-white/5"
                  />
                  <span>نشط</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isBonus"
                    checked={task.isBonus}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-white/10 bg-white/5"
                  />
                  <span>مهمة مكافأة</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={task.isFeatured}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-white/10 bg-white/5"
                  />
                  <span>مهمة مميزة</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <Link href="/admin/tasks">
                <Button type="button" variant="ghost" className="text-white">
                  إلغاء
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {saving ? (
                  <>جاري الحفظ...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    حفظ التغييرات
                  </>
                )}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
