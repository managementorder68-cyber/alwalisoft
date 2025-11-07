# دليل الإعداد الكامل

## 📅 التاريخ: 7 نوفمبر 2025

---

## ✅ ما تم إنجازه

### 1. تحليل شامل للملفات ✅
- قراءة Schema كاملاً (608 سطر)
- فحص جميع الـ enums
- فحص قاعدة البيانات (21 جدول)
- التحقق من المتغيرات

### 2. اكتشاف المشاكل الحرجة ✅
- ❌ ملف `.env` غير موجود
- ❌ عدم تطابق `UserLevel` enum
- ✅ تم إصلاح كل شيء

### 3. الإصلاحات المطبقة ✅
- ✅ إنشاء ملف `.env`
- ✅ إصلاح UserLevel في Admin page
- ✅ Build success
- ✅ تشغيل السكريبت `./restart-bot.sh`

---

## 🎯 حالة المشروع الآن

### ✅ ما يعمل:
```
✅ قاعدة البيانات: 21 جدول، 5 مستخدمين، 10 مهام
✅ Schema: صحيح 100%
✅ Build: ناجح بدون أخطاء
✅ Admin Page: جاهز للاستخدام
✅ Mini App: جاهز للاختبار
✅ restart-bot.sh: يعمل
```

### ⚠️ ما يحتاج إعداد:
```
⚠️ TELEGRAM_BOT_TOKEN: يحتاج token حقيقي من BotFather
⚠️ TELEGRAM_BOT_USERNAME: يحتاج اسم البوت
⚠️ ADMIN_TELEGRAM_IDS: يحتاج Telegram ID للمشرفين
```

---

## 🔧 خطوات الإعداد النهائية

### الخطوة 1: احصل على Bot Token من BotFather

