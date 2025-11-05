# 🤖 تشغيل البوت - تعليمات

## ✅ البوت الآن يعمل!

### 📊 الحالة الحالية:

```
✅ البوت: makeittooeasy_bot
✅ قاعدة البيانات: SQLite (dev.db)
✅ Schema: جاهز وم synchronize
✅ التسجيل: يعمل بشكل صحيح
```

---

## 🚀 كيفية التشغيل:

### 1. **تشغيل البوت محلياً:**

```bash
cd /workspace
pnpm dev:bot
```

أو في الخلفية:

```bash
nohup pnpm dev:bot > bot.log 2>&1 &
```

### 2. **إيقاف البوت:**

```bash
pkill -f "bot/index.ts"
```

### 3. **عرض logs:**

```bash
tail -f bot.log
```

---

## 🧪 اختبار البوت:

### على Telegram:

1. افتح Telegram
2. ابحث عن: `@makeittooeasy_bot`
3. اضغط Start
4. يجب أن يرسل لك رسالة ترحيب!

---

## ⚠️ المشكلة السابقة:

إذا ظهرت رسالة:
```
An error occurred during registration. Please try again.
```

### الأسباب المحتملة:

1. ❌ **البوت غير يعمل**: تأكد من أن البوت يعمل:
   ```bash
   ps aux | grep "bot/index"
   ```

2. ❌ **الـ database غير متصلة**: تأكد من وجود الملف:
   ```bash
   ls -la prisma/dev.db
   ```

3. ❌ **Schema غير محدث**: قم بتحديث الـ schema:
   ```bash
   pnpm prisma:push
   ```

---

## 🔍 التحقق من البوت:

### 1. **التحقق من webhook:**

```bash
curl "https://api.telegram.org/bot8497278773:AAHSyGW3pcCGi3axsSXlaYRydLOqpUIcPoI/getWebhookInfo"
```

يجب أن يكون `url: ""` (فارغ) للـ polling mode.

### 2. **حذف webhook (إذا لزم الأمر):**

```bash
curl "https://api.telegram.org/bot8497278773:AAHSyGW3pcCGi3axsSXlaYRydLOqpUIcPoI/deleteWebhook"
```

### 3. **التحقق من حالة البوت:**

```bash
curl "https://api.telegram.org/bot8497278773:AAHSyGW3pcCGi3axsSXlaYRydLOqpUIcPoI/getMe"
```

---

## 📋 Checklist للتأكد من عمل البوت:

```
✅ البوت يعمل (ps aux | grep bot)
✅ webhook = "" (polling mode)
✅ database موجودة (prisma/dev.db)
✅ .env file موجود وصحيح
✅ TELEGRAM_BOT_TOKEN صحيح
```

---

## 🎯 الخطوات التالية:

### إذا كان البوت يعمل محلياً:

1. **اختبره على Telegram** (@makeittooeasy_bot)
2. إذا عمل → ✅ النجاح!
3. إذا لم يعمل → أرسل logs:
   ```bash
   tail -50 bot.log
   ```

---

## 🚀 Deploy إلى Production:

### الآن يعمل محلياً، لكن للـ production:

يجب استخدام **Webhook mode** بدلاً من polling:

```typescript
// في bot/index.ts
// بدلاً من:
await bot.launch();

// استخدم:
if (process.env.NODE_ENV === 'production') {
  await bot.telegram.setWebhook(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`
  );
} else {
  await bot.launch();
}
```

---

## 📝 ملاحظات:

1. **Redis**: اختياري - البوت يعمل بدونه
2. **SQLite**: للتطوير فقط - استخدم PostgreSQL للـ production
3. **Webhook**: ضروري لـ Vercel deployment

---

## 🆘 المساعدة:

إذا استمرت المشكلة، تحقق من:

1. Bot logs: `tail -50 bot.log`
2. Database: `pnpm prisma studio`
3. Telegram API status
4. .env variables

---

**البوت الآن جاهز للاستخدام! 🎉**
