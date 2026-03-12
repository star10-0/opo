# Station System Reference

نظام إدارة محطات وقود متعدد المحطات (Backend: Node/Express + Frontend: React/Vite + MongoDB).

## المجلدات
- `backend/` خدمة الـ API.
- `fuel-frontend-v2/` واجهة المستخدم.
- `docs/` توثيق القواعد، العقود، وسيناريوهات التشغيل.

## التشغيل المحلي (Development)

### 1) تجهيز المتغيرات
1. انسخ الملف:
   ```bash
   cp .env.example .env
   ```
2. حدّث القيم الأساسية في `.env`:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `VITE_API_BASE_URL` (عادة `http://localhost:5000/api`)

### 2) تشغيل Backend
```bash
npm --prefix backend install
npm --prefix backend run dev
```

### 3) تشغيل Frontend
```bash
npm --prefix fuel-frontend-v2 install
npm --prefix fuel-frontend-v2 run dev
```

## التشغيل الإنتاجي (Production readiness)

### Backend
```bash
npm --prefix backend install --omit=dev
NODE_ENV=production npm --prefix backend run start
```

### Frontend build
```bash
npm --prefix fuel-frontend-v2 install
npm --prefix fuel-frontend-v2 run build
npm --prefix fuel-frontend-v2 run preview
```

> في بيئة نشر حقيقية غالبًا يتم تقديم ملفات `fuel-frontend-v2/dist` عبر Nginx/CDN.

## المتغيرات المطلوبة

### Backend
- `NODE_ENV` (`development` أو `production`)
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CORS_ORIGIN` قائمة origins مفصولة بفاصلة (Production)
- `FRONTEND_URL` بديل بسيط عند عدم استخدام `CORS_ORIGIN`

### Frontend
- `VITE_API_BASE_URL`:
  - Development: `http://localhost:5000/api`
  - Production: يفضل رابط API الحقيقي (مثال: `https://api.example.com/api`) أو الاعتماد على `/api` خلف reverse proxy.

## Health check ومراقبة أساسية
- endpoint: `GET /api/health`
- يعيد حالة الخدمة، البيئة، uptime، وحالة اتصال قاعدة البيانات.
- إذا لم تكن قاعدة البيانات متصلة يرجع `503` بحالة `degraded`.

مثال:
```bash
curl -i http://localhost:5000/api/health
```

## ترتيب التشغيل بعد النشر
1. تأكد من متغيرات البيئة الصحيحة في الخادم.
2. شغّل Backend وتأكد من `/api/health`.
3. انشر Frontend build مع ضبط API base URL.
4. اختبر تسجيل الدخول و3 واجهات أساسية (Dashboard/Operational day/Reports).

## خطوات تحقق سريعة بعد الإطلاق
1. `/api/health` يرجع `200`.
2. لا يوجد أخطاء CORS في المتصفح.
3. طلبات API في المتصفح تتجه للرابط الصحيح (ليس localhost).
4. حفظ عملية تشغيلية أساسية يعمل (مثال: قراءة/استلام/تقرير).

## ما يجب مراقبته بعد الإطلاق
- نسبة أخطاء `5xx` في API.
- زمن استجابة endpoints الرئيسية.
- انقطاع اتصال MongoDB.
- أخطاء الواجهة المرتبطة بفشل الوصول إلى API.

## توثيق النسخ الاحتياطي
راجع:
- `docs/backup-and-restore.md`

## مراجع النظام
- `AGENTS.md`
- `docs/business-rules.md`
- `docs/database-schema.md`
- `docs/api-contract.md`
- `docs/workflows.md`
- `docs/roles-and-permissions.md`
