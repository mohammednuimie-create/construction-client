# 🔧 إصلاح خطأ Ngrok - إضافة Auth Token

## ❌ الخطأ:
```
ERROR: authentication failed: Usage of ngrok requires a verified account and authtoken.
```

---

## ✅ الحل السريع (3 خطوات):

### الخطوة 1: سجل حساب Ngrok
1. اذهب إلى: https://dashboard.ngrok.com/signup
2. سجل حساب (مجاني)
3. تحقق من البريد الإلكتروني

### الخطوة 2: احصل على Auth Token
1. بعد تسجيل الدخول، اذهب إلى: https://dashboard.ngrok.com/get-started/your-authtoken
2. أو في Dashboard → **"Your Authtoken"**
3. **انسخ الـ Token** (مثل: `2abc123def456ghi789jkl012mno345pq`)

### الخطوة 3: أضف الـ Token
في Terminal (PowerShell أو CMD):

```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

**مثال:**
```bash
ngrok config add-authtoken 2abc123def456ghi789jkl012mno345pq
```

---

## ✅ بعد إضافة الـ Token:

### 1. تأكد أن Backend يعمل:
```bash
cd C:\Users\MOHAMD\client\server
node server.js
```

### 2. في Terminal جديد، شغل Ngrok:
```bash
ngrok http 4000
```

### 3. ستظهر لك:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:4000
```

**انسخ الـ URL!** ✅

---

## 📝 ملاحظات:

- ✅ Auth Token مرة واحدة فقط - بعد إضافته، لن تحتاج إضافته مرة أخرى
- ✅ Token مجاني 100%
- ✅ لا يحتاج تفعيل بطاقة ائتمانية

---

## 🎯 الخطوات الكاملة:

1. ✅ سجل في: https://dashboard.ngrok.com/signup
2. ✅ انسخ Auth Token من: https://dashboard.ngrok.com/get-started/your-authtoken
3. ✅ شغل: `ngrok config add-authtoken YOUR_TOKEN`
4. ✅ شغل Backend: `cd server && node server.js`
5. ✅ شغل Ngrok: `ngrok http 4000`
6. ✅ انسخ الـ URL
7. ✅ عدّل `src/utils/api.js`

---

**جاهز! ابدأ بالخطوة 1 🚀**


