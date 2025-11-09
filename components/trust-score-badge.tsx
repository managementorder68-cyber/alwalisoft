'use client';

import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TrustScoreBadgeProps {
  score: number;
  showDetails?: boolean;
  className?: string;
}

/**
 * Trust Score Badge Component
 * يعرض درجة الثقة للمستخدم مع ألوان وأيقونات
 */
export function TrustScoreBadge({ score, showDetails = false, className = '' }: TrustScoreBadgeProps) {
  const getScoreInfo = (score: number) => {
    if (score >= 90) {
      return {
        color: 'bg-green-500/20 border-green-500/50 text-green-400',
        icon: CheckCircle,
        label: 'ممتاز',
        message: 'درجة ثقة عالية جداً! 🌟'
      };
    } else if (score >= 80) {
      return {
        color: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
        icon: Shield,
        label: 'جيد جداً',
        message: 'درجة ثقة جيدة جداً! ✨'
      };
    } else if (score >= 70) {
      return {
        color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
        icon: Shield,
        label: 'جيد',
        message: 'درجة ثقة جيدة. حافظ على أدائك!'
      };
    } else if (score >= 60) {
      return {
        color: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
        icon: AlertTriangle,
        label: 'متوسط',
        message: 'درجة ثقة متوسطة. تحسين مطلوب!'
      };
    } else {
      return {
        color: 'bg-red-500/20 border-red-500/50 text-red-400',
        icon: AlertTriangle,
        label: 'منخفض',
        message: 'درجة ثقة منخفضة! ⚠️'
      };
    }
  };

  const info = getScoreInfo(score);
  const Icon = info.icon;

  if (!showDetails) {
    // Badge بسيط
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${info.color} ${className}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-bold">{score}%</span>
      </div>
    );
  }

  // Card مع تفاصيل
  return (
    <Card className={`${info.color} border ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="w-6 h-6" />
            <h3 className="font-bold text-lg">درجة الثقة</h3>
          </div>
          <div className="text-3xl font-bold">{score}%</div>
        </div>
        
        <div className="mb-3">
          <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                score >= 80 ? 'bg-green-500' : 
                score >= 60 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="opacity-90">التصنيف:</span>
            <span className="font-bold">{info.label}</span>
          </div>
          <p className="text-xs opacity-75">{info.message}</p>
        </div>

        {score < 80 && (
          <div className="mt-3 pt-3 border-t border-current/20">
            <p className="text-xs font-semibold mb-1">نصائح لتحسين الدرجة:</p>
            <ul className="text-xs space-y-1 opacity-90">
              <li>• شاهد الإعلانات بالكامل (15+ ثانية)</li>
              <li>• لا تغلق الإعلان مبكراً</li>
              <li>• حافظ على نمط مشاهدة طبيعي</li>
              <li>• استخدم التطبيق بشكل يومي</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
