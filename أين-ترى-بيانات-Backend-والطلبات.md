# 🔍 أين ترى بيانات Backend والطلبات

## 📊 1. Logs في Render (للـ Backend):

### في Render Dashboard:
1. اذهب إلى [dashboard.render.com](https://dashboard.render.com)
2. اختر Service: `construction-backend`
3. اضغط **"Logs"** tab (من القائمة الجانبية)
4. هنا ترى:
   - ✅ جميع طلبات API
   - ✅ أخطاء (إن وجدت)
   - ✅ MongoDB connections
   - ✅ Server status

---

## 🗄️ 2. بيانات MongoDB (قاعدة البيانات):

### في MongoDB Atlas:
1. اذهب إلى [cloud.mongodb.com](https://cloud.mongodb.com)
2. اختر Project الخاص بك
3. اضغط **"Database"** → **"Browse Collections"**
4. هنا ترى:
   - ✅ جميع Collections (Users, Projects, Requests, etc.)
   - ✅ البيانات المخزنة
   - ✅ يمكنك تعديل/حذف البيانات

---

## 📋 3. Requests (الطلبات) في الموقع:

### في Frontend:
1. اذهب إلى الموقع (Vercel أو Netlify)
2. سجّل الدخول كـ **مقاول**
3. اذهب إلى **"طلبات العملاء"** أو **"Add Project and Requests"**
4. هنا ترى:
   - ✅ جميع طلبات العملاء
   - ✅ حالة كل طلب (pending, approved, etc.)

### أو كـ **عميل**:
1. سجّل الدخول كـ **عميل**
2. اذهب إلى **"طلباتي"** أو **"Client Requests"**
3. هنا ترى:
   - ✅ جميع طلباتك
   - ✅ حالة كل طلب

---

## 🔧 4. اختبار API مباشرة:

### استخدام Browser:
افتح في المتصفح:

#### Health Check:
```
https://construction-backend-nw0g.onrender.com/api/health
```

#### Projects:
```
https://construction-backend-nw0g.onrender.com/api/projects
```

#### Requests:
```
https://construction-backend-nw0g.onrender.com/api/requests
```

#### Users:
```
https://construction-backend-nw0g.onrender.com/api/users
```

---

## 🛠️ 5. استخدام MongoDB Compass (أداة GUI):

### تحميل MongoDB Compass:
1. اذهب إلى [mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)
2. حمّل MongoDB Compass
3. استخدم Connection String:
   ```
   mongodb+srv://mohammed515nu_db_user:123456mm@cluster0.qe27x49.mongodb.net/construction-management
   ```
4. Connect
5. هنا ترى:
   - ✅ جميع Collections
   - ✅ البيانات بتفصيل
   - ✅ يمكنك تعديل/حذف/إضافة بيانات

---

## 📊 6. Console في المتصفح (Frontend):

### في Frontend:
1. افتح الموقع
2. اضغط `F12` لفتح Developer Tools
3. اذهب إلى **"Console"** tab
4. هنا ترى:
   - ✅ جميع API calls
   - ✅ البيانات المرسلة/المستقبلة
   - ✅ أخطاء (إن وجدت)

---

## 🔍 7. Network Tab (في المتصفح):

### في Frontend:
1. افتح الموقع
2. اضغط `F12` → **"Network"** tab
3. جرّب أي عملية (مثل تسجيل الدخول)
4. هنا ترى:
   - ✅ جميع HTTP requests
   - ✅ Request/Response data
   - ✅ Headers
   - ✅ Status codes

---

## 📋 8. Render Metrics (للـ Backend):

### في Render Dashboard:
1. اختر Service: `construction-backend`
2. اضغط **"Metrics"** tab
3. هنا ترى:
   - ✅ CPU usage
   - ✅ Memory usage
   - ✅ Request rate
   - ✅ Response time

---

## 🎯 الطرق الموصى بها:

### لرؤية Logs (Backend):
- ✅ **Render Dashboard** → **Logs** tab

### لرؤية البيانات (Database):
- ✅ **MongoDB Atlas** → **Browse Collections**
- ✅ أو **MongoDB Compass** (GUI أفضل)

### لرؤية Requests (في الموقع):
- ✅ **Frontend** → سجّل الدخول → **طلبات العملاء** (مقاول) أو **طلباتي** (عميل)

### لاختبار API:
- ✅ **Browser** → افتح URL مباشرة
- ✅ أو **Postman** (أداة متقدمة)

---

## 🔧 أدوات مفيدة:

### 1. MongoDB Compass (GUI):
- أفضل طريقة لرؤية البيانات
- تحميل: [mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)

### 2. Postman (لاختبار API):
- أفضل طريقة لاختبار API
- تحميل: [postman.com/downloads](https://www.postman.com/downloads)

### 3. Browser DevTools:
- مدمج في المتصفح
- `F12` → Console/Network tabs

---

## 📋 Checklist:

- [ ] Render Dashboard → Logs (للـ Backend)
- [ ] MongoDB Atlas → Browse Collections (للبيانات)
- [ ] Frontend → طلبات العملاء/طلباتي (للطلبات)
- [ ] Browser → API URLs مباشرة (لاختبار)
- [ ] MongoDB Compass (لإدارة البيانات)

---

**أفضل طريقة: Render Logs للـ Backend، و MongoDB Atlas للبيانات! 🚀**


