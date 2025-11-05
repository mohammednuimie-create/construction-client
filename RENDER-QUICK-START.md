# ⚡ نشر سريع على Render - 3 خطوات فقط!

## 📌 الخطوة 1: ارفع المشروع على GitHub

إذا لم تكن قد رفعت المشروع بعد:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## 📌 الخطوة 2: اذهب إلى Render

1. افتح [https://render.com](https://render.com)
2. سجل دخول بـ GitHub
3. اضغط **"New +"** → **"Web Service"**

---

## 📌 الخطوة 3: انسخ هذه القيم بالضبط

### في صفحة "New Web Service":

#### Basic Settings:
- **Name**: `construction-api`
- **Language**: `Node`
- **Branch**: `main`

#### ⚠️ Advanced Settings (اضغط "Advanced" أولاً):

1. **Root Directory**: 
   ```
   server
   ```

2. **Build Command**:
   ```
   npm install
   ```

3. **Start Command**:
   ```
   node server.js
   ```

4. **Environment Variables** (اضغط "Add Environment Variable" لكل واحدة):

   **متغير 1:**
   - Key: `MONGODB_URI`
   - Value: الصق Connection String من MongoDB Atlas
     ```
     mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/construction-management?retryWrites=true&w=majority
     ```

   **متغير 2:**
   - Key: `NODE_ENV`
   - Value: `production`

   **متغير 3 (اختياري):**
   - Key: `PORT`
   - Value: `10000`

---

## ✅ بعدها اضغط "Create Web Service"

انتظر 5-10 دقائق وستكون جاهز! 🚀

---

## 🔍 التحقق:

بعد النشر، ستجد **URL** في أعلى Dashboard، مثال:
```
https://construction-api.onrender.com
```

جرب الرابط في المتصفح - يجب أن ترى:
```json
{
  "message": "Construction Management API",
  "version": "1.0.0",
  "status": "running"
}
```

---

## 📝 ملاحظة مهمة:

⚠️ **MONGODB_URI** يجب أن تضيفه **يدوياً** في Environment Variables - لا يمكن إضافته من render.yaml لأسباب أمنية.

---

**هذا كل شيء! 🎉**


