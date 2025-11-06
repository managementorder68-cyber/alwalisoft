# كيفية اختبار التطبيق - دليل شامل

## 📅 تاريخ التحديث: 7 نوفمبر 2025

---

## ✅ الإصلاحات الأخيرة

### المشاكل التي تم حلها:
1. ✅ **Auto-Login محسّن**: الآن يعمل في صفحة login بشكل صحيح
2. ✅ **استخدام Auth Context**: جميع الصفحات تستخدم auth context بشكل موحد
3. ✅ **Logging شامل**: console.log في كل خطوة لتتبع المشاكل
4. ✅ **Build Success**: التطبيق يُبنى بدون أخطاء

### التغييرات:
- **app/mini-app/login/page.tsx**: إضافة auto-login تلقائي عند فتح الصفحة
- **app/mini-app/page.tsx**: تبسيط الكود والتركيز على عرض البيانات
- **lib/auth-context.tsx**: يعمل بشكل صحيح مع SSR

---

## 🧪 كيفية الاختبار

### الطريقة 1: اختبار من المتصفح مباشرة (للتطوير)

#### 1. تشغيل التطبيق
```bash
cd /workspace
pnpm dev
```

#### 2. فتح المتصفح
```
http://localhost:3000/mini-app/login
```

#### 3. فتح Developer Console (F12)
راقب الرسائل في Console:

```
📱 Telegram initData: {...}
👤 Telegram user found: username
🤖 Auto-login attempt for: 123456789
🔐 Performing auto login for telegramId: 123456789
📊 API Response: {...}
✅ User found in database!
🚀 Redirecting to /mini-app...
```

#### 4. إذا لم يكن Telegram متاح (للاختبار المحلي)
أنشئ مستخدم test يدوياً:

```javascript
// في console المتصفح
const testUser = {
  id: '7154440358', // استخدم ID موجود في قاعدة البيانات
  telegramId: '7154440358',
  username: 'saddamalwlai',
  firstName: 'Saddam',
  lastName: 'Alwali',
  balance: 36728,
  level: 'BEGINNER',
  referralCode: 'ref_abc123'
};

localStorage.setItem('telegram_user', JSON.stringify(testUser));
window.location.href = '/mini-app';
```

---

### الطريقة 2: اختبار من Telegram Bot (الطريقة الصحيحة)

#### المتطلبات:
1. ✅ البوت يجب أن يكون مشغلاً
2. ✅ التطبيق يجب أن يكون على HTTPS (Vercel/ngrok)
3. ✅ Web App URL مضبوط في BotFather

#### خطوات الاختبار:

##### 1. تشغيل البوت
```bash
cd /workspace
./start-bot.sh
```

##### 2. نشر التطبيق على Vercel
```bash
# إذا كان لديك Vercel CLI
vercel --prod

# أو ادفع على GitHub وسينشر تلقائياً
git push origin main
```

##### 3. ضبط Web App URL في Telegram

