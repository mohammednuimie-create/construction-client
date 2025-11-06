# 🌐 اختبار API في Render.com

## ❌ المشكلة:
تحاول الوصول إلى `http://localhost:10000/api/health` لكن Backend غير يعمل محلياً.

---

## ✅ الحل:

### Backend موجود على Render.com، وليس localhost!

استخدم URL الخاص بـ Render:

```
https://construction-backend-nw0g.onrender.com/api/health
```

---

## 🔗 URLs الصحيحة للاختبار:

### 1. Health Endpoint:
```
https://construction-backend-nw0g.onrender.com/api/health
```

يجب أن ترى:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "..."
}
```

### 2. API Root:
```
https://construction-backend-nw0g.onrender.com/
```

يجب أن ترى:
```json
{
  "message": "Construction Management API",
  "version": "1.0.0",
  "status": "running"
}
```

---

## 📋 الفرق بين localhost و Render:

### localhost (محلي):
- `http://localhost:10000` = Backend على جهازك المحلي
- يحتاج Backend أن يكون مشغلاً على جهازك
- للاختبار المحلي فقط

### Render.com (السحابة):
- `https://construction-backend-nw0g.onrender.com` = Backend على Render
- يعمل دائماً (إذا كان Service نشط)
- للـ Production

---

## 🎯 استخدم Render URL:

افتح في المتصفح:
```
https://construction-backend-nw0g.onrender.com/api/health
```

---

## 💡 إذا أردت تشغيل Backend محلياً:

### للاختبار المحلي فقط:
1. افتح Terminal
2. اذهب إلى مجلد `server`:
   ```bash
   cd server
   ```
3. شغّل Backend:
   ```bash
   npm start
   ```
4. الآن يمكنك الوصول إلى:
   ```
   http://localhost:4000/api/health
   ```

**لكن للـ Production، استخدم Render URL!**

---

## ✅ الخطوات الصحيحة:

1. **افتح في المتصفح:**
   ```
   https://construction-backend-nw0g.onrender.com/api/health
   ```

2. **تحقق من النتيجة:**
   - إذا رأيت JSON response → ✅ يعمل!
   - إذا رأيت "Not Found" → Service لم يعيد Build بعد
   - إذا رأيت خطأ → تحقق من Logs في Render

---

**استخدم Render URL بدلاً من localhost! 🌐**


