# ⚡ حل سريع لمشكلة Vercel

## 🚨 المشكلة

```
❌ SQLite لا يعمل على Vercel
❌ التطبيق على Vercel لا يرى قاعدة البيانات المحلية
❌ البوت محلي والتطبيق على Vercel (منفصلان تماماً)
```

---

## ✅ الحل السريع (3 خطوات)

### الخيار 1: استخدام Vercel Postgres (5 دقائق) ⚡

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login & Link
vercel login
cd /workspace
vercel link

# 3. Create & Connect Database
vercel postgres create telegram-rewards-db
vercel postgres connect

# 4. Pull Variables
vercel env pull .env.vercel

# 5. Update Local .env
# انسخ DATABASE_URL من .env.vercel إلى .env
```

### الخيار 2: استخدام Supabase (10 دقائق) ⚡

```bash
# 1. انشئ حساب على https://supabase.com

# 2. New Project:
#    - Name: telegram-rewards
#    - Password: [password قوي]
#    - Region: US East

# 3. انتظر 2 دقيقة (setup)

# 4. Settings → Database → Connection String
#    انسخ: postgres://postgres:[password]@db.xxx.supabase.co:5432/postgres

# 5. حدّث .env:
DATABASE_URL="postgres://postgres:[password]@db.xxx.supabase.co:5432/postgres"
```

### الخيار 3: استخدام Neon (5 دقائق) ⚡

```bash
# 1. انشئ حساب على https://neon.tech

# 2. Create Project:
#    - Name: telegram-rewards
#    - Region: US East

# 3. Connection String يظهر مباشرة
#    انسخه

# 4. حدّث .env:
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb"
```

---

## 🔄 بعد اختيار Provider

### 1. Update Prisma Schema

```bash
# افتح prisma/schema.prisma
nano prisma/schema.prisma
```

**غيّر السطر 9-10**:
```prisma
# من:
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

# إلى:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Install PostgreSQL Driver

```bash
pnpm add @prisma/client
```

### 3. Generate Prisma Client

```bash
pnpm prisma generate
```

### 4. Push Schema to Database

```bash
pnpm prisma db push
```

### 5. Restart Bot

```bash
./restart-bot.sh
```

### 6. Deploy to Vercel

```bash
git add -A
git commit -m "fix: switch to PostgreSQL for Vercel compatibility"
git push origin main
```

Vercel سينشر تلقائياً!

---

## 🧪 الاختبار

### 1. Local (Bot):
```bash
# يجب أن يعمل
curl http://localhost:3000/api/health
```

### 2. Vercel (App):
```bash
# يجب أن يعمل الآن!
curl https://alwalisoft-omega.vercel.app/api/health
```

---

## ⏱️ الوقت المتوقع

- Vercel Postgres: **5 دقائق**
- Supabase: **10 دقائق**
- Neon: **5 دقائق**

---

## 💰 التكلفة

- **Vercel Postgres**: مجاني حتى 256 MB
- **Supabase**: مجاني حتى 500 MB
- **Neon**: مجاني حتى 3 GB

**كلهم مجانيون للبداية!**

---

## 🎯 التوصية

**استخدم Neon** ✅ لأنه:
- ✅ الأسهل (5 دقائق)
- ✅ الأسخى (3 GB مجاناً)
- ✅ الأسرع
- ✅ لا يحتاج CLI

---

## ⚠️ مهم جداً

بعد التغيير إلى PostgreSQL:

```bash
# حدّث .env في كلا المكانين:
# 1. Local (.env)
DATABASE_URL="postgresql://..."

# 2. Vercel (Environment Variables)
# Settings → Environment Variables
# DATABASE_URL = "postgresql://..."
```

---

## 🔄 نقل البيانات من SQLite

```bash
# 1. Export من SQLite
sqlite3 prisma/dev.db .dump > data.sql

# 2. Clean SQL file
# حذف CREATE TABLE commands (Prisma ينشئهم)

# 3. Import إلى PostgreSQL
psql $DATABASE_URL < data.sql
```

أو استخدم أداة:
- https://github.com/prisma/prisma/tree/main/packages/prisma/scripts
- https://www.prisma.io/docs/guides/migrate/seed-database

---

## ✅ النتيجة المتوقعة

بعد التطبيق:

```
✅ Bot → PostgreSQL
✅ Vercel App → PostgreSQL
✅ نفس قاعدة البيانات
✅ Real-time sync
✅ كل شيء يعمل!
```

---

**الحالة**: ⚡ جاهز للتطبيق  
**الوقت**: 5-10 دقائق  
**التكلفة**: مجاني  

🚀 **ابدأ الآن!**
