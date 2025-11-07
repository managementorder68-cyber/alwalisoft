'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Play, TrendingUp, Users, Coins } from 'lucide-react';

interface AdStats {
  totalViews: number;
  todayViews: number;
  totalRewards: number;
  byType: Array<{
    adType: string;
    views: number;
    totalReward: number;
  }>;
}

export default function AdminAdsPage() {
  const [stats, setStats] = useState<AdStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/ads/stats');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading ad stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="p-8">Loading...</div>;
  }
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">📊 Ads Statistics</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <p className="text-2xl font-bold">{stats?.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-2xl font-bold">{stats?.todayViews.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Coins className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Rewards</p>
              <p className="text-2xl font-bold">{stats?.totalRewards.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg/User</p>
              <p className="text-2xl font-bold">
                {stats && stats.totalViews > 0 
                  ? (stats.totalViews / 100).toFixed(1) 
                  : '0'}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* By Type */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Views by Ad Type</h2>
        <div className="space-y-4">
          {stats?.byType.map(type => (
            <div key={type.adType} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{type.adType}</p>
                <p className="text-sm text-gray-500">{type.views.toLocaleString()} views</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  {type.totalReward.toLocaleString()} coins
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
