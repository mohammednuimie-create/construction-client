# 🔐 إعداد Google OAuth - دليل خطوة بخطوة

## 📋 المتطلبات

1. حساب Google (Gmail)
2. مشروع على Google Cloud Console

---

## 🚀 الخطوات

### 1. إنشاء مشروع في Google Cloud Console

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. اضغط على **"Select a project"** في الأعلى
3. اضغط **"New Project"**
4. أدخل اسم المشروع (مثلاً: `Construction Management`)
5. اضغط **"Create"**

### 2. تفعيل Google+ API

1. في Google Cloud Console، اذهب إلى **"APIs & Services"** → **"Library"**
2. ابحث عن **"Google+ API"** أو **"Google Identity API"**
3. اضغط **"Enable"**

### 3. إنشاء OAuth 2.0 Credentials

1. اذهب إلى **"APIs & Services"** → **"Credentials"**
2. اضغط **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. إذا طُلب منك، أكمل **"OAuth consent screen"**:
   - اختر **"External"** (للاستخدام العام)
   - أدخل **App name**: `نظام إدارة المقاولات`
   - أدخل **User support email**: بريدك الإلكتروني
   - أدخل **Developer contact information**: بريدك الإلكتروني
   - اضغط **"Save and Continue"**
   - في **Scopes**، اضغط **"Save and Continue"**
   - في **Test users**، اضغط **"Save and Continue"**
   - راجع المعلومات واضغط **"Back to Dashboard"**

4. الآن أنشئ **OAuth Client ID**:
   - **Application type**: اختر **"Web application"**
   - **Name**: `Construction Management Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (للـ Development)
     - `https://your-frontend-domain.com` (للـ Production - استبدل بالـ domain الخاص بك)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/google/callback` (للـ Development)
     - `https://your-frontend-domain.com/auth/google/callback` (للـ Production)
   - اضغط **"Create"**

5. **انسخ**:
   - **Client ID** (مثل: `123456789-abcdefg.apps.googleusercontent.com`)
   - **Client Secret** (مثل: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

---

## ⚙️ إعداد Environment Variables

### في Backend (Render.com):

1. اذهب إلى Render Dashboard → **Environment** tab
2. أضف المتغيرات التالية:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
FRONTEND_URL=https://your-frontend-domain.com
```

**ملاحظة:** في Development، استخدم:
```env
FRONTEND_URL=http://localhost:3000
```

### في Frontend (Vercel/Netlify):

لا حاجة لإضافة متغيرات في Frontend - Google OAuth يتم التعامل معه من Backend.

---

## 🧪 اختبار

### 1. اختبار في Development:

1. تأكد من أن Backend يعمل على `http://localhost:4000`
2. تأكد من أن Frontend يعمل على `http://localhost:3000`
3. في صفحة تسجيل الدخول، اضغط **"تسجيل الدخول عبر Google"**
4. يجب أن يتم توجيهك إلى Google للسماح بالوصول
5. بعد الموافقة، يجب أن يتم تسجيل دخولك تلقائياً

### 2. اختبار في Production:

1. تأكد من إضافة **Authorized redirect URIs** في Google Cloud Console:
   - `https://your-frontend-domain.com/auth/google/callback`
2. تأكد من إضافة **Authorized JavaScript origins**:
   - `https://your-frontend-domain.com`
3. اختبر تسجيل الدخول عبر Google

---

## ⚠️ ملاحظات مهمة

1. **Client Secret**: لا تشارك `GOOGLE_CLIENT_SECRET` أبداً - احتفظ به سراً
2. **Redirect URIs**: يجب أن تطابق تماماً ما هو موجود في Google Cloud Console
3. **HTTPS**: في Production، يجب استخدام HTTPS
4. **OAuth Consent Screen**: قد تحتاج إلى نشر التطبيق إذا كان عدد المستخدمين أكثر من 100

---

## 🔧 استكشاف الأخطاء

### خطأ: "redirect_uri_mismatch"
- تأكد من أن **Authorized redirect URIs** في Google Cloud Console تطابق تماماً الـ URL المستخدم
- تأكد من أن `FRONTEND_URL` في Backend صحيح

### خطأ: "invalid_client"
- تأكد من أن `GOOGLE_CLIENT_ID` و `GOOGLE_CLIENT_SECRET` صحيحان
- تأكد من نسخهما بدون مسافات إضافية

### خطأ: "access_denied"
- المستخدم رفض السماح بالوصول
- هذا طبيعي - المستخدم يمكنه المحاولة مرة أخرى

---

## 📚 مراجع

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

