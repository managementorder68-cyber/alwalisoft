'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Target as TargetIcon, HelpCircle, ArrowLeft, Coins } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { RewardedAdButton } from '@/components/rewarded-ad-button';

function GamesContent() {
  const { user } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [stats, setStats] = useState({ playsToday: 0, bestReward: 0 });
  
  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user]);
  
  const loadStats = async () => {
    try {
      const response = await fetch(`/api/games/stats?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading game stats:', error);
    }
  };

  const playLuckyWheel = async () => {
    if (!user) {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('⚠️ Please login first!');
      }
      return;
    }
    
    setSpinning(true);
    setResult(null);

    // Animate spinning
    setTimeout(async () => {
      try {
        const response = await fetch('/api/games/lucky-wheel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.telegramId })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setResult(data.reward || 0);
            
            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
              window.Telegram.WebApp.showAlert(`🎉 ربحت ${data.reward.toLocaleString()} عملة!`);
            }
          } else {
            throw new Error(data.message || 'Game failed');
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Network error');
        }
      } catch (error: any) {
        console.error('Error playing game:', error);
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert(`❌ خطأ: ${error.message || 'حدث خطأ، حاول مرة أخرى'}`);
        }
      } finally {
        setSpinning(false);
      }
    }, 2000);
  };

  const games = [
    {
      id: 'lucky-wheel',
      name: '🎡 Lucky Wheel',
      description: 'Spin the wheel and win rewards!',
      action: playLuckyWheel,
      color: 'from-pink-600 to-purple-600'
    },
    {
      id: 'target-hit',
      name: '🎯 Target Hit',
      description: 'Hit the target to earn coins',
      action: () => {
        try {
          if (typeof window !== 'undefined') {
            window.location.href = '/mini-app/games/target-hit';
          }
        } catch (error) {
          console.error('Navigation error:', error);
          if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            window.Telegram.WebApp.showAlert('❌ حدث خطأ في فتح اللعبة');
          }
        }
      },
      color: 'from-orange-600 to-red-600',
      comingSoon: false
    },
    {
      id: 'quiz',
      name: '🧠 Quiz Challenge',
      description: 'Answer questions correctly',
      action: () => {
        try {
          if (typeof window !== 'undefined') {
            window.location.href = '/mini-app/games/quiz';
          }
        } catch (error) {
          console.error('Navigation error:', error);
          if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            window.Telegram.WebApp.showAlert('❌ حدث خطأ في فتح اللعبة');
          }
        }
      },
      color: 'from-blue-600 to-cyan-600',
      comingSoon: false
    }
  ];

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
            <h1 className="text-2xl font-bold">Mini Games</h1>
            <p className="text-sm text-purple-300">Play and earn rewards</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-24">
        {/* Result Display */}
        {result !== null && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-600 to-orange-600 border-0 shadow-2xl animate-bounce">
            <div className="p-6 text-center">
              <Coins className="w-16 h-16 mx-auto mb-3 text-white" />
              <h2 className="text-3xl font-bold mb-2">🎉 Congratulations!</h2>
              <p className="text-xl">You won <span className="font-bold">{result.toLocaleString()}</span> coins!</p>
            </div>
          </Card>
        )}

        {/* Watch Ad for Bonus */}
        <Card className="mb-6 bg-gradient-to-r from-green-600 to-teal-600 border-0 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          
          <div className="p-6 relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1">مكافأة إضافية!</h3>
                <p className="text-green-100 text-sm">شاهد إعلان واحصل على 500 عملة</p>
              </div>
            </div>
            
            {user?.id && (
              <RewardedAdButton
                userId={user.id}
                rewardAmount={500}
                buttonText="شاهد الإعلان"
                onRewardEarned={() => {
                  loadStats();
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3"
              />
            )}
          </div>
        </Card>

        {/* Games Grid */}
        <div className="space-y-4">
          {games.map((game) => (
            <Card 
              key={game.id}
              className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden hover:scale-[1.02] transition-transform"
            >
              <div className={`h-2 bg-gradient-to-r ${game.color}`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{game.name}</h3>
                    <p className="text-gray-400">{game.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={game.action}
                    disabled={spinning && game.id === 'lucky-wheel'}
                    className={`flex-1 bg-gradient-to-r ${game.color} hover:opacity-90 h-12 text-lg font-bold`}
                  >
                    {spinning && game.id === 'lucky-wheel' ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Spinning...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Play Now
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 border-white/20 hover:bg-white/10"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </Button>
                </div>

                {/* Game Stats */}
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-around text-center text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Plays Today</p>
                    <p className="font-bold">{stats.playsToday}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Best Reward</p>
                    <p className="font-bold">{stats.bestReward.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Coming Soon */}
        <Card className="mt-6 bg-white/5 backdrop-blur-md border-white/10 border-dashed">
          <div className="p-8 text-center">
            <Zap className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <h3 className="font-bold text-lg mb-2">More Games Coming Soon!</h3>
            <p className="text-gray-400 text-sm">Stay tuned for exciting new games</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function GamesPage() {
  return (
    <ProtectedRoute>
      <GamesContent />
    </ProtectedRoute>
  );
}
