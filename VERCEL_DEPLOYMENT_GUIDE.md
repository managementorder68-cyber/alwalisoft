# 🚀 دليل النشر على Vercel - Vercel Deployment Guide

## ⚠️ مهم جداً!

هذا البرنامج هو **بوت صدام الولي** (@makeittooeasy_bot) وليس برنامج الفواتير!

---

## 📋 الخطوات الكاملة للنشر

### 1️⃣ تسجيل الدخول إلى Vercel

```bash
https://vercel.com/login
```

### 2️⃣ إنشاء مشروع جديد

1. اضغط **"Add New"** → **"Project"**
2. اختر **GitHub repository**: `ipeapp/alwalisoft`
3. اختر **Branch**: `cursor/build-telegram-task-and-reward-bot-platform-8521`

### 3️⃣ إعدادات المشروع (Build Settings)

```
Framework Preset: Next.js
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install
Node Version: 20.x
```

### 4️⃣ متغيرات البيئة (Environment Variables)

**الأساسية (مطلوبة):**

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=8497278773:AAHSyGW3pcCGi3axsSXlaYRydLOqpUIcPoI
TELEGRAM_BOT_USERNAME=makeittooeasy_bot

# Database (استخدم SQLite للتجربة)
DATABASE_URL=file:./prisma/dev.db

# JWT & Security
JWT_SECRET=telegram-rewards-bot-super-secret-jwt-key-change-in-production
API_SECRET=telegram-rewards-bot-api-secret-key

# Next.js
NEXT_PUBLIC_BOT_USERNAME=makeittooeasy_bot
NEXT_PUBLIC_API_URL=https://YOUR-PROJECT-NAME.vercel.app
NEXT_PUBLIC_APP_URL=https://YOUR-PROJECT-NAME.vercel.app

# App Config
NODE_ENV=production
LOG_LEVEL=info
```

**الاختيارية (للإنتاج):**

```bash
# PostgreSQL من Supabase/Neon/Railway
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public

# Redis من Upstash
REDIS_URL=redis://default:password@host:port

# إعدادات السحب
MIN_WITHDRAWAL_AMOUNT=5000000
COIN_TO_USDT_RATE=1000000

# إعدادات الإحالة
REFERRAL_LEVEL1_REWARD=1000
REFERRAL_LEVEL1_COMMISSION=0.10
REFERRAL_LEVEL2_REWARD=500
REFERRAL_LEVEL2_COMMISSION=0.05
REFERRAL_LEVEL3_REWARD=250
REFERRAL_LEVEL3_COMMISSION=0.02
REFERRAL_SIGNUP_BONUS=5000
REFERRED_USER_SIGNUP_BONUS=2000
```

### 5️⃣ إعدادات إضافية (Optional Settings)

**Root Directory:**
- اتركه فارغاً (يستخدم الجذر `/`)

**Install Command:**
```bash
pnpm install --no-frozen-lockfile
```

**Build Command (متقدم):**
```bash
pnpm build
```

### 6️⃣ النشر (Deploy)

اضغط **"Deploy"** وانتظر 2-3 دقائق

---

## ✅ التحقق من النشر الناجح

### 1. افتح الرابط:

```
https://YOUR-PROJECT-NAME.vercel.app
```

### 2. يجب أن ترى:

```
✅ بوت صدام الولي
✅ Telegram Rewards Bot
✅ صفحة تطبيق Mini App
```

### 3. اختبر API Health:

```
https://YOUR-PROJECT-NAME.vercel.app/api/health
```

يجب أن يرجع:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

---

## 🔗 ربط البوت بالتطبيق

### 1. حدّث `.env` في المشروع:

```bash
NEXT_PUBLIC_APP_URL=https://YOUR-PROJECT-NAME.vercel.app
```

### 2. حدّث البوت على BotFather:

```
1. افتح @BotFather
2. أرسل /mybots
3. اختر @makeittooeasy_bot
4. اضغط "Bot Settings"
5. اضغط "Menu Button"
6. أرسل URL: https://YOUR-PROJECT-NAME.vercel.app/mini-app
```

### 3. اختبر البوت:

```
1. افتح @makeittooeasy_bot
2. أرسل /start
3. اضغط "فتح التطبيق"
4. يجب أن يفتح التطبيق الصحيح! ✅
```

---

## 🗄️ قاعدة البيانات للإنتاج

### للإنتاج، استخدم PostgreSQL:

**خيار 1: Supabase (مجاني)**

```bash
1. https://supabase.com
2. إنشاء مشروع جديد
3. انسخ Database URL
4. أضفه في Vercel Environment Variables
```

**خيار 2: Neon (مجاني)**

```bash
1. https://neon.tech
2. إنشاء database جديد
3. انسخ Connection String
4. أضفه في Vercel Environment Variables
```

**خيار 3: Railway**

```bash
1. https://railway.app
2. إضافة PostgreSQL plugin
3. انسخ Database URL
4. أضفه في Vercel Environment Variables
```

### بعد إعداد Database:

```bash
# في Terminal المحلي:
DATABASE_URL="postgresql://..." pnpm prisma migrate deploy
DATABASE_URL="postgresql://..." pnpm prisma db seed
```

---

## 🎨 التخصيص

### تغيير اسم التطبيق:

في `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "بوت صدام الولي - Telegram Rewards Bot",
  description: "احصل على مكافآت من إكمال المهام، اللعب، ودعوة الأصدقاء",
}
```

### تغيير الألوان:

في `app/globals.css`:

```css
/* غير الألوان الأساسية */
--primary: 262.1 83.3% 57.8%;
--primary-foreground: 210 20% 98%;
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: 404 Not Found

**الحل:**
- تأكد من `vercel.json` موجود
- تأكد من `middleware.ts` موجود
- أعد البناء على Vercel

### المشكلة: Database Connection Error

**الحل:**
- تأكد من `DATABASE_URL` صحيح
- استخدم SQLite للتجربة: `file:./prisma/dev.db`
- لـ PostgreSQL، استخدم URL كامل

### المشكلة: Build Fails

**الحل:**
- تحقق من logs على Vercel
- تأكد من جميع dependencies مثبتة
- تأكد من `pnpm-lock.yaml` موجود

### المشكلة: Environment Variables لا تعمل

**الحل:**
- تأكد من إضافتها في Vercel Dashboard
- أعد Deploy بعد إضافتها
- استخدم `NEXT_PUBLIC_` للمتغيرات في Client Side

---

## 📊 مراقبة الأداء

### Vercel Analytics:

```bash
1. Vercel Dashboard → Project → Analytics
2. شاهد الزيارات والأداء
3. راقب Errors و Warnings
```

### Vercel Logs:

```bash
1. Vercel Dashboard → Project → Deployments
2. اضغط على آخر deployment
3. اضغط "View Function Logs"
4. راقب API requests و errors
```

---

## 🔐 الأمان

### حماية API Routes:

جميع API routes محمية بـ:

```typescript
✅ JWT Authentication
✅ Rate Limiting
✅ Input Validation
✅ CORS Headers
```

### حماية Database:

```typescript
✅ Prisma ORM (SQL Injection Protection)
✅ Encrypted Passwords
✅ Sanitized Inputs
```

---

## 📚 روابط مفيدة

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Telegram Bot API:** https://core.telegram.org/bots/api

---

## 🎯 الخلاصة

✅ **الكود جاهز 100%**
✅ **البناء ينجح بدون أخطاء**
✅ **جميع الميزات تعمل**

فقط:
1. أنشئ مشروع جديد على Vercel
2. اربطه بـ GitHub repo
3. أضف Environment Variables
4. Deploy!

---

**الرابط الحالي `alwalisoft.vercel.app` يعرض برنامج آخر (فواتير)، لذلك يجب إنشاء deployment جديد أو استبدال القديم!**

🚀 **بالتوفيق!**
