'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Medal, Crown, TrendingUp, Users, Coins, Target } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';

interface LeaderboardUser {
  rank: number;
  username: string;
  balance: number;
  tasksCompleted: number;
  referralCount: number;
  level: string;
  isCurrentUser?: boolean;
}

type LeaderboardType = 'balance' | 'tasks' | 'referrals';

function LeaderboardContent() {
  const { user } = useAuth();
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('balance');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [leaderboardType]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?type=${leaderboardType}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const leaderboardData = data.data.leaderboard || [];
          
          // Mark current user
          const updatedData = leaderboardData.map((u: LeaderboardUser) => ({
            ...u,
            isCurrentUser: u.username === user?.username
          }));
          
          setUsers(updatedData);
          
          // Find current user's rank
          const userRank = updatedData.find((u: LeaderboardUser) => u.isCurrentUser);
          setCurrentUserRank(userRank || null);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Medal className="w-8 h-8 text-orange-400" />;
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
            {rank}
          </div>
        );
    }
  };

  const getTypeLabel = () => {
    switch (leaderboardType) {
      case 'balance':
        return 'الأغنى';
      case 'tasks':
        return 'الأكثر نشاطاً';
      case 'referrals':
        return 'الأكثر إحالات';
    }
  };

  const getTypeValue = (user: LeaderboardUser) => {
    switch (leaderboardType) {
      case 'balance':
        return `${user.balance.toLocaleString()} 💰`;
      case 'tasks':
        return `${user.tasksCompleted} مهمة`;
      case 'referrals':
        return `${user.referralCount} صديق`;
    }
  };

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
            <h1 className="text-2xl font-bold">🏆 لوحة المتصدرين</h1>
            <p className="text-sm text-purple-300">{getTypeLabel()}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-24">
        {/* Type Selector */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card
            onClick={() => setLeaderboardType('balance')}
            className={`cursor-pointer transition-all ${
              leaderboardType === 'balance'
                ? 'bg-gradient-to-br from-yellow-600 to-orange-600 border-yellow-500 scale-105'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="p-4 text-center">
              <Coins className="w-6 h-6 mx-auto mb-2" />
              <p className="text-xs font-bold">الأغنى</p>
            </div>
          </Card>

          <Card
            onClick={() => setLeaderboardType('tasks')}
            className={`cursor-pointer transition-all ${
              leaderboardType === 'tasks'
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-500 scale-105'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2" />
              <p className="text-xs font-bold">الأكثر نشاطاً</p>
            </div>
          </Card>

          <Card
            onClick={() => setLeaderboardType('referrals')}
            className={`cursor-pointer transition-all ${
              leaderboardType === 'referrals'
                ? 'bg-gradient-to-br from-blue-600 to-cyan-600 border-blue-500 scale-105'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2" />
              <p className="text-xs font-bold">الأكثر إحالات</p>
            </div>
          </Card>
        </div>

        {/* Current User Rank */}
        {currentUserRank && (
          <Card className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-purple-500/50 mb-6">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-lg">
                    #{currentUserRank.rank}
                  </div>
                  <div>
                    <p className="font-bold">أنت</p>
                    <p className="text-sm text-gray-300">@{currentUserRank.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{getTypeValue(currentUserRank)}</p>
                  <p className="text-xs text-gray-300">{currentUserRank.level}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Top 3 Podium */}
        {users.length >= 3 && (
          <div className="mb-6">
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd Place */}
              <div className="flex-1 text-center">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center mb-2">
                    <Medal className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                </div>
                <p className="font-bold truncate">@{users[1]?.username}</p>
                <p className="text-sm text-gray-300">{getTypeValue(users[1])}</p>
              </div>

              {/* 1st Place */}
              <div className="flex-1 text-center -mt-4">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-2 animate-pulse">
                    <Crown className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center font-bold">
                    1
                  </div>
                </div>
                <p className="font-bold text-lg truncate">@{users[0]?.username}</p>
                <p className="text-sm text-yellow-300 font-bold">{getTypeValue(users[0])}</p>
              </div>

              {/* 3rd Place */}
              <div className="flex-1 text-center">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-2">
                    <Medal className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                </div>
                <p className="font-bold truncate">@{users[2]?.username}</p>
                <p className="text-sm text-gray-300">{getTypeValue(users[2])}</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">جاري التحميل...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.slice(3).map((user, index) => (
              <Card
                key={index}
                className={`${
                  user.isCurrentUser
                    ? 'bg-purple-600/20 border-purple-500/50'
                    : 'bg-white/5 border-white/10'
                } backdrop-blur-md hover:bg-white/10 transition-all`}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRankIcon(user.rank)}
                    <div>
                      <p className={`font-bold ${user.isCurrentUser ? 'text-purple-300' : ''}`}>
                        @{user.username}
                        {user.isCurrentUser && ' (أنت)'}
                      </p>
                      <p className="text-xs text-gray-400">{user.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{getTypeValue(user)}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>#{user.rank}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {users.length === 0 && !loading && (
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <div className="p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400">لا توجد بيانات</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <LeaderboardContent />
    </ProtectedRoute>
  );
}
