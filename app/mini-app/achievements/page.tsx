'use client';

export const dynamic = 'force-dynamic';

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
  key: string;
  icon: string;
  name: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  category: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
  rewardClaimed: boolean;
}

function AchievementsContent() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, unlocked: 0, totalRewards: 0 });

  useEffect(() => {
    if (user?.id) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    try {
      const response = await fetch(`/api/achievements?userId=${user?.id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAchievements(data.data.achievements || []);
          setStats(data.data.stats || { total: 0, unlocked: 0, totalRewards: 0 });
        }
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (achievementId: string) => {
    try {
      const response = await fetch(`/api/achievements/${achievementId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // تحديث الإنجازات
          setAchievements(prev =>
            prev.map(a =>
              a.id === achievementId ? { ...a, rewardClaimed: true } : a
            )
          );
          
          // تحديث الرصيد
          if (user) {
            const updatedUser = { ...user, balance: data.data.newBalance };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const getCategoryName = (category: string) => {
    const map: Record<string, string> = {
      'TASKS': 'المهام',
      'BALANCE': 'الأرصدة',
      'REFERRALS': 'الإحالات',
      'ACTIVITY': 'النشاط',
      'GAMES': 'الألعاب',
      'SOCIAL': 'الاجتماعي'
    };
    return map[category] || category;
  };

  const categories = ['all', 'TASKS', 'BALANCE', 'REFERRALS', 'ACTIVITY', 'GAMES'];
  
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-purple-400 animate-pulse" />
          <p className="text-xl">جارٍ تحميل الإنجازات...</p>
        </div>
      </div>
    );
  }

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
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 p-4">
            <div className="text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold">{stats.unlocked}/{stats.total}</div>
              <div className="text-xs text-yellow-300">مفتوحة</div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30 p-4">
            <div className="text-center">
              <Coins className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold">{stats.totalRewards.toLocaleString()}</div>
              <div className="text-xs text-green-300">مكافآت</div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30 p-4">
            <div className="text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold">{Math.round((stats.unlocked / stats.total) * 100)}%</div>
              <div className="text-xs text-purple-300">الإنجاز</div>
            </div>
          </Card>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {cat === 'all' ? 'الكل' : getCategoryName(cat)}
            </button>
          ))}
        </div>

        {/* Achievements List */}
        <div className="space-y-4">
          {filteredAchievements.length === 0 ? (
            <Card className="bg-white/5 border-white/10 p-8 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-white/30" />
              <p className="text-white/60">لا توجد إنجازات في هذه الفئة</p>
            </Card>
          ) : (
            filteredAchievements.map(achievement => {
              const progressPercent = (achievement.progress / achievement.target) * 100;
              
              return (
                <Card 
                  key={achievement.id}
                  className={`p-5 transition-all ${
                    achievement.isUnlocked 
                      ? 'bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`text-4xl p-3 rounded-xl ${
                      achievement.isUnlocked 
                        ? 'bg-green-500/20' 
                        : 'bg-white/10'
                    }`}>
                      {achievement.isUnlocked ? achievement.icon : <Lock className="w-8 h-8 text-white/30" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{achievement.name}</h3>
                          <p className="text-sm text-white/60">{achievement.description}</p>
                        </div>
                        {achievement.isUnlocked && (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        )}
                      </div>

                      {/* Progress Bar */}
                      {!achievement.isUnlocked && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-white/60 mb-1">
                            <span>التقدم</span>
                            <span>{achievement.progress} / {achievement.target}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                              style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Reward */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-yellow-400">
                          <Coins className="w-5 h-5" />
                          <span className="font-bold">+{achievement.reward.toLocaleString()}</span>
                        </div>
                        
                        {achievement.isUnlocked && !achievement.rewardClaimed && (
                          <Button
                            onClick={() => claimReward(achievement.id)}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                          >
                            <Award className="w-4 h-4 mr-2" />
                            اطلب المكافأة
                          </Button>
                        )}
                        
                        {achievement.rewardClaimed && (
                          <div className="text-green-400 text-sm flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            تم الحصول على المكافأة
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Tips */}
        <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 p-4 mt-6">
          <div className="flex gap-3">
            <TrendingUp className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="font-bold mb-1">💡 نصيحة</h3>
              <p className="text-sm text-white/80">
                اكمل المزيد من المهام وادعُ أصدقاءك لفتح إنجازات جديدة وكسب المزيد من المكافآت!
              </p>
            </div>
          </div>
        </Card>
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
