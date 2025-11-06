'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'DAILY',
    type: 'DAILY_CHECK_IN',
    difficulty: 'EASY',
    reward: 100,
    bonusReward: 0,
    minLevel: 'BEGINNER',
    maxCompletions: 0,
    requirement: '',
    channelId: '',
    channelUsername: '',
    groupId: '',
    videoUrl: '',
    postUrl: '',
    isBonus: false,
    isFeatured: false,
    cooldownMinutes: 0,
    priority: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('✅ تم إنشاء المهمة بنجاح!');
        router.push('/admin/tasks');
      } else {
        const error = await response.json();
        alert(`❌ خطأ: ${error.error || 'فشل إنشاء المهمة'}`);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('❌ حدث خطأ أثناء إنشاء المهمة');
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-2xl font-bold">إضافة مهمة جديدة</h1>
              <p className="text-purple-300 text-sm">أنشئ مهمة جديدة للمستخدمين</p>
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
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="مثال: متابعة قناة تليجرام"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الوصف *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="اشرح المهمة بالتفصيل..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الفئة *</label>
                    <select
                      name="category"
                      value={formData.category}
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
                      value={formData.type}
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
                      value={formData.difficulty}
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
                      value={formData.minLevel}
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
                    value={formData.reward}
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
                    value={formData.bonusReward}
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
                  <label className="block text-sm font-medium mb-2">الحد الأقصى للإكمال (0 = بلا حد)</label>
                  <input
                    type="number"
                    name="maxCompletions"
                    value={formData.maxCompletions}
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
                    value={formData.cooldownMinutes}
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
                    value={formData.priority}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* روابط (اختياري) */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 text-purple-300">روابط إضافية (اختياري)</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">معرف القناة</label>
                    <input
                      type="text"
                      name="channelId"
                      value={formData.channelId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="@channel_username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">اسم القناة</label>
                    <input
                      type="text"
                      name="channelUsername"
                      value={formData.channelUsername}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="اسم القناة"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">رابط الفيديو</label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">رابط المنشور</label>
                  <input
                    type="url"
                    name="postUrl"
                    value={formData.postUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="https://..."
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
                    name="isBonus"
                    checked={formData.isBonus}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-white/10 bg-white/5"
                  />
                  <span>مهمة مكافأة</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
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
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? (
                  <>جاري الإنشاء...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    إنشاء المهمة
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
