# ✅ الخطوات التالية في Render.com - من الصورة الحالية

## 📸 ما تراه الآن (صحيح!):
- ✅ **Name:** `nuimie`
- ✅ **Language:** `Node`
- ✅ **Branch:** `main`
- ✅ **Region:** `Oregon (US West)`
- ✅ **Root Directory:** `server` ← **ممتاز! هذا صحيح!**

---

## 🎯 الخطوات التالية:

### 1. **Build Command و Start Command**

ابحث في الصفحة عن:
- **Build Command:** (إذا كان موجوداً)
  - اكتب: `npm install`
  - أو اتركه فارغاً (Render سيفعله تلقائياً)

- **Start Command:** (إذا كان موجوداً)
  - اكتب: `npm start`
  - هذا سيشغّل `node server.js`

**ملاحظة:** قد لا ترى هذه الحقول الآن - قد تظهر بعد الخطوة التالية.

---

### 2. **Environment Variables** (مهم جداً!)

#### أين تجدها:
- **ابحث عن زر "Advanced"** في أسفل الصفحة
- أو **ابحث عن قسم "Environment Variables"**
- أو **ابحث عن "Add Environment Variable"**

#### اضغط "Add Environment Variable" وأضف:

##### 1. MongoDB URI:
```
Key: MONGODB_URI
Value: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/construction-management?retryWrites=true&w=majority
```
- استبدل `username`, `password`, و `cluster0.xxxxx` بقيمك من MongoDB Atlas

##### 2. JWT Secret:
```
Key: JWT_SECRET
Value: your-super-secret-jwt-key-123456789
```
- أي نص عشوائي طويل

##### 3. Node Environment:
```
Key: NODE_ENV
Value: production
```

---

### 3. **Create Web Service**

بعد إضافة Environment Variables:
1. راجع جميع الإعدادات
2. اضغط **"Create Web Service"** (في الأسفل)
3. انتظر حتى يتم Build (5-10 دقائق)

---

## 🔍 إذا لم تجد Environment Variables:

### الطريقة 1:
1. **قم بالتمرير لأسفل** في الصفحة
2. ابحث عن **"Advanced"** أو **"Environment"**
3. اضغط عليه

### الطريقة 2:
1. **اضغط "Create Web Service"** أولاً
2. بعد إنشاء Service، اذهب إلى **Settings** → **Environment**
3. أضف Environment Variables هناك

---

## 📋 Checklist قبل النشر:

- [x] Name: `nuimie` ✓
- [x] Language: `Node` ✓
- [x] Branch: `main` ✓
- [x] Root Directory: `server` ✓
- [ ] Environment Variables (MONGODB_URI, JWT_SECRET, NODE_ENV)
- [ ] Build Command (إذا كان موجوداً)
- [ ] Start Command (إذا كان موجوداً)
- [ ] Create Web Service

---

## 🎯 الخطوة التالية الفورية:

1. **قم بالتمرير لأسفل** في الصفحة
2. **ابحث عن "Advanced"** أو **"Environment Variables"**
3. **أضف Environment Variables**
4. **اضغط "Create Web Service"**

---

## 💡 ملاحظة مهمة:

إذا لم تجد Environment Variables الآن، لا تقلق! يمكنك إضافتها بعد إنشاء Service:
1. اضغط "Create Web Service" أولاً
2. بعد النشر، اذهب إلى Service → Settings → Environment
3. أضف Environment Variables هناك

---

**تابع الخطوات وأخبرني بالنتيجة! 🚀**

