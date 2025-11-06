# 📋 Schema كامل للموقع - قاعدة البيانات MongoDB

## 🗄️ Database: `construction-management`

---

## 1️⃣ User Schema (المستخدمون)

**Collection:** `users`

```javascript
{
  _id: ObjectId (auto),
  name: String (required, trim),
  email: String (required, unique, lowercase, trim),
  password: String (required, minlength: 6, hashed),
  role: String (enum: ['client', 'contractor'], default: 'client'),
  phone: String (trim),
  address: String (trim),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `email` (unique)

---

## 2️⃣ Project Schema (المشاريع)

**Collection:** `projects`

```javascript
{
  _id: ObjectId (auto),
  name: String (required, trim),
  description: String (trim),
  client: String (required, trim),
  contractor: String (trim),
  location: String (trim),
  status: String (enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending'),
  startDate: Date,
  expectedEndDate: Date,
  actualEndDate: Date,
  budget: Number (default: 0),
  totalCost: Number (default: 0),
  progress: Number (min: 0, max: 100, default: 0),
  materials: [{
    name: String,
    quantity: Number,
    unit: String,
    cost: Number
  }],
  notes: String (trim),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `name`
- `client`
- `status`

---

## 3️⃣ Material Schema (المواد)

**Collection:** `materials`

```javascript
{
  _id: ObjectId (auto),
  name: String (required, trim),
  category: String (trim),
  unit: String (required, enum: ['kg', 'ton', 'm', 'm2', 'm3', 'piece', 'box', 'bag', 'liter'], default: 'piece'),
  quantity: Number (required, min: 0, default: 0),
  minStock: Number (min: 0, default: 0),
  pricePerUnit: Number (min: 0, default: 0),
  supplier: ObjectId (ref: 'Supplier'),
  location: String (trim),
  notes: String (trim),
  status: String (enum: ['available', 'low-stock', 'out-of-stock'], default: 'available'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `name`
- `category`
- `status`

**Virtual:**
- `totalValue`: `quantity * pricePerUnit`

---

## 4️⃣ Supplier Schema (الموردون)

**Collection:** `suppliers`

```javascript
{
  _id: ObjectId (auto),
  name: String (required, trim),
  companyName: String (trim),
  email: String (lowercase, trim),
  phone: String (required, trim),
  address: String (trim),
  taxNumber: String (trim),
  contactPerson: String (trim),
  paymentTerms: String (trim),
  totalPurchases: Number (default: 0, min: 0),
  totalPaid: Number (default: 0, min: 0),
  totalRemaining: Number (default: 0, min: 0),
  status: String (enum: ['active', 'inactive'], default: 'active'),
  notes: String (trim),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `name`
- `email`
- `phone`

---

## 5️⃣ Purchase Schema (المشتريات)

**Collection:** `purchases`

```javascript
{
  _id: ObjectId (auto),
  purchaseNumber: String (unique, required, auto: 'PUR-{timestamp}-{count}'),
  supplier: ObjectId (ref: 'Supplier', required),
  items: [{
    material: ObjectId (ref: 'Material', required),
    quantity: Number (required, min: 0),
    unit: String (required),
    unitPrice: Number (required, min: 0),
    total: Number (required, min: 0)
  }],
  totalAmount: Number (required, min: 0),
  paidAmount: Number (default: 0, min: 0),
  remainingAmount: Number (default: 0, min: 0),
  purchaseDate: Date (required, default: Date.now),
  deliveryDate: Date,
  status: String (enum: ['pending', 'completed', 'cancelled'], default: 'pending'),
  invoiceNumber: String (trim),
  notes: String (trim),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `purchaseNumber` (unique)
- `supplier`
- `purchaseDate` (descending)

---

## 6️⃣ Payment Schema (المدفوعات)

**Collection:** `payments`

```javascript
{
  _id: ObjectId (auto),
  paymentNumber: String (unique, required, auto: 'PAY-{timestamp}-{count}'),
  supplier: ObjectId (ref: 'Supplier', required),
  purchase: ObjectId (ref: 'Purchase'),
  amount: Number (required, min: 0),
  paymentDate: Date (required, default: Date.now),
  paymentMethod: String (enum: ['cash', 'bank-transfer', 'check', 'credit-card'], default: 'cash'),
  checkNumber: String (trim),
  bankName: String (trim),
  notes: String (trim),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `paymentNumber` (unique)
- `supplier`
- `paymentDate` (descending)

---

## 7️⃣ Issue Schema (إصدار المواد)

**Collection:** `issues`

```javascript
{
  _id: ObjectId (auto),
  issueNumber: String (unique, required, auto: 'ISS-{timestamp}-{count}'),
  project: ObjectId (ref: 'Project', required),
  items: [{
    material: ObjectId (ref: 'Material', required),
    quantity: Number (required, min: 0),
    unit: String (required),
    unitPrice: Number (required, min: 0),
    total: Number (required, min: 0)
  }],
  totalAmount: Number (required, min: 0),
  issueDate: Date (required, default: Date.now),
  issuedTo: String (trim),
  notes: String (trim),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `issueNumber` (unique)
- `project`
- `issueDate` (descending)

---

## 8️⃣ Contract Schema (العقود)

**Collection:** `contracts`

```javascript
{
  _id: ObjectId (auto),
  contractNumber: String (unique, required, auto: '{CLT|SUP}-{timestamp}-{count}'),
  project: ObjectId (ref: 'Project', required),
  client: ObjectId (ref: 'User'),
  contractor: ObjectId (ref: 'User'),
  contractType: String (enum: ['client', 'supplier'], required),
  totalAmount: Number (required, min: 0),
  paidAmount: Number (default: 0, min: 0),
  remainingAmount: Number (default: 0, min: 0),
  startDate: Date (required),
  endDate: Date (required),
  status: String (enum: ['draft', 'active', 'completed', 'cancelled'], default: 'draft'),
  terms: String (trim),
  notes: String (trim),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `contractNumber` (unique)
- `project`
- `client`
- `contractor`

---

## 9️⃣ Request Schema (الطلبات)

**Collection:** `requests`

```javascript
{
  _id: ObjectId (auto),
  requestNumber: String (unique, required, auto: 'REQ-{timestamp}-{count}'),
  project: ObjectId (ref: 'Project'),
  client: ObjectId (ref: 'User', required),
  contractor: ObjectId (ref: 'User'),
  title: String (required, trim),
  description: String (required, trim),
  location: String (trim),
  expectedDate: Date,
  status: String (enum: ['pending', 'approved', 'rejected', 'in-progress', 'completed'], default: 'pending'),
  priority: String (enum: ['low', 'medium', 'high', 'urgent'], default: 'medium'),
  response: String (trim),
  responseDate: Date,
  notes: String (trim),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `requestNumber` (unique)
- `client`
- `contractor`
- `status`

---

## 🔟 Report Schema (التقارير)

**Collection:** `reports`

```javascript
{
  _id: ObjectId (auto),
  reportNumber: String (unique, required, auto: 'RPT-{timestamp}-{count}'),
  reportType: String (enum: ['financial', 'inventory', 'project', 'supplier', 'custom'], required),
  title: String (required, trim),
  project: ObjectId (ref: 'Project'),
  period: {
    startDate: Date,
    endDate: Date
  },
  data: Mixed (flexible schema),
  generatedBy: ObjectId (ref: 'User', required),
  generatedAt: Date (default: Date.now),
  notes: String (trim),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `reportNumber` (unique)
- `reportType`
- `generatedAt` (descending)

---

## 🔗 العلاقات (Relationships)

### One-to-Many:
- **User** (1) → **Projects** (N) - `createdBy`
- **User** (1) → **Purchases/Issues/Payments/Contracts/Reports** (N) - `createdBy`
- **Project** (1) → **Contracts** (N)
- **Project** (1) → **Requests** (N)
- **Project** (1) → **Issues** (N)
- **Supplier** (1) → **Materials** (N)
- **Supplier** (1) → **Purchases** (N)
- **Supplier** (1) → **Payments** (N)

### Many-to-Many:
- **Material** (N) ↔ **Purchase** (N) - عبر `items` array
- **Material** (N) ↔ **Issue** (N) - عبر `items` array

---

## 📊 ملخص Collections:

1. ✅ `users` - المستخدمون
2. ✅ `projects` - المشاريع
3. ✅ `materials` - المواد
4. ✅ `suppliers` - الموردون
5. ✅ `purchases` - المشتريات
6. ✅ `payments` - المدفوعات
7. ✅ `issues` - الإصدارات
8. ✅ `contracts` - العقود
9. ✅ `requests` - الطلبات
10. ✅ `reports` - التقارير

---

## 🎯 Auto-Generated Fields:

- `purchaseNumber`: `PUR-{timestamp}-{count}`
- `paymentNumber`: `PAY-{timestamp}-{count}`
- `issueNumber`: `ISS-{timestamp}-{count}`
- `contractNumber`: `{CLT|SUP}-{timestamp}-{count}`
- `requestNumber`: `REQ-{timestamp}-{count}`
- `reportNumber`: `RPT-{timestamp}-{count}`
- `createdAt`, `updatedAt`: تلقائياً من Mongoose

---

## ✅ هذا هو Schema كامل للموقع!

**جميع Collections و Schemas موجودة هنا!**










