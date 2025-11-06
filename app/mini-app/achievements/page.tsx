'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Trophy, Star, Target, Zap, Users, Coins,
  TrendingUp, Award, CheckCircle, Lock
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';

interface Achievement {
  id: string;
  icon: string;
  name: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  unlocked: boolean;
  category: string;
}

const achievements: Achievement[] = [
  {
    id: 'first_steps',
    icon: '🚀',
    name: 'الخطوات الأولى',
    description: 'أكمل مهمتك الأولى',
    reward: 100,
    progress: 0,
    target: 1,
    unlocked: false,
    category: 'المهام'
  },
  {
    id: 'task_master_10',
    icon: '🎯',
    name: 'خبير المهام',
    description: 'أكمل 10 مهام',
    reward: 500,
    progress: 0,
    target: 10,
    unlocked: false,
    category: 'المهام'
  },
  {
    id: 'task_master_50',
    icon: '⭐',
    name: 'أسطورة المهام',
    description: 'أكمل 50 مهمة',
    reward: 2000,
    progress: 0,
    target: 50,
    unlocked: false,
    category: 'المهام'
  },
  {
    id: 'rich_1k',
    icon: '💰',
    name: 'صاحب الألف',
    description: 'اجمع 1,000 عملة',
    reward: 200,
    progress: 0,
    target: 1000,
    unlocked: false,
    category: 'الأرصدة'
  },
  {
    id: 'rich_10k',
    icon: '💎',
    name: 'الثري',
    description: 'اجمع 10,000 عملة',
    reward: 1000,
    progress: 0,
    target: 10000,
    unlocked: false,
    category: 'الأرصدة'
  },
  {
    id: 'rich_100k',
    icon: '👑',
    name: 'الملك',
    description: 'اجمع 100,000 عملة',
    reward: 5000,
    progress: 0,
    target: 100000,
    unlocked: false,
    category: 'الأرصدة'
  },
  {
    id: 'referrer_5',
    icon: '🤝',
    name: 'المشارك',
    description: 'ادعُ 5 أصدقاء',
    reward: 500,
    progress: 0,
    target: 5,
    unlocked: false,
    category: 'الإحالات'
  },
  {
    id: 'referrer_20',
    icon: '🌟',
    name: 'المؤثر',
    description: 'ادعُ 20 صديقاً',
    reward: 2000,
    progress: 0,
    target: 20,
    unlocked: false,
    category: 'الإحالات'
  },
  {
    id: 'referrer_100',
    icon: '🔥',
    name: 'السفير',
    description: 'ادعُ 100 صديق',
    reward: 10000,
    progress: 0,
    target: 100,
    unlocked: false,
    category: 'الإحالات'
  },
  {
    id: 'streak_7',
    icon: '📅',
    name: 'الأسبوعي',
    description: 'سلسلة 7 أيام متواصلة',
    reward: 700,
    progress: 0,
    target: 7,
    unlocked: false,
    category: 'النشاط'
  },
  {
    id: 'streak_30',
    icon: '🌙',
    name: 'الشهري',
    description: 'سلسلة 30 يوماً متواصلاً',
    reward: 3000,
    progress: 0,
    target: 30,
    unlocked: false,
    category: 'النشاط'
  },
  {
    id: 'gamer',
    icon: '🎮',
    name: 'اللاعب',
    description: 'العب 10 ألعاب',
    reward: 500,
    progress: 0,
    target: 10,
    unlocked: false,
    category: 'الألعاب'
  },
  {
    id: 'quiz_master',
    icon: '🧠',
    name: 'عبقري الأسئلة',
    description: 'احصل على 5/5 في Quiz',
    reward: 1000,
    progress: 0,
    target: 1,
    unlocked: false,
    category: 'الألعاب'
  },
  {
    id: 'lucky',
    icon: '🎡',
    name: 'محظوظ',
    description: 'اربح 10,000 من Lucky Wheel',
    reward: 2000,
    progress: 0,
    target: 1,
    unlocked: false,
    category: 'الألعاب'
  }
];

