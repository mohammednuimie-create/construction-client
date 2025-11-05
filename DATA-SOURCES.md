# 📊 مصادر البيانات وربطها بالصفحات

## 1️⃣ بيانات العملاء والمتعاقدين

### 📍 المصدر:
- **Collection:** `users` في MongoDB
- **API Endpoint:** 
  - العملاء: `GET /api/users?role=client`
  - المتعاقدون: `GET /api/users?role=contractor`
- **Frontend API:** `usersAPI.getAll({ role: 'client' })` أو `usersAPI.getAll({ role: 'contractor' })`

### 🔗 الصفحات المرتبطة:

#### ✅ **1. صفحة العملاء والمتعاقدين** (`ClientsAndContractors.js`)
- **الحالة:** ✅ مرتبطة بالفعل
- **الاستخدام:** 
  - عرض قائمة العملاء والمتعاقدين
  - إضافة/تعديل/حذف العملاء والمتعاقدين
  - عرض الإحصائيات (عدد المشاريع، القيمة الإجمالية)

#### ✅ **2. صفحة التعاقدات والتوريدات** (`ContractsAndSupplies.js`)
- **الحالة:** ✅ مرتبطة بالفعل
- **الاستخدام:** 
  - Dropdown لاختيار العميل عند إنشاء عقد جديد
  - عرض بيانات العميل في تفاصيل العقد

#### ⚠️ **3. صفحة إضافة المشروع والطلبات** (`AddProjectAndRequests.js`)
- **الحالة:** ⚠️ غير مرتبطة بشكل كامل
- **المشكلة:** عند إنشاء مشروع جديد، `client` لا يتم اختياره من قائمة العملاء
- **الحل المطلوب:** إضافة dropdown لاختيار العميل عند إنشاء مشروع جديد

#### ⚠️ **4. صفحة المشاريع** (`ProjectsList.js`)
- **الحالة:** ⚠️ مرتبطة جزئياً
- **المشكلة:** `client` في Project قد يكون String بدلاً من ObjectId
- **الحل المطلوب:** التأكد من ربط `client` بـ User._id

---

## 2️⃣ كيفية الربط في الصفحات

### 🔧 **مثال: إضافة dropdown للعملاء في صفحة إضافة المشروع**

```javascript
// 1. استيراد usersAPI
import { usersAPI } from "../../utils/api";

// 2. إضافة state للعملاء
const [clients, setClients] = useState([]);

// 3. جلب العملاء في useEffect
useEffect(() => {
  const fetchClients = async () => {
    try {
      const clientsData = await usersAPI.getAll({ role: 'client' });
      setClients(clientsData || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };
  fetchClients();
}, []);

// 4. إضافة dropdown في النموذج
<select
  name="client"
  value={projectForm.client}
  onChange={handleProjectInput}
  required
>
  <option value="">اختر العميل</option>
  {clients.map(c => (
    <option key={c._id || c.id} value={c._id || c.id}>
      {c.name} {c.email ? `(${c.email})` : ''}
    </option>
  ))}
</select>

// 5. حفظ client كـ ObjectId في projectData
const projectData = {
  ...projectForm,
  client: projectForm.client, // هذا سيكون ObjectId
  contractor: user?.id || user?._id
};
```

---

## 3️⃣ هيكل البيانات

### 📋 **User Schema:**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  role: 'client' | 'contractor',
  password: String (hashed),
  address: String (optional),
  companyName: String (optional),
  specialization: String (optional, للمتعاقدين),
  createdAt: Date,
  updatedAt: Date
}
```

### 📋 **Project Schema:**
```javascript
{
  _id: ObjectId,
  name: String,
  client: String | ObjectId, // ⚠️ يجب أن يكون ObjectId
  contractor: ObjectId (ref: 'User'),
  budget: Number,
  totalCost: Number,
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled',
  // ... باقي الحقول
}
```

### 📋 **Contract Schema:**
```javascript
{
  _id: ObjectId,
  client: ObjectId (ref: 'User'), // ✅ مرتبط بشكل صحيح
  contractor: ObjectId (ref: 'User'), // ✅ مرتبط بشكل صحيح
  project: ObjectId (ref: 'Project'),
  totalAmount: Number,
  // ... باقي الحقول
}
```

---

## 4️⃣ تحسينات مقترحة

### ✅ **1. ربط صفحة إضافة المشروع بالعملاء**
- إضافة dropdown لاختيار العميل
- حفظ client كـ ObjectId بدلاً من String

### ✅ **2. تحسين صفحة المشاريع**
- عرض اسم العميل بدلاً من ID
- إضافة فلترة حسب العميل

### ✅ **3. إضافة ربط في صفحة التقارير**
- إمكانية إنشاء تقرير حسب العميل
- إحصائيات لكل عميل

### ✅ **4. إضافة ربط في لوحة التحكم**
- عرض عدد العملاء الجدد
- عرض عدد المشاريع لكل عميل

---

## 5️⃣ API Endpoints المتاحة

### 👥 **Users API:**
- `GET /api/users` - جلب جميع المستخدمين
- `GET /api/users?role=client` - جلب العملاء فقط
- `GET /api/users?role=contractor` - جلب المتعاقدين فقط
- `GET /api/users/:id` - جلب مستخدم محدد
- `PUT /api/users/:id` - تحديث مستخدم
- `DELETE /api/users/:id` - حذف مستخدم
- `POST /api/auth/register` - إنشاء مستخدم جديد (للعملاء والمتعاقدين)

---

## 6️⃣ ملاحظات مهمة

⚠️ **مشكلة في Project Schema:**
- `client` في Project هو `String` وليس `ObjectId`
- يجب تغييره إلى `ObjectId` لربط أفضل مع قاعدة البيانات

⚠️ **مشكلة في Passwords:**
- عند إنشاء عميل/متعاقد من صفحة ClientsAndContractors، يتم استخدام كلمة مرور مؤقتة `'temp123'`
- يجب إضافة نظام لإرسال كلمة المرور عبر البريد الإلكتروني أو السماح بتعيين كلمة مرور

✅ **ما يعمل بشكل جيد:**
- Contracts مرتبطة بشكل صحيح بـ Users
- صفحة ClientsAndContractors تعمل بشكل كامل
- الإحصائيات تُحسب بشكل صحيح



