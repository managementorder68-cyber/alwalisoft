'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Bell, Users, User } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'all',
    title: '',
    message: '',
    userId: '',
    priority: 'normal'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ تم إرسال الإشعار بنجاح! \nتم الإرسال لـ ${data.data?.sentCount || 0} مستخدم`);
        
        // Reset form
        setFormData({
          type: 'all',
          title: '',
          message: '',
          userId: '',
          priority: 'normal'
        });
      } else {
        const error = await response.json();
        alert(`❌ خطأ: ${error.error || 'فشل إرسال الإشعار'}`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('❌ حدث خطأ أثناء إرسال الإشعار');
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
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Bell className="w-7 h-7 text-purple-400" />
                إرسال الإشعارات
              </h1>
              <p className="text-purple-300 text-sm">أرسل إشعارات للمستخدمين</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-lg border-blue-500/20 p-4">
            <div className="flex items-center gap-3">
              <Users className="w-10 h-10 text-blue-400" />
              <div>
                <p className="text-sm text-blue-300">إرسال جماعي</p>
                <p className="text-xs text-white/60">لجميع المستخدمين</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-lg border-green-500/20 p-4">
            <div className="flex items-center gap-3">
              <User className="w-10 h-10 text-green-400" />
              <div>
                <p className="text-sm text-green-300">إرسال فردي</p>
                <p className="text-xs text-white/60">لمستخدم محدد</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-lg border-purple-500/20 p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-10 h-10 text-purple-400" />
              <div>
                <p className="text-sm text-purple-300">أنواع مختلفة</p>
                <p className="text-xs text-white/60">عادي، مهم، عاجل</p>
              </div>
            </div>
          </Card>
        </div>

        {/* نموذج الإرسال */}
        <form onSubmit={handleSubmit}>
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 p-6">
            <h2 className="text-xl font-bold mb-6 text-purple-300">تفاصيل الإشعار</h2>
            
            <div className="space-y-5">
              {/* نوع الإرسال */}
              <div>
                <label className="block text-sm font-medium mb-2">نوع الإرسال *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="all">جميع المستخدمين</option>
                  <option value="active">المستخدمون النشطون</option>
                  <option value="inactive">المستخدمون غير النشطين</option>
                  <option value="specific">مستخدم محدد</option>
                </select>
              </div>

              {/* معرف المستخدم (يظهر فقط عند اختيار specific) */}
              {formData.type === 'specific' && (
                <div>
                  <label className="block text-sm font-medium mb-2">معرف المستخدم (Telegram ID) *</label>
                  <input
                    type="text"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    required={formData.type === 'specific'}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="مثال: 123456789"
                  />
                </div>
              )}

              {/* الأولوية */}
              <div>
                <label className="block text-sm font-medium mb-2">الأولوية *</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="normal">عادي</option>
                  <option value="high">مهم</option>
                  <option value="urgent">عاجل</option>
                </select>
              </div>

              {/* العنوان */}
              <div>
                <label className="block text-sm font-medium mb-2">عنوان الإشعار *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="مثال: إشعار مهم من الإدارة"
                />
                <p className="text-xs text-white/40 mt-1">
                  {formData.title.length}/100 حرف
                </p>
              </div>

              {/* الرسالة */}
              <div>
                <label className="block text-sm font-medium mb-2">نص الرسالة *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  maxLength={500}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="اكتب رسالتك هنا..."
                />
                <p className="text-xs text-white/40 mt-1">
                  {formData.message.length}/500 حرف
                </p>
              </div>

              {/* معاينة */}
              {(formData.title || formData.message) && (
                <div className="border border-purple-500/30 rounded-lg p-4 bg-purple-900/10">
                  <p className="text-xs text-purple-300 mb-2">معاينة الإشعار:</p>
                  <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                    {formData.title && (
                      <p className="font-bold text-white mb-2">📢 {formData.title}</p>
                    )}
                    {formData.message && (
                      <p className="text-sm text-white/80">{formData.message}</p>
                    )}
                    <p className="text-xs text-white/40 mt-2">
                      {formData.priority === 'urgent' && '🚨 عاجل'}
                      {formData.priority === 'high' && '⚠️ مهم'}
                      {formData.priority === 'normal' && 'ℹ️ عادي'}
                    </p>
                  </div>
                </div>
              )}

              {/* أزرار */}
              <div className="flex gap-3 justify-end pt-4">
                <Link href="/admin">
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
                    <>جاري الإرسال...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 ml-2" />
                      إرسال الإشعار
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </form>

        {/* تعليمات */}
        <Card className="bg-black/20 backdrop-blur-lg border-yellow-500/20 p-4 mt-6">
          <p className="text-yellow-300 text-sm font-medium mb-2">💡 تعليمات مهمة:</p>
          <ul className="text-xs text-white/70 space-y-1">
            <li>• استخدم العناوين الواضحة والمختصرة</li>
            <li>• تأكد من صحة معرف المستخدم عند الإرسال الفردي</li>
            <li>• الإشعارات العاجلة تُرسل فوراً بينما العادية قد تتأخر قليلاً</li>
            <li>• يمكنك استخدام الرموز التعبيرية (Emoji) في الرسائل 😊</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
