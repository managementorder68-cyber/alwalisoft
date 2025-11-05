'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, Zap, Trophy, Coins } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  hit: boolean;
}

function TargetHitContent() {
  const { user, updateBalance } = useAuth();
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState<Target[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [reward, setReward] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (playing && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (playing && timeLeft === 0) {
      endGame();
    }
  }, [playing, timeLeft]);

  useEffect(() => {
    if (playing) {
      const interval = setInterval(() => {
        spawnTarget();
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [playing]);

  const spawnTarget = () => {
    if (!gameAreaRef.current) return;

    const area = gameAreaRef.current.getBoundingClientRect();
    const size = 40 + Math.random() * 40; // 40-80px
    
    const newTarget: Target = {
      id: Date.now(),
      x: Math.random() * (area.width - size),
      y: Math.random() * (area.height - size),
      size,
      hit: false
    };

    setTargets(prev => [...prev, newTarget]);

    // Remove target after 2 seconds if not hit
    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== newTarget.id));
    }, 2000);
  };

  const hitTarget = (targetId: number) => {
    setTargets(prev => 
      prev.map(t => t.id === targetId ? { ...t, hit: true } : t)
    );
    setScore(prev => prev + 10);

    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== targetId));
    }, 300);
  };

  const startGame = () => {
    setPlaying(true);
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
    setGameOver(false);
    setReward(0);
  };

  const endGame = async () => {
    setPlaying(false);
    setGameOver(true);
    setTargets([]);

    // Calculate reward based on score
    const calculatedReward = Math.floor(score * 10); // 10 coins per point
    setReward(calculatedReward);

    if (calculatedReward > 0 && user) {
      try {
        const response = await fetch('/api/games/target-hit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.telegramId,
            score,
            reward: calculatedReward
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            updateBalance(data.newBalance);
            
            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
              window.Telegram.WebApp.showAlert(
                `🎯 رائع! ربحت ${calculatedReward.toLocaleString()} عملة!`
              );
            }
          }
        }
      } catch (error) {
        console.error('Error submitting score:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/mini-app/games">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">🎯 Target Hit</h1>
              <p className="text-sm text-orange-300">اضرب الأهداف بسرعة!</p>
            </div>
          </div>

          {playing && (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-400">النقاط</p>
                <p className="text-2xl font-bold text-yellow-400">{score}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">الوقت</p>
                <p className="text-2xl font-bold text-orange-400">{timeLeft}s</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {!playing && !gameOver && (
          <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-6">
            <div className="p-8 text-center">
              <Target className="w-20 h-20 mx-auto mb-4 text-orange-400" />
              <h2 className="text-2xl font-bold mb-4">كيفية اللعب</h2>
              <div className="space-y-2 text-gray-300 mb-6">
                <p>🎯 اضرب الأهداف التي تظهر على الشاشة</p>
                <p>⚡ كل هدف = 10 نقاط</p>
                <p>⏱️ لديك 30 ثانية</p>
                <p>💰 كل نقطة = 10 عملات</p>
              </div>
              <Button
                onClick={startGame}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 h-14 px-8 text-lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                ابدأ اللعب!
              </Button>
            </div>
          </Card>
        )}

        {playing && (
          <div
            ref={gameAreaRef}
            className="relative w-full h-[500px] bg-gradient-to-br from-red-950/50 to-orange-950/50 rounded-2xl border-2 border-orange-500/30 overflow-hidden"
            style={{ touchAction: 'none' }}
          >
            {/* Crosshair cursor effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-red-500/30"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-500/30"></div>
            </div>

            {targets.map(target => (
              <button
                key={target.id}
                onClick={() => hitTarget(target.id)}
                className={`absolute transition-all ${
                  target.hit 
                    ? 'scale-150 opacity-0' 
                    : 'scale-100 opacity-100 hover:scale-110'
                }`}
                style={{
                  left: target.x,
                  top: target.y,
                  width: target.size,
                  height: target.size,
                }}
              >
                <div className="relative w-full h-full">
                  {/* Target circles */}
                  <div className="absolute inset-0 rounded-full bg-red-500 opacity-90 animate-pulse"></div>
                  <div className="absolute inset-[20%] rounded-full bg-white"></div>
                  <div className="absolute inset-[40%] rounded-full bg-red-500"></div>
                  <div className="absolute inset-[45%] rounded-full bg-white flex items-center justify-center">
                    {!target.hit && <Target className="w-4 h-4 text-red-500" />}
                    {target.hit && <span className="text-xl">💥</span>}
                  </div>
                </div>
              </button>
            ))}

            {targets.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <p className="text-lg">استعد... 🎯</p>
              </div>
            )}
          </div>
        )}

        {gameOver && (
          <Card className="bg-gradient-to-br from-orange-600 to-red-600 border-0 shadow-2xl">
            <div className="p-8 text-center">
              <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-300 animate-bounce" />
              <h2 className="text-3xl font-bold mb-4">انتهت اللعبة! 🎉</h2>
              
              <div className="space-y-3 mb-6">
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm text-orange-200 mb-1">النقاط النهائية</p>
                  <p className="text-4xl font-bold">{score}</p>
                </div>
                
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm text-orange-200 mb-1">المكافأة</p>
                  <div className="flex items-center justify-center gap-2">
                    <Coins className="w-8 h-8 text-yellow-300" />
                    <p className="text-4xl font-bold text-yellow-300">
                      +{reward.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={startGame}
                  className="flex-1 bg-white/20 hover:bg-white/30 h-12"
                >
                  العب مرة أخرى
                </Button>
                <Link href="/mini-app/games" className="flex-1">
                  <Button className="w-full bg-white/20 hover:bg-white/30 h-12">
                    رجوع
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        {!playing && !gameOver && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <div className="p-4 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                <p className="text-xl font-bold">0</p>
                <p className="text-xs text-gray-400">أفضل نتيجة</p>
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <div className="p-4 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <p className="text-xl font-bold">0</p>
                <p className="text-xs text-gray-400">مرات اللعب</p>
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <div className="p-4 text-center">
                <Coins className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-xl font-bold">0</p>
                <p className="text-xs text-gray-400">مجموع الربح</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TargetHitPage() {
  return (
    <ProtectedRoute>
      <TargetHitContent />
    </ProtectedRoute>
  );
}
