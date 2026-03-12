# Fuel Station System (Multi-Station)

نظام إدارة محطات وقود متعدد المحطات (Backend + Frontend) مع تركيز على استقرار التشغيل اليومي، الصلاحيات، والتقارير.

## المتطلبات
- Node.js 20+
- npm 10+
- MongoDB (محلي أو سحابي)

## هيكل المشروع
- `backend/`: API بخادم Express + MongoDB
- `fuel-frontend-v2/`: واجهة React + Vite
- `docs/`: وثائق القواعد والكيانات والعقود

## الإعداد السريع

### 1) إعداد المتغيرات البيئية

#### Backend
```bash
cp backend/.env.example backend/.env
```
ثم عدّل القيم الأساسية:
- `MONGO_URI`
- `JWT_SECRET`
- `CORS_ORIGIN`

#### Frontend
```bash
cp fuel-frontend-v2/.env.example fuel-frontend-v2/.env
```
وتأكد من:
- `VITE_API_BASE_URL=http://localhost:5000/api`

> لا تقم برفع `.env` إلى Git. الملفات مستثناة عبر `.gitignore`.

### 2) تشغيل Backend
```bash
cd backend
npm install
npm run dev
```

أوامر مفيدة:
- `npm start`: تشغيل عادي
- `npm run start:prod`: تشغيل بنمط production
- `npm run check`: فحص سريع لصحة ملف الدخول

### 3) تشغيل Frontend
```bash
cd fuel-frontend-v2
npm install
npm run dev
```

أوامر مفيدة:
- `npm run start`: تشغيل Vite dev
- `npm run build`: build للإنتاج
- `npm run preview`: معاينة build

## ملاحظات أمنية (Phase 7)
- كل مسارات `/api/*` (عدا health) تتطلب مصادقة.
- بعض المسارات الحساسة أصبحت مقيدة بدور المستخدم (مثل `audit logs` وقرارات `approval` وإنشاء/تعديل كيانات حساسة).
- تم تحسين رسائل أخطاء المصادقة ومنع الوصول غير المصرح.

## ملاحظات نشر (Deployment Preparation)
- اضبط `NODE_ENV=production` في backend.
- استخدم قيمة `CORS_ORIGIN` محددة بدل `*` في الإنتاج.
- وفّر `JWT_SECRET` قوي وعالي التعقيد.
- تأكد من اتصال MongoDB قبل تحويل المرور الفعلي.

## فحص الجاهزية قبل التسليم
- Backend: `npm run check` + تشغيل `npm run dev`
- Frontend: `npm run build`
- راجع التوافق بين متغيرات `.env` في الطرفين.