function AchievementsContent() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [achievementsData, setAchievementsData] = useState(achievements);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProgress();
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      // جلب إحصائيات المستخدم من API
      const response = await fetch(`/api/users/stats?telegramId=${user.telegramId}&_t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // تحديث التقدم بناءً على البيانات الحقيقية
          const stats = data.data;
          const balance = user.balance || 0;
          
          const updatedAchievements = achievements.map(ach => {
            let progress = 0;
            let unlocked = false;
            
            // حساب التقدم بناءً على نوع الإنجاز
            switch (ach.id) {
              case 'first_steps':
              case 'task_master_10':
              case 'task_master_50':
                progress = stats.tasksCompleted || 0;
                break;
              case 'rich_1k':
              case 'rich_10k':
              case 'rich_100k':
                progress = balance;
                break;
              case 'referrer_5':
              case 'referrer_20':
              case 'referrer_50':
                progress = stats.referralsCount || 0;
                break;
              case 'streak_7':
              case 'streak_30':
                progress = stats.currentStreak || 0;
                break;
              case 'gamer':
              case 'quiz_master':
              case 'lucky':
                progress = stats.gamesPlayed || 0;
                break;
              default:
                progress = 0;
            }
            
            unlocked = progress >= ach.target;
            
            return {
              ...ach,
              progress: Math.min(progress, ach.target),
              unlocked
            };
          });
          
          setAchievementsData(updatedAchievements);
        }
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'المهام', 'الأرصدة', 'الإحالات', 'النشاط', 'الألعاب'];
  
  const filteredAchievements = selectedCategory === 'all' 
    ? achievementsData 
    : achievementsData.filter(a => a.category === selectedCategory);

  const unlockedCount = achievementsData.filter(a => a.unlocked).length;
  const totalRewards = achievementsData
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.reward, 0);

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
            <h1 className="text-2xl font-bold">🏆 الإنجازات</h1>
            <p className="text-sm text-purple-300">احصل على جوائز إضافية</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-yellow-600 to-orange-600 border-0">
            <div className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{unlockedCount}</p>
              <p className="text-xs">مفتوحة</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0">
            <div className="p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{achievements.length}</p>
              <p className="text-xs">إجمالي</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-emerald-600 border-0">
            <div className="p-4 text-center">
              <Coins className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalRewards}</p>
              <p className="text-xs">مكافآت</p>
            </div>
          </Card>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'default' : 'ghost'}
              className={`whitespace-nowrap ${
                selectedCategory === category 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                  : ''
              }`}
              size="sm"
            >
              {category === 'all' ? 'الكل' : category}
            </Button>
          ))}
        </div>

        {/* Achievements List */}
        <div className="space-y-3">
          {filteredAchievements.map((achievement) => {
            const progressPercent = (achievement.progress / achievement.target) * 100;
            
            return (
              <Card 
                key={achievement.id}
                className={`${
                  achievement.unlocked 
                    ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/50' 
                    : 'bg-white/5 border-white/10'
                } backdrop-blur-md transition-all hover:scale-102`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                        : 'bg-white/10'
                    }`}>
                      {achievement.unlocked ? achievement.icon : <Lock className="w-6 h-6 text-gray-400" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                          <p className="text-sm text-gray-400">{achievement.description}</p>
                        </div>
                        {achievement.unlocked && (
                          <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                        )}
                      </div>

                      {/* Progress */}
                      {!achievement.unlocked && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1 text-sm">
                            <span className="text-gray-400">التقدم</span>
                            <span className="font-bold">
                              {Math.floor(achievement.progress)} / {achievement.target}
                            </span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                              style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Reward */}
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-400" />
                        <span className="font-bold text-yellow-400">
                          {achievement.reward.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-400">عملة</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <div className="p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400">لا توجد إنجازات في هذه الفئة</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <ProtectedRoute>
      <AchievementsContent />
    </ProtectedRoute>
  );
}
