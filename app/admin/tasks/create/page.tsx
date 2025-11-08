'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface VerificationData {
  type: string;
  [key: string]: any;
}

export default function CreateTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Basic fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('100');
  const [bonusReward, setBonusReward] = useState('0');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'>('EASY');
  const [type, setType] = useState<'ONE_TIME' | 'DAILY' | 'WEEKLY' | 'SPECIAL'>('ONE_TIME');
  const [category, setCategory] = useState('CHANNEL_SUBSCRIPTION');
  const [isActive, setIsActive] = useState(true);

  // Verification fields
  const [verificationType, setVerificationType] = useState('TELEGRAM_CHANNEL');
  const [channelUsername, setChannelUsername] = useState('');
  const [groupId, setGroupId] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [minReferrals, setMinReferrals] = useState('3');
  const [minTasks, setMinTasks] = useState('5');
  const [minBalance, setMinBalance] = useState('50000');
  const [minGames, setMinGames] = useState('3');
  const [requiredFields, setRequiredFields] = useState('username,firstName');

  const categories = [
    { value: 'CHANNEL_SUBSCRIPTION', label: 'اشتراك قناة' },
    { value: 'GROUP_JOIN', label: 'انضمام مجموعة' },
    { value: 'SOCIAL_FOLLOW', label: 'متابعة حساب' },
    { value: 'VIDEO_WATCH', label: 'مشاهدة فيديو' },
    { value: 'POST_INTERACTION', label: 'تفاعل مع منشور' },
    { value: 'CONTENT_SHARE', label: 'مشاركة محتوى' },
    { value: 'REFERRAL_BONUS', label: 'دعوة أصدقاء' },
    { value: 'DAILY_LOGIN', label: 'تسجيل دخول يومي' },
    { value: 'SURVEY', label: 'استبيان' },
    { value: 'SPECIAL_EVENT', label: 'حدث خاص' }
  ];

  const verificationTypes = [
    { value: 'TELEGRAM_CHANNEL', label: 'التحقق من قناة Telegram', needsChannel: true },
    { value: 'TELEGRAM_GROUP', label: 'التحقق من مجموعة Telegram', needsGroup: true },
    { value: 'REFERRAL_COUNT', label: 'عدد الإحالات', needsReferrals: true },
    { value: 'TASK_COUNT', label: 'عدد المهام المكتملة', needsTasks: true },
    { value: 'BALANCE_THRESHOLD', label: 'حد أدنى للرصيد', needsBalance: true },
    { value: 'GAME_COUNT', label: 'عدد الألعاب', needsGames: true },
    { value: 'PROFILE_COMPLETE', label: 'اكتمال الملف الشخصي', needsFields: true },
    { value: 'SOCIAL_SHARE', label: 'مشاركة اجتماعية', needsUrl: true },
    { value: 'DAILY_LOGIN', label: 'تسجيل دخول (تلقائي)', needsNothing: true },
    { value: 'AUTO_COMPLETE', label: 'إكمال تلقائي', needsNothing: true }
  ];

  const buildVerificationData = (): any => {
    const data: any = { type: verificationType };

    switch (verificationType) {
      case 'TELEGRAM_CHANNEL':
        data.channelUsername = channelUsername;
        data.verifyUrl = postUrl || `https://t.me/${channelUsername}`;
        break;
      case 'TELEGRAM_GROUP':
        data.groupId = groupId;
        data.groupUsername = channelUsername;
        break;
      case 'REFERRAL_COUNT':
        data.minReferrals = parseInt(minReferrals) || 3;
        break;
      case 'TASK_COUNT':
        data.minTasks = parseInt(minTasks) || 5;
        data.taskType = type;
        break;
      case 'BALANCE_THRESHOLD':
        data.minBalance = parseInt(minBalance) || 50000;
        break;
      case 'GAME_COUNT':
        data.minGames = parseInt(minGames) || 3;
        break;
      case 'PROFILE_COMPLETE':
        data.requiredFields = requiredFields.split(',').map(f => f.trim());
        break;
      case 'SOCIAL_SHARE':
        data.platform = 'generic';
        break;
      case 'DAILY_LOGIN':
      case 'AUTO_COMPLETE':
        data.autoComplete = true;
        break;
    }

    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const verificationData = buildVerificationData();

      const taskData = {
        name,
        description,
        reward: parseInt(reward),
        bonusReward: parseInt(bonusReward) || 0,
        difficulty,
        type,
        category,
        isActive,
        verificationData,
        channelUsername: channelUsername || undefined,
        groupId: groupId || undefined,
        postUrl: postUrl || undefined,
        videoUrl: videoUrl || undefined
      };

      console.log('📤 Creating task:', taskData);

      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('✅ تم إنشاء المهمة بنجاح!');
        router.push('/admin/tasks');
      } else {
        setError(data.error || 'فشل إنشاء المهمة');
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError('حدث خطأ أثناء إنشاء المهمة');
    } finally {
      setLoading(false);
    }
  };

  const currentVerificationType = verificationTypes.find(v => v.value === verificationType);

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
              <h1 className="text-2xl font-bold">إنشاء مهمة جديدة</h1>
              <p className="text-purple-300 text-sm">املأ البيانات التالية لإنشاء مهمة</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <Card className="bg-red-500/20 border-red-500/50 mb-6">
            <div className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300">{error}</p>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-6">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">معلومات أساسية</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم المهمة *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="مثال: متابعة قناة تليجرام"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الوصف *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="وصف المهمة..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">المكافأة (عملة) *</label>
                    <input
                      type="number"
                      value={reward}
                      onChange={(e) => setReward(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">مكافأة إضافية</label>
                    <input
                      type="number"
                      value={bonusReward}
                      onChange={(e) => setBonusReward(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الصعوبة</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="EASY">سهل</option>
                      <option value="MEDIUM">متوسط</option>
                      <option value="HARD">صعب</option>
                      <option value="EXPERT">خبير</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">النوع</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="ONE_TIME">مرة واحدة</option>
                      <option value="DAILY">يومي</option>
                      <option value="WEEKLY">أسبوعي</option>
                      <option value="SPECIAL">خاص</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الفئة</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label className="text-sm">تفعيل المهمة فوراً</label>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-6">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">التحقق والروابط</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">نوع التحقق</label>
                  <select
                    value={verificationType}
                    onChange={(e) => setVerificationType(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {verificationTypes.map((vt) => (
                      <option key={vt.value} value={vt.value}>
                        {vt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {currentVerificationType?.needsChannel && (
                  <div>
                    <label className="block text-sm font-medium mb-2">اسم القناة/المجموعة</label>
                    <input
                      type="text"
                      value={channelUsername}
                      onChange={(e) => setChannelUsername(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="alwalisoft"
                    />
                    <p className="text-xs text-gray-400 mt-1">بدون @</p>
                  </div>
                )}

                {currentVerificationType?.needsGroup && (
                  <div>
                    <label className="block text-sm font-medium mb-2">معرف المجموعة (Group ID)</label>
                    <input
                      type="text"
                      value={groupId}
                      onChange={(e) => setGroupId(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="-1002345678901"
                    />
                  </div>
                )}

                {currentVerificationType?.needsReferrals && (
                  <div>
                    <label className="block text-sm font-medium mb-2">الحد الأدنى للإحالات</label>
                    <input
                      type="number"
                      value={minReferrals}
                      onChange={(e) => setMinReferrals(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                    />
                  </div>
                )}

                {currentVerificationType?.needsTasks && (
                  <div>
                    <label className="block text-sm font-medium mb-2">عدد المهام المطلوبة</label>
                    <input
                      type="number"
                      value={minTasks}
                      onChange={(e) => setMinTasks(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                    />
                  </div>
                )}

                {currentVerificationType?.needsBalance && (
                  <div>
                    <label className="block text-sm font-medium mb-2">الرصيد المطلوب</label>
                    <input
                      type="number"
                      value={minBalance}
                      onChange={(e) => setMinBalance(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                      step="1000"
                    />
                  </div>
                )}

                {currentVerificationType?.needsGames && (
                  <div>
                    <label className="block text-sm font-medium mb-2">عدد الألعاب المطلوبة</label>
                    <input
                      type="number"
                      value={minGames}
                      onChange={(e) => setMinGames(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                    />
                  </div>
                )}

                {currentVerificationType?.needsFields && (
                  <div>
                    <label className="block text-sm font-medium mb-2">الحقول المطلوبة</label>
                    <input
                      type="text"
                      value={requiredFields}
                      onChange={(e) => setRequiredFields(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="username,firstName,bio"
                    />
                    <p className="text-xs text-gray-400 mt-1">افصل بفواصل</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">رابط القناة/الصفحة</label>
                  <input
                    type="url"
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://t.me/alwalisoft"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">رابط فيديو (اختياري)</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  جارٍ الإنشاء...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  إنشاء المهمة
                </>
              )}
            </Button>
            <Link href="/admin/tasks">
              <Button type="button" variant="ghost" className="text-gray-300">
                إلغاء
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
