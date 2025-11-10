'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Loader2, CheckCircle2 } from 'lucide-react';

interface RewardedAdButtonProps {
  onAdComplete: (reward: number) => void;
  onAdFailed?: (error: string) => void;
  onAdStart?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function RewardedAdButton({
  onAdComplete,
  onAdFailed,
  onAdStart,
  disabled = false,
  className = '',
  children
}: RewardedAdButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  const simulateAd = async () => {
    if (loading || disabled) return;

    setLoading(true);
    onAdStart?.();

    try {
      // استخدام Telegram WebApp إذا كان متاحاً
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        await showTelegramAd();
      } else {
        // محاكاة إعلان بسيط للمتصفح
        await showBrowserAd();
      }
    } catch (error) {
      console.error('Error showing ad:', error);
      onAdFailed?.(error instanceof Error ? error.message : 'فشل عرض الإعلان');
      setLoading(false);
      setShowTimer(false);
    }
  };

  const showTelegramAd = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      window.Telegram.WebApp.showPopup({
        title: '🎬 إعلان مكافئ',
        message: 'شاهد هذا الإعلان لمدة 15 ثانية للحصول على 500 عملة. لا تغلق النافذة مبكراً.',
        buttons: [
          { 
            id: 'watch', 
            type: 'default', 
            text: '▶️ شاهد الإعلان' 
          },
          { 
            id: 'cancel', 
            type: 'cancel', 
            text: 'إلغاء' 
          }
        ]
      }, (buttonId: string) => {
        if (buttonId === 'watch') {
          // بدء العداد
          setShowTimer(true);
          setTimeLeft(15);
          
          const timer = setInterval(() => {
            setTimeLeft((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                setShowTimer(false);
                setLoading(false);
                
                // نجاح المشاهدة
                const reward = 500;
                onAdComplete(reward);
                resolve();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          reject(new Error('تم إلغاء الإعلان'));
        }
      });
    });
  };

  const showBrowserAd = (): Promise<void> => {
    return new Promise((resolve) => {
      // إنشاء نافذة محاكاة للإعلان
      const adOverlay = document.createElement('div');
      adOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.95);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
      `;

      const adContent = document.createElement('div');
      adContent.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 15px;
        text-align: center;
        max-width: 400px;
        width: 90%;
      `;

      const timerDisplay = document.createElement('div');
      timerDisplay.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
        <h3 style="margin-bottom: 1rem; font-size: 1.5rem;">إعلان تجريبي</h3>
        <p style="margin-bottom: 1rem;">شاهد هذا الإعلان لمدة <span id="countdown">15</span> ثانية</p>
        <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 10px; margin-bottom: 1rem;">
          <p>🎁 ستحصل على 500 عملة</p>
        </div>
      `;

      const closeButton = document.createElement('button');
      closeButton.textContent = 'إغلاق (15)';
      closeButton.disabled = true;
      closeButton.style.cssText = `
        padding: 10px 20px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        opacity: 0.5;
      `;

      adContent.appendChild(timerDisplay);
      adContent.appendChild(closeButton);
      adOverlay.appendChild(adContent);
      document.body.appendChild(adOverlay);

      let timeLeft = 15;
      const countdownElement = timerDisplay.querySelector('#countdown') as HTMLElement;
      
      const timer = setInterval(() => {
        timeLeft--;
        countdownElement.textContent = timeLeft.toString();
        closeButton.textContent = `إغلاق (${timeLeft})`;

        if (timeLeft <= 0) {
          clearInterval(timer);
          closeButton.textContent = '🎉 احصل على المكافأة!';
          closeButton.style.opacity = '1';
          closeButton.disabled = false;
        }
      }, 1000);

      closeButton.onclick = () => {
        if (timeLeft <= 0) {
          document.body.removeChild(adOverlay);
          setLoading(false);
          const reward = 500;
          onAdComplete(reward);
          resolve();
        }
      };

      // زر إلغاء للطوارئ
      const cancelButton = document.createElement('button');
      cancelButton.textContent = 'إلغاء';
      cancelButton.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        padding: 5px 10px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      `;
      
      cancelButton.onclick = () => {
        clearInterval(timer);
        document.body.removeChild(adOverlay);
        setLoading(false);
        onAdFailed?.('تم إلغاء الإعلان');
      };
      
      adOverlay.appendChild(cancelButton);
    });
  };

  return (
    <div className="text-center">
      {showTimer ? (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="text-4xl mb-4">⏳</div>
          <h3 className="text-xl font-bold mb-2">جاري عرض الإعلان</h3>
          <p className="text-lg mb-4">يبقى: {timeLeft} ثانية</p>
          <div className="bg-white/20 rounded-full h-2 mb-4">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all"
              style={{ width: `${((15 - timeLeft) / 15) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm">لا تغلق التطبيق أثناء عرض الإعلان</p>
        </div>
      ) : (
        <Button
          onClick={simulateAd}
          disabled={disabled || loading}
          className={`relative overflow-hidden ${className}`}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              جارٍ تحميل الإعلان...
            </>
          ) : (
            children
          )}
        </Button>
      )}
    </div>
  );
        }   * عرض إعلان حقيقي في Production
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