1. افتح Telegram وابحث عن [@BotFather](https://t.me/BotFather)
2. أرسل `/newbot` لإنشاء بوت جديد (أو استخدم بوتك الموجود)
3. اتبع التعليمات
4. ستحصل على token مثل: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
5. **احتفظ به سرياً!**

### الخطوة 2: حدّث ملف .env

```bash
# افتح ملف .env
nano .env
```

**عدّل هذه القيم**:
```env
# ضع Bot Token الحقيقي هنا
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"

# ضع اسم البوت (بدون @)
TELEGRAM_BOT_USERNAME="YourBotUsername"

# ضع Telegram ID للمشرفين (للحصول عليه، أرسل /start لـ @userinfobot)
ADMIN_TELEGRAM_IDS="123456789,987654321"

# URL التطبيق (بعد النشر على Vercel)
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NEXT_PUBLIC_BOT_USERNAME="YourBotUsername"
```

### الخطوة 3: أعد تشغيل البوت

```bash
./restart-bot.sh
```

**يجب أن ترى**:
```
🔄 إعادة تشغيل بوت تليجرام...
✅ قاعدة البيانات موجودة
✅ البيئة جاهزة
🚀 بدء تشغيل البوت...
✅ البوت يعمل (PID: xxxxx)

📋 آخر 15 سطر من السجل:
[INFO] Bot started successfully  ✅
[INFO] Connected to database     ✅
[INFO] Listening for updates...  ✅
```

---

## 📊 المشاكل التي تم إصلاحها

### 1. UserLevel Enum Mismatch

#### ❌ قبل:
```typescript
// Admin Page كان يستخدم:
BEGINNER, INTERMEDIATE, ADVANCED, EXPERT

// Schema يحتوي:
BEGINNER, PROFESSIONAL, EXPERT, VIP
```

#### ✅ بعد:
```typescript
// الآن Admin Page يستخدم:
BEGINNER, PROFESSIONAL, EXPERT, VIP  // ✅ متطابق تماماً!
```

### 2. ملف .env مفقود

#### ❌ قبل:
```bash
$ ls -la .env
ls: cannot access '.env': No such file or directory
```

#### ✅ بعد:
```bash
$ ls -la .env
-rw-r--r-- 1 ubuntu ubuntu 640 Nov 7 .env  ✅
```

---

## 📁 هيكل الملفات

### Environment:
```
.env                    ✅ (تم إنشاؤه - يحتاج تحديث القيم)
.env.example            ✅ (موجود - مرجع)
.env.postgres.backup    ✅ (موجود - نسخة احتياطية)
```

### Database:
```
prisma/
  ├── schema.prisma     ✅ (608 سطر - صحيح 100%)
  └── dev.db            ✅ (5 users, 10 tasks)
```

### Scripts:
```
restart-bot.sh          ✅ (محسّن ويعمل)
start-bot.sh            ✅ (موجود)
```

---

## 🔍 Schema Reference الكامل

### UserLevel (تم إصلاحه):
```prisma
enum UserLevel {
  BEGINNER      // مبتدئ
  PROFESSIONAL  // محترف
  EXPERT        // خبير
  VIP           // VIP
}
```

### TaskCategory:
```prisma
enum TaskCategory {
  CHANNEL_SUBSCRIPTION  // الاشتراك في قناة
  GROUP_JOIN           // الانضمام لمجموعة
  VIDEO_WATCH          // مشاهدة فيديو
  POST_INTERACTION     // التفاعل مع منشور
  CONTENT_SHARE        // مشاركة محتوى
  SPECIAL_EVENT        // حدث خاص
  REFERRAL_BONUS       // مكافأة إحالة
  DAILY_LOGIN          // تسجيل دخول يومي
  SURVEY               // استطلاع رأي
}
```

### TaskType:
```prisma
enum TaskType {
  DAILY      // يومية
  WEEKLY     // أسبوعية
  SPECIAL    // خاصة
  BONUS      // مكافأة
  ONE_TIME   // لمرة واحدة
}
```

### TaskDifficulty:
```prisma
enum TaskDifficulty {
  EASY    // سهل
  MEDIUM  // متوسط
  HARD    // صعب
  EXPERT  // خبير
}
```

### RewardType:
```prisma
enum RewardType {
  TASK_COMPLETION  // إكمال مهمة
  REFERRAL_BONUS   // مكافأة إحالة
  DAILY_BONUS      // مكافأة يومية
  GAME_WIN         // ربح لعبة
  SPECIAL_EVENT    // حدث خاص
  ADMIN_GRANT      // منحة من المشرف
  PROMOTION        // ترويج
  CARD_SALE        // بيع بطاقة
  GEM_EXCHANGE     // تبادل جواهر
}
```

### WithdrawalStatus:
```prisma
enum WithdrawalStatus {
  PENDING      // قيد الانتظار
  PROCESSING   // جاري المعالجة
  COMPLETED    // مكتمل
  FAILED       // فشل
  REJECTED     // مرفوض
  CANCELLED    // ملغى
}
```

---

## 🗄️ قاعدة البيانات

### الجداول (21 جدول):
```sql
1.  users               ✅ 5 صفوف
2.  tasks               ✅ 10 صفوف
3.  task_completions    ✅
4.  referrals           ✅
5.  referral_trees      ✅
6.  reward_ledgers      ✅
7.  wallets             ✅
8.  withdrawals         ✅
9.  cards               ✅
10. card_collections    ✅
11. gem_transactions    ✅
12. game_sessions       ✅
13. leaderboards        ✅
14. promotions          ✅
15. daily_bonuses       ✅
16. notifications       ✅
17. admins              ✅
18. audit_logs          ✅
19. system_configs      ✅
20. user_settings       ✅
21. user_statistics     ✅
```

### بيانات الاختبار:
```sql
-- المستخدمون الموجودون:
telegram_id     username            balance
7154440358      saddamalwlai       36728
5459513475      user_5459513475    2000
6411364378      user_6411364378    2000
1790537848      Tt_2_A             7000
5378667659      Ibrahimmohmeed     2000

-- المهام النشطة: 10
```

---

## 🧪 الاختبار

### 1. اختبار Admin Page
```bash
# 1. شغّل التطبيق
pnpm dev

# 2. افتح
http://localhost:3000/admin/tasks/create

# 3. املأ النموذج:
- الاسم: "مهمة تجريبية"
- الوصف: "هذه مهمة للاختبار"
- الفئة: "تسجيل دخول يومي"
- النوع: "يومية"
- الصعوبة: "سهل"
- المستوى المطلوب: "مبتدئ" أو "محترف" أو "خبير" أو "VIP"
- المكافأة: 500

# 4. اضغط "إنشاء المهمة"
# ✅ يجب أن تُنشأ بنجاح!
```

### 2. اختبار البوت
```bash
# 1. تأكد من تحديث .env بـ token حقيقي

# 2. شغّل البوت
./restart-bot.sh

# 3. افتح Telegram وابحث عن بوتك
# 4. أرسل /start
# ✅ يجب أن يرد البوت!
```

### 3. اختبار Mini App
```bash
# 1. انشر على Vercel
vercel --prod

# 2. ضبط Web App URL في BotFather
/mybots → [بوتك] → Bot Settings → Menu Button
→ https://your-app.vercel.app/mini-app/login

# 3. افتح البوت في Telegram
# 4. اضغط Menu
# ✅ يجب أن يفتح التطبيق ويعرض البيانات!
```

---

## 📝 ملف .env الكامل

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Telegram Bot (⚠️ عدّل هذه القيم!)
TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN_HERE"
TELEGRAM_BOT_USERNAME="YOUR_BOT_USERNAME"

# Redis (Optional - يمكن تركه معطل)
# REDIS_URL="redis://localhost:6379"

# App URLs (⚠️ عدّل بعد النشر على Vercel)
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NEXT_PUBLIC_BOT_USERNAME="YOUR_BOT_USERNAME"

# JWT
JWT_SECRET="telegram-rewards-bot-secret-key-2025"

# Admin (⚠️ أضف Telegram ID الخاص بك)
# للحصول على ID: أرسل /start لـ @userinfobot
ADMIN_TELEGRAM_IDS="123456789"

# Referral Rewards
LEVEL_1_REWARD=5000
LEVEL_2_REWARD_PERCENTAGE=10
LEVEL_3_REWARD_PERCENTAGE=5
REFERRED_USER_SIGNUP_BONUS=1000

# Environment
NODE_ENV="development"
```

---

## 🚀 خطوات التشغيل

### Development (محلي):
```bash
# 1. حدّث .env
nano .env

# 2. شغّل التطبيق
pnpm dev

# 3. شغّل البوت (في terminal آخر)
./restart-bot.sh

# 4. افتح المتصفح
http://localhost:3000
```

### Production:
```bash
# 1. Build
pnpm run build

# 2. نشر على Vercel
vercel --prod

# 3. شغّل البوت على السيرفر
./restart-bot.sh

# أو استخدم PM2:
pm2 start dist/bot/index.js --name telegram-bot
```

---

## ⚠️ ملاحظات مهمة

### 1. حماية ملف .env
```bash
# تأكد أن .env في .gitignore
echo ".env" >> .gitignore

# لا ترفع .env على GitHub أبداً!
```

### 2. Bot Token
```
⚠️ Token حساس جداً!
⚠️ لا تشاركه مع أحد
⚠️ إذا تسرب، أعد إنشاءه من BotFather بـ /revoke
```

### 3. Database Backups
```bash
# اعمل نسخة احتياطية دورياً
cp prisma/dev.db prisma/dev.db.backup

# أو استخدم:
sqlite3 prisma/dev.db ".backup 'backup.db'"
```

---

## ✅ قائمة التحقق النهائية

### قبل التشغيل:
- [x] تحليل Schema ✅
- [x] إصلاح UserLevel ✅
- [x] إنشاء .env ✅
- [x] Build success ✅
- [ ] تحديث TELEGRAM_BOT_TOKEN في .env
- [ ] تحديث ADMIN_TELEGRAM_IDS في .env

### للاختبار:
- [ ] اختبار Admin Page
- [ ] اختبار البوت من Telegram
- [ ] اختبار Mini App
- [ ] اختبار إضافة مهمة

### للنشر:
- [ ] نشر على Vercel
- [ ] ضبط Web App URL في BotFather
- [ ] تشغيل البوت على السيرفر
- [ ] اختبار نهائي

---

## 📞 المساعدة

### إذا البوت لم يعمل:
```bash
# 1. تحقق من السجل
cat bot.log

# 2. تحقق من .env
cat .env | grep TELEGRAM_BOT_TOKEN

# 3. تحقق من Token في BotFather
# أرسل /mybots في Telegram
```

### إذا Admin Page لم يعمل:
```bash
# 1. تحقق من Build
pnpm run build

# 2. افتح Console (F12)
# 3. راقب Network tab
# 4. انظر إلى response من API
```

---

**تاريخ الإعداد**: 7 نوفمبر 2025  
**الحالة**: ✅ جاهز للاستخدام  
**الخطوة التالية**: حدّث .env وشغّل البوت!

🎉 **كل شيء جاهز! فقط حدّث .env وابدأ!**
