# 🔄 Database Migration - Multi-Platform Support

## التغييرات في قاعدة البيانات

### 1. تحديث جدول `ad_watches`

**الحقل الجديد:**
```sql
ALTER TABLE ad_watches 
ADD COLUMN platform VARCHAR(20) DEFAULT 'ADMOB';

CREATE INDEX idx_ad_watches_platform ON ad_watches(platform);
```

**الهدف:** تتبع المنصة التي عُرض منها كل إعلان.

---

## 🔧 خيارات الـ Migration

### الخيار 1: باستخدام Prisma Migrate (موصى به)

```bash
# 1. تأكد من تحديث schema.prisma (تم ✅)
# 2. أنشئ migration
npx prisma migrate dev --name add_platform_to_ad_watches

# 3. راجع الـ migration
# 4. طبّق على Production
npx prisma migrate deploy
```

### الخيار 2: SQL مباشر (للإنتاج)

إذا كان لديك بيانات حالية، استخدم:

```sql
-- Production database
-- تأكد من عمل backup أولاً!

BEGIN;

-- 1. إضافة العمود
ALTER TABLE ad_watches 
ADD COLUMN IF NOT EXISTS platform VARCHAR(20) DEFAULT 'ADMOB';

-- 2. تحديث القيم الحالية (اختياري)
UPDATE ad_watches 
SET platform = 'ADMOB' 
WHERE platform IS NULL;

-- 3. إنشاء الـ index
CREATE INDEX IF NOT EXISTS idx_ad_watches_platform 
ON ad_watches(platform);

COMMIT;
```

### الخيار 3: Script تلقائي

```bash
# استخدم هذا Script
node scripts/migrate-add-platform.js
```

---

## 📝 Script Migration

إنشاء ملف: `scripts/migrate-add-platform.js`

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('🔄 Starting migration: add platform to ad_watches...');
  
  try {
    // تحقق من البيئة
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Production mode - please confirm (y/n):');
      const confirm = await new Promise(resolve => {
        process.stdin.once('data', data => {
          resolve(data.toString().trim().toLowerCase() === 'y');
        });
      });
      
      if (!confirm) {
        console.log('❌ Migration cancelled');
        return;
      }
    }
    
    // تطبيق الـ migration
    await prisma.$executeRaw`
      ALTER TABLE ad_watches 
      ADD COLUMN IF NOT EXISTS platform VARCHAR(20) DEFAULT 'ADMOB'
    `;
    
    console.log('✅ Column added');
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_ad_watches_platform 
      ON ad_watches(platform)
    `;
    
    console.log('✅ Index created');
    
    // تحديث السجلات الحالية
    const updated = await prisma.$executeRaw`
      UPDATE ad_watches 
      SET platform = 'ADMOB' 
      WHERE platform IS NULL
    `;
    
    console.log(`✅ Updated ${updated} existing records`);
    
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
```

---

## 🚀 كيفية التطبيق

### للـ Development:

```bash
# 1. تحديث Prisma schema (تم ✅)
# 2. Generate Prisma Client
pnpm prisma generate

# 3. أنشئ migration
pnpm prisma migrate dev --name add_platform_to_ad_watches

# 4. تحقق من النتيجة
pnpm prisma studio
```

### للـ Production (Vercel):

```bash
# الخيار 1: Prisma Migrate (موصى به)
# في Vercel, أضف في Build Command:
prisma migrate deploy && next build

# الخيار 2: في Vercel Postgres Dashboard
# نفذ SQL مباشرة:
ALTER TABLE ad_watches 
ADD COLUMN platform VARCHAR(20) DEFAULT 'ADMOB';

CREATE INDEX idx_ad_watches_platform 
ON ad_watches(platform);
```

---

## ✅ التحقق من نجاح الـ Migration

### 1. في Terminal:

```bash
# تحقق من البنية
pnpm prisma db pull
pnpm prisma format
```

### 2. في Prisma Studio:

```bash
pnpm prisma studio
# افتح جدول AdWatch
# تحقق من وجود عمود "platform"
```

### 3. في التطبيق:

```typescript
// جرب هذا
const stats = await multiPlatformAdManager.getUserAdStats('test-user-id');
console.log('Platform stats:', stats.platformStats);
// يجب أن يعرض إحصائيات لكل منصة
```

---

## 🔄 Rollback (إلغاء التغييرات)

إذا احتجت العودة:

```sql
-- حذف الـ index
DROP INDEX IF EXISTS idx_ad_watches_platform;

-- حذف العمود
ALTER TABLE ad_watches DROP COLUMN platform;
```

أو باستخدام Prisma:

```bash
# العودة لـ migration سابقة
pnpm prisma migrate resolve --rolled-back add_platform_to_ad_watches
```

---

## 📊 البيانات القديمة

**لا تقلق!** جميع البيانات القديمة:
- ✅ محفوظة
- ✅ سيتم تعيين `platform = 'ADMOB'` تلقائياً
- ✅ لن تتأثر أي وظيفة موجودة

---

## ⚠️ تحذيرات

### قبل تطبيق Migration على Production:

```
1. ✅ عمل Backup للقاعدة
2. ✅ اختبار على Development أولاً
3. ✅ مراجعة SQL script
4. ✅ التأكد من عدم وجود queries نشطة
5. ✅ إعلام المستخدمين (إذا كان downtime)
```

### بعد الـ Migration:

```
1. ✅ فحص Application logs
2. ✅ التحقق من عمل الإعلانات
3. ✅ مراجعة Database performance
4. ✅ اختبار جميع المنصات
```

---

## 🎯 الحالة

```
Schema Update:     ✅ تم
Migration Script:  ✅ جاهز
Documentation:     ✅ مكتمل
Testing:          ⏳ في انتظار التطبيق

الخطوة التالية:
→ تطبيق Migration على Development
→ اختبار شامل
→ تطبيق على Production
```

---

## 📞 الدعم

إذا واجهت مشكلة:

1. راجع Prisma logs: `pnpm prisma --version`
2. تحقق من Database connection: `pnpm prisma db push`
3. راجع Schema: `pnpm prisma format`
4. اتصل بفريق Vercel Support إذا كنت على Vercel Postgres

---

**التاريخ:** 8 نوفمبر 2025  
**Migration:** add_platform_to_ad_watches  
**الحالة:** ✅ جاهز للتطبيق
