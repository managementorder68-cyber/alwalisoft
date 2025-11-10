  'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react';

interface RewardedAdButtonProps {
  onAdComplete: (reward: number) => void;
  onAdFailed?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Rewarded Ad Button Component
 * يدير عرض الإعلانات وتحقق من المشاهدة الفعلية
 */
export function RewardedAdButton({
  onAdComplete,
  onAdFailed,
  disabled = false,
  className = '',
  children
}: RewardedAdButtonProps) {
  const [loading, setLoading] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // تحميل AdMob SDK
    loadAdMobSDK();
  }, []);

  const loadAdMobSDK = () => {
    // في Production، يتم تحميل Google AdMob SDK
    if (typeof window !== 'undefined' && !window.adsbygoogle) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        console.log('✅ AdMob SDK loaded');
        setAdLoaded(true);
      };
      script.onerror = () => {
        console.error('❌ Failed to load AdMob SDK');
        setAdLoaded(false);
      };
      document.head.appendChild(script);
    } else {
      setAdLoaded(true);
    }
  };

  const showRewardedAd = async () => {
    if (loading || disabled) return;

    setLoading(true);

    try {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        // Development: محاكاة إعلان (3 ثواني)
        console.log('🎬 Development: Simulating ad...');
        await simulateAd();
        
        // محاكاة مكافأة
        const reward = 500;
        onAdComplete(reward);
      } else {
        // Production: عرض إعلان حقيقي
        await showRealRewardedAd();
      }
    } catch (error) {
      console.error('❌ Error showing ad:', error);
      onAdFailed?.(error instanceof Error ? error.message : 'فشل عرض الإعلان');
    } finally {
      setLoading(false);
    }
  };

  /**
   * محاكاة إعلان في Development
   */
  const simulateAd = (): Promise<void> => {
    return new Promise((resolve) => {
      // محاكاة تحميل الإعلان
      console.log('📥 Loading ad...');
      
      setTimeout(() => {
        console.log('▶️ Ad playing...');
        
        // محاكاة مدة الإعلان (3 ثواني)
        setTimeout(() => {
          console.log('✅ Ad completed');
          resolve();
        }, 3000);
      }, 500);
    });
  };

  /**
   * عرض إعلان حقيقي في Production
   */
  const showRealRewardedAd = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // AdMob Rewarded Video
      const adUnitId = process.env.NEXT_PUBLIC_ADMOB_REWARDED_VIDEO_ID;
      
      if (!adUnitId) {
        reject(new Error('Ad Unit ID not configured'));
        return;
      }

      // Google AdMob Rewarded Video API
      if (typeof window !== 'undefined' && window.googletag) {
        window.googletag.cmd.push(() => {
          // Load rewarded ad
          const rewardedSlot = window.googletag.defineOutOfPageSlot(
            adUnitId,
            window.googletag.enums.OutOfPageFormat.REWARDED
          );

          if (rewardedSlot) {
            let adWatched = false;
            let adStartTime = 0;
            let adMinDuration = 15000; // 15 ثانية على الأقل

            // عند بدء الإعلان
            rewardedSlot.addService(window.googletag.pubads());
            
            window.googletag.pubads().addEventListener('rewardedSlotReady', (event: any) => {
              console.log('📺 Ad ready, showing...');
              adStartTime = Date.now();
              event.makeRewardedVisible();
            });

            // عند إغلاق الإعلان
            window.googletag.pubads().addEventListener('rewardedSlotClosed', (event: any) => {
              const watchDuration = Date.now() - adStartTime;
              console.log(`⏱️ Ad watch duration: ${watchDuration}ms`);
              
              // التحقق من المدة الدنيا
              if (watchDuration >= adMinDuration && adWatched) {
                console.log('✅ Ad completed successfully');
                const reward = 500;
                onAdComplete(reward);
                resolve();
              } else {
                console.log('❌ Ad closed too early or not watched');
                reject(new Error('لم تشاهد الإعلان بالكامل'));
              }
            });

            // عند منح المكافأة
            window.googletag.pubads().addEventListener('rewardedSlotGranted', (event: any) => {
              console.log('🎁 Reward granted by AdMob');
              adWatched = true;
            });

            window.googletag.display(rewardedSlot);
          } else {
            reject(new Error('Failed to create ad slot'));
          }
        });
      } else {
        // Fallback: استخدام Google AdSense Rewarded Ads
        showAdSenseRewardedAd(adUnitId, resolve, reject);
      }
    });
  };

  /**
   * عرض إعلان باستخدام AdSense (fallback)
   */
  const showAdSenseRewardedAd = (adUnitId: string, resolve: () => void, reject: (error: Error) => void) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window not available'));
      return;
    }

    let adWatched = false;
    let adStartTime = Date.now();

    // إنشاء overlay للإعلان
    const overlay = document.createElement('div');
    overlay.id = 'ad-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.95);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const adContainer = document.createElement('div');
    adContainer.style.cssText = `
      width: 90%;
      max-width: 600px;
      height: 400px;
      background: white;
      border-radius: 10px;
      position: relative;
    `;

    // إضافة الإعلان
    const insElement = document.createElement('ins');
    insElement.className = 'adsbygoogle';
    insElement.style.cssText = 'display:block;width:100%;height:100%;';
    insElement.setAttribute('data-ad-client', process.env.NEXT_PUBLIC_ADMOB_APP_ID || '');
    insElement.setAttribute('data-ad-slot', adUnitId);
    insElement.setAttribute('data-ad-format', 'fluid');

    adContainer.appendChild(insElement);
    overlay.appendChild(adContainer);
    document.body.appendChild(overlay);

    // تحميل الإعلان
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      
      // مراقبة الإعلان
      const checkInterval = setInterval(() => {
        const adLoaded = insElement.getAttribute('data-ad-status') === 'filled';
        if (adLoaded) {
          console.log('📺 Ad loaded');
          clearInterval(checkInterval);
        }
      }, 100);

      // زر الإغلاق (يظهر بعد 15 ثانية)
      setTimeout(() => {
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
          position: absolute;
          top: 10px;
          right: 10px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(0,0,0,0.7);
          color: white;
          border: none;
          font-size: 20px;
          cursor: pointer;
          z-index: 100000;
        `;
        
        closeBtn.onclick = () => {
          const watchDuration = Date.now() - adStartTime;
          document.body.removeChild(overlay);
          
          if (watchDuration >= 15000) {
            console.log('✅ Ad watched completely');
            adWatched = true;
            const reward = 500;
            onAdComplete(reward);
            resolve();
          } else {
            console.log('❌ Ad closed too early');
            reject(new Error('لم تشاهد الإعلان بالكامل'));
          }
        };
        
        adContainer.appendChild(closeBtn);
      }, 15000); // 15 ثانية

    } catch (error) {
      document.body.removeChild(overlay);
      reject(error as Error);
    }
  };

  return (
    <Button
      onClick={showRewardedAd}
      disabled={disabled || loading || !adLoaded}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          جارٍ تحميل الإعلان...
        </>
      ) : (
        <>
          {children || (
            <>
              <Play className="w-5 h-5 mr-2" />
              شاهد إعلان
            </>
          )}
        </>
      )}
    </Button>
  );
}

// TypeScript declarations for Google Ad APIs
declare global {
  interface Window {
    adsbygoogle: any[];
    googletag: any;
  }
    }
