# 🔧 حل مشكلة "Failed to exchange code for token"

## المشكلة

بعد إدخال البريد الإلكتروني في Google OAuth، يظهر خطأ "Failed to exchange code for token".

## الأسباب المحتملة

### 1. **Environment Variables غير موجودة في Backend**

تأكد من إضافة المتغيرات التالية في Backend (Render.com أو localhost):

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
FRONTEND_URL=http://localhost:3000
```

**للتحقق في localhost:**
- افتح `.env` في مجلد `server/`
- تأكد من وجود المتغيرات الثلاثة

**للتحقق في Render.com:**
- اذهب إلى Dashboard → Environment tab
- تأكد من وجود المتغيرات الثلاثة

---

### 2. **Redirect URI غير متطابق**

المشكلة الأكثر شيوعاً! يجب أن يطابق `redirect_uri` تماماً ما هو مسجل في Google Cloud Console.

**الخطوات:**

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. اضغط على OAuth 2.0 Client ID الخاص بك
4. في **Authorized redirect URIs**، تأكد من وجود:
   - `http://localhost:3000/auth/google/callback` (للـ Development)
   - `https://your-frontend-domain.com/auth/google/callback` (للـ Production)

**⚠️ مهم:**
- يجب أن يكون مطابقاً **تماماً** (بما في ذلك `http://` vs `https://`)
- لا مسافات إضافية
- لا `/` في النهاية (إلا إذا كان موجوداً في Google Console)

---

### 3. **Client ID أو Client Secret غير صحيح**

تأكد من:
- نسخ `Client ID` و `Client Secret` بدون مسافات إضافية
- عدم وجود أخطاء في النسخ
- استخدام `Client ID` و `Client Secret` من نفس المشروع

---

### 4. **الكود منتهي الصلاحية**

Google authorization codes تنتهي صلاحيتها بسرعة (عادة خلال دقائق). إذا استغرقت العملية وقتاً طويلاً، قد ينتهي الكود.

**الحل:** حاول تسجيل الدخول مرة أخرى.

---

## 🔍 كيفية التحقق من المشكلة

### في Browser Console:

افتح Developer Tools (F12) → Console، وستجد رسائل خطأ مفصلة مثل:

- `redirect_uri_mismatch` → المشكلة في Redirect URI
- `invalid_client` → المشكلة في Client ID/Secret
- `invalid_grant` → الكود منتهي الصلاحية

### في Backend Logs:

في Render.com أو localhost terminal، ستجد:
- `Google OAuth credentials not configured` → المتغيرات غير موجودة
- `Failed to exchange code for token` → تفاصيل الخطأ من Google

---

## ✅ الحل السريع

### للـ Development (localhost):

1. **تأكد من `.env` في `server/`:**
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
FRONTEND_URL=http://localhost:3000
```

2. **أعد تشغيل Backend:**
```bash
cd server
npm start
```

3. **في Google Cloud Console:**
   - تأكد من وجود `http://localhost:3000/auth/google/callback` في **Authorized redirect URIs**

4. **جرب تسجيل الدخول مرة أخرى**

### للـ Production (Render.com):

1. **في Render.com Dashboard:**
   - Environment tab
   - أضف/تحقق من:
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `FRONTEND_URL=https://your-domain.com`

2. **في Google Cloud Console:**
   - أضف `https://your-domain.com/auth/google/callback` في **Authorized redirect URIs**

3. **انتظر إعادة تشغيل Service** (عادة 1-2 دقيقة)

4. **جرب تسجيل الدخول مرة أخرى**

---

## 📝 Checklist

- [ ] `GOOGLE_CLIENT_ID` موجود في Backend
- [ ] `GOOGLE_CLIENT_SECRET` موجود في Backend
- [ ] `FRONTEND_URL` صحيح (localhost أو production URL)
- [ ] Redirect URI في Google Console يطابق `FRONTEND_URL/auth/google/callback`
- [ ] Client ID و Client Secret صحيحان (من نفس المشروع)
- [ ] Backend يعمل ويستقبل الطلبات
- [ ] جربت تسجيل الدخول مرة أخرى (للتأكد من أن الكود لم ينته)

---

## 🆘 إذا استمرت المشكلة

1. افتح Browser Console (F12) وانسخ رسالة الخطأ الكاملة
2. افتح Backend Logs وانسخ آخر رسائل الخطأ
3. تحقق من أن جميع الخطوات أعلاه تمت بشكل صحيح