افتح [@BotFather](https://t.me/BotFather) في Telegram:

```
/mybots
→ اختر بوتك
→ Bot Settings
→ Menu Button
→ Configure Menu Button
→ أدخل URL: https://your-app.vercel.app/mini-app/login
```

##### 4. اختبار من Telegram

1. افتح البوت في Telegram
2. اضغط على زر Menu (أسفل شاشة الدردشة)
3. سيفتح التطبيق في Telegram
4. راقب ما يحدث:
   - يجب أن يفتح `/mini-app/login`
   - يجب أن يُسجل دخولك تلقائياً
   - يجب أن تُنقل إلى `/mini-app`
   - يجب أن ترى بياناتك (الرصيد، المهام، الإحالات)

---

## 🔍 تتبع المشاكل

### كيف تعرف أين المشكلة؟

#### 1. افتح Console في Telegram Web App

**على الكمبيوتر**:
- Chrome: `Ctrl + Shift + I`
- Firefox: `F12`
- Safari: `Cmd + Option + I`

**على الموبايل**:
- استخدم [Remote Debugging](https://developer.chrome.com/docs/devtools/remote-debugging/)

#### 2. راقب الرسائل

##### ✅ Login نجح:
```
📱 Telegram initData: {user: {...}}
👤 Telegram user found: username
🤖 Auto-login attempt for: 123456789
🔐 Performing auto login for telegramId: 123456789
📊 API Response: {success: true, data: {...}}
✅ User found in database!
🚀 Redirecting to /mini-app...

🔄 MiniApp useEffect - authUser: username authLoading: false
✅ User logged in, loading data for: username
📊 Fetching user data for: 123456789
📊 API Response: {success: true, data: {...}}
📊 Setting stats: {balance: 36728, ...}
```

##### ❌ Login فشل - Telegram غير متاح:
```
⚠️ Telegram WebApp not available
```

**الحل**: افتح التطبيق من Telegram Bot

##### ❌ Login فشل - User غير موجود في Database:
```
📊 API Response: {success: false, error: 'User not found'}
⚠️ User not found, creating new account...
📊 Create User Response: {success: true, data: {...}}
✅ User created successfully!
```

**الحل**: البوت يجب أن ينشئ المستخدم، أو استخدم `/start` في البوت أولاً

##### ❌ Login فشل - API Error:
```
❌ API failed: Network error
```

**الحل**: تأكد من:
- التطبيق مشغل (`pnpm dev` أو deployed)
- قاعدة البيانات متصلة
- `DATABASE_URL` في `.env` صحيح

##### ❌ Data لم يتم تحميلها:
```
✅ User logged in, loading data for: username
📊 Fetching user data for: 123456789
❌ API error: 404
```

**الحل**: 
```bash
# تأكد من وجود المستخدم في قاعدة البيانات
sqlite3 prisma/dev.db "SELECT * FROM users WHERE telegram_id = '123456789';"
```

---

## 🐛 مشاكل شائعة وحلولها

### 1. "localStorage is not defined"
**السبب**: SSR في Next.js  
**الحل**: تم إصلاحه - جميع `localStorage` محمية بـ `typeof window !== 'undefined'`

### 2. التطبيق يُعيد توجيه إلى login بشكل متكرر
**السبب**: auto-login لا يعمل  
**الحل**: تحقق من:
```javascript
// في Console
window.Telegram?.WebApp?.initDataUnsafe
// يجب أن يعرض: {user: {...}}
```

### 3. البيانات لا تظهر رغم تسجيل الدخول
**السبب**: API لا يُرجع البيانات  
**الحل**: 
```javascript
// اختبر API مباشرة
fetch('/api/users?telegramId=7154440358')
  .then(r => r.json())
  .then(d => console.log(d));
```

### 4. "User not found" رغم وجوده
**السبب**: `telegramId` غير متطابق  
**الحل**:
```bash
# تحقق من نوع البيانات
sqlite3 prisma/dev.db "SELECT telegram_id, typeof(telegram_id) FROM users LIMIT 1;"
# يجب أن يكون 'text' وليس 'integer'
```

---

## 📊 التحقق من قاعدة البيانات

### اختبار الاتصال:
```bash
sqlite3 prisma/dev.db "SELECT COUNT(*) as total_users FROM users;"
```

### عرض المستخدمين:
```bash
sqlite3 prisma/dev.db "SELECT 
  telegram_id, 
  username, 
  balance, 
  tasks_completed,
  referral_count
FROM users 
ORDER BY balance DESC 
LIMIT 10;"
```

### عرض المهام النشطة:
```bash
sqlite3 prisma/dev.db "SELECT 
  id, 
  name, 
  reward, 
  difficulty, 
  is_active 
FROM tasks 
WHERE is_active = 1;"
```

### إنشاء مستخدم test:
```bash
sqlite3 prisma/dev.db "INSERT INTO users (
  id, telegram_id, username, first_name, balance, 
  referral_code, created_at, updated_at
) VALUES (
  'test-user-001',
  '999999999',
  'testuser',
  'Test User',
  5000,
  'ref_test123',
  datetime('now'),
  datetime('now')
);"
```

---

## 🚀 خطوات النشر على Production

### 1. تأكد من البناء بدون أخطاء:
```bash
pnpm run build
```

### 2. ادفع التحديثات:
```bash
git add .
git commit -m "fix: إصلاح مشكلة عرض البيانات - auto-login محسّن"
git push origin main
```

### 3. Vercel سينشر تلقائياً

### 4. اختبر Production:
```
https://your-app.vercel.app/mini-app/login
```

### 5. حدّث Web App URL في BotFather

### 6. اختبر من Telegram

---

## ✅ قائمة التحقق

### قبل الاختبار:
- [ ] البوت مشغل
- [ ] التطبيق مشغل (dev أو production)
- [ ] قاعدة البيانات بها مستخدمين
- [ ] Environment variables مضبوطة

### أثناء الاختبار:
- [ ] افتح Console (F12)
- [ ] راقب الرسائل في Console
- [ ] راقب Network tab للطلبات
- [ ] لاحظ أي errors

### بعد الاختبار الناجح:
- [ ] Login يعمل تلقائياً
- [ ] البيانات تظهر بشكل صحيح
- [ ] الرصيد صحيح
- [ ] عدد المهام صحيح
- [ ] عدد الإحالات صحيح
- [ ] لا توجد errors في Console

---

## 📝 ملاحظات مهمة

### 1. Telegram Web App Security
التطبيق يجب أن يكون على HTTPS في production. استخدم:
- ✅ Vercel (HTTPS تلقائياً)
- ✅ ngrok للاختبار المحلي: `ngrok http 3000`
- ❌ لا تستخدم HTTP في production

### 2. CORS
إذا واجهت مشاكل CORS:
```typescript
// في next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};
```

### 3. Rate Limiting
في production، فعّل rate limiting:
```typescript
// في app/api/users/route.ts
import { rateLimit } from '@/lib/rate-limiter';
// ... استخدم rateLimit في أول كل API route
```

---

## 🆘 الحصول على مساعدة

### إذا لم تنجح الخطوات أعلاه:

1. **جمع المعلومات**:
   - لقطة شاشة من Console
   - الرسائل الكاملة من logs
   - خطوات إعادة المشكلة

2. **فحص الملفات**:
   - `.env` - هل البيانات صحيحة؟
   - `prisma/dev.db` - هل قاعدة البيانات موجودة؟
   - `dist/bot/index.js` - هل البوت مبني؟

3. **إعادة البناء**:
   ```bash
   # نظف كل شيء
   rm -rf .next dist node_modules
   
   # أعد التثبيت
   pnpm install
   
   # أعد البناء
   pnpm run build
   pnpm run build:bot
   ```

4. **اختبر بشكل منفصل**:
   - اختبر API مباشرة: `curl http://localhost:3000/api/health`
   - اختبر قاعدة البيانات: `sqlite3 prisma/dev.db "SELECT 1"`
   - اختبر البوت: `./start-bot.sh`

---

## 📚 ملفات مرجعية

- `DEEP_ANALYSIS_AR.md` - التحليل التقني العميق
- `FINAL_SOLUTION_AR.md` - الحل الكامل
- `MINI_APP_FIX_AR.md` - إصلاحات Mini App السابقة
- `BUILD_FIX_SUMMARY_AR.md` - إصلاحات البناء

---

**آخر تحديث**: 7 نوفمبر 2025  
**الحالة**: ✅ Build Success  
**الاختبار**: ⏳ يحتاج اختبار من Telegram
