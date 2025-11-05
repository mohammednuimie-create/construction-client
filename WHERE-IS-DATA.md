# 📍 أين توجد البيانات في النظام؟

## 🗄️ قاعدة البيانات: MongoDB

### 📊 اسم قاعدة البيانات:
```
construction-management
```

### 🔗 Connection String:
- **محلي:** `mongodb://localhost:27017/construction-management`
- **Atlas:** `mongodb+srv://username:password@cluster.mongodb.net/construction-management`

---

## 👥 بيانات المستخدمين (المقاول والعملاء)

### 📦 Collection Name:
```
users
```

### 📍 أين يتم حفظها:
- **Model:** `server/models/User.js`
- **API Routes:** `server/routes/auth.js` و `server/routes/users.js`
- **Collection:** `users` في MongoDB

### 📋 الحقول المحفوظة:

```javascript
{
  _id: ObjectId,                    // معرف فريد تلقائي
  name: String,                     // الاسم
  email: String,                    // البريد الإلكتروني (فريد)
  password: String,                  // كلمة المرور (مشفرة)
  role: String,                     // 'client' أو 'contractor'
  phone: String,                     // رقم الهاتف (اختياري)
  address: String,                   // العنوان (اختياري)
  companyName: String,              // اسم الشركة (اختياري)
  website: String,                  // الموقع الإلكتروني (اختياري)
  description: String,             // الوصف (اختياري)
  bio: String,                      // السيرة الذاتية (اختياري)
  company: String,                  // الشركة (اختياري)
  createdAt: Date,                  // تاريخ الإنشاء (تلقائي)
  updatedAt: Date                   // تاريخ آخر تحديث (تلقائي)
}
```

### 🔍 كيفية الوصول للبيانات:

#### 1️⃣ **من التطبيق (Frontend):**
```javascript
// جلب جميع العملاء
const clients = await usersAPI.getAll({ role: 'client' });

// جلب جميع المقاولين
const contractors = await usersAPI.getAll({ role: 'contractor' });

// جلب مستخدم محدد
const user = await usersAPI.getById(userId);
```

#### 2️⃣ **من API مباشرة:**
```bash
# جلب جميع المستخدمين
GET http://localhost:4000/api/users

# جلب العملاء فقط
GET http://localhost:4000/api/users?role=client

# جلب المقاولين فقط
GET http://localhost:4000/api/users?role=contractor

# جلب مستخدم محدد
GET http://localhost:4000/api/users/:id
```

#### 3️⃣ **من MongoDB مباشرة:**

##### باستخدام MongoDB Compass:
1. افتح MongoDB Compass
2. اتصل بـ: `mongodb://localhost:27017`
3. اختر قاعدة البيانات: `construction-management`
4. اختر Collection: `users`
5. عرض جميع المستخدمين

##### باستخدام MongoDB Shell (mongosh):
```bash
# الاتصال بقاعدة البيانات
mongosh mongodb://localhost:27017/construction-management

# عرض جميع المستخدمين
db.users.find()

# عرض العملاء فقط
db.users.find({ role: 'client' })

# عرض المقاولين فقط
db.users.find({ role: 'contractor' })

# البحث عن مستخدم بالبريد الإلكتروني
db.users.findOne({ email: "user@example.com" })

# عرض عدد المستخدمين
db.users.countDocuments()
```

##### باستخدام MongoDB Atlas:
1. سجل الدخول إلى https://cloud.mongodb.com
2. اختر Cluster الخاص بك
3. اضغط على "Browse Collections"
4. اختر قاعدة البيانات: `construction-management`
5. اختر Collection: `users`

---

## 📂 Collections الأخرى في قاعدة البيانات:

### 1️⃣ **Projects (المشاريع)**
- **Collection:** `projects`
- **Model:** `server/models/Project.js`
- **API:** `/api/projects`

### 2️⃣ **Materials (المواد)**
- **Collection:** `materials`
- **Model:** `server/models/Material.js`
- **API:** `/api/materials`

### 3️⃣ **Requests (الطلبات)**
- **Collection:** `requests`
- **Model:** `server/models/Request.js`
- **API:** `/api/requests`

### 4️⃣ **Contracts (العقود)**
- **Collection:** `contracts`
- **Model:** `server/models/Contract.js`
- **API:** `/api/contracts`

### 5️⃣ **Purchases (المشتريات)**
- **Collection:** `purchases`
- **Model:** `server/models/Purchase.js`
- **API:** `/api/purchases`

### 6️⃣ **Issues (إصدار المواد)**
- **Collection:** `issues`
- **Model:** `server/models/Issue.js`
- **API:** `/api/issues`

### 7️⃣ **Suppliers (الموردون)**
- **Collection:** `suppliers`
- **Model:** `server/models/Supplier.js`
- **API:** `/api/suppliers`

### 8️⃣ **Payments (المدفوعات)**
- **Collection:** `payments`
- **Model:** `server/models/Payment.js`
- **API:** `/api/payments`

---

## 🔐 أمان البيانات:

### ⚠️ **معلومات حساسة:**
- **كلمات المرور:** مشفرة بـ bcrypt (لا يمكن قراءتها)
- **JWT Tokens:** مخزنة في LocalStorage (Frontend)

### ✅ **ما يتم إرجاعه من API:**
- عند جلب المستخدمين، يتم استبعاد `password` من النتائج
- يتم استخدام `.select('-password')` في جميع الاستعلامات

---

## 📊 مثال على البيانات المحفوظة:

### مستخدم (عميل):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "$2a$10$...",  // مشفر
  "role": "client",
  "phone": "123456789",
  "address": "دمشق، سوريا",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### مستخدم (مقاول):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "شركة البناء الحديثة",
  "email": "contractor@example.com",
  "password": "$2a$10$...",  // مشفر
  "role": "contractor",
  "phone": "987654321",
  "companyName": "شركة البناء الحديثة",
  "website": "https://example.com",
  "description": "شركة متخصصة في البناء والتشطيب",
  "createdAt": "2024-01-10T08:00:00.000Z",
  "updatedAt": "2024-01-15T14:20:00.000Z"
}
```

---

## 🛠️ أدوات مفيدة:

### 1️⃣ **MongoDB Compass** (GUI)
- تحميل: https://www.mongodb.com/products/compass
- واجهة رسومية لتصفح وإدارة البيانات

### 2️⃣ **Postman** (لاختبار API)
- تحميل: https://www.postman.com/
- اختبار جميع API endpoints

### 3️⃣ **MongoDB Shell (mongosh)**
- Command Line Interface
- مفيد للاستعلامات السريعة

---

## 📝 ملاحظات مهمة:

1. **كلمات المرور:** مشفرة ولا يمكن استرجاعها
2. **البريد الإلكتروني:** يجب أن يكون فريداً
3. **Role:** إما `client` أو `contractor`
4. **Timestamps:** `createdAt` و `updatedAt` تلقائية

---

## 🔗 روابط مفيدة:

- **MongoDB Documentation:** https://docs.mongodb.com/
- **Mongoose Documentation:** https://mongoosejs.com/docs/
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas



