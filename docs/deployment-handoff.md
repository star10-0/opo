# Deployment & Handoff Guide

## 1) Backend (Production)
```bash
cd backend
npm install
NODE_ENV=production ENFORCE_AUTH=true npm run start:prod
```

### متطلبات إلزامية
- `MONGO_URI` صحيح ومتاح.
- `JWT_SECRET` قوي (خصوصًا عند `ENFORCE_AUTH=true`).
- `FRONTEND_URL` مضبوط على الدومينات المسموحة (قائمة مفصولة بفواصل عند الحاجة).

## 2) Frontend (Production Build)
```bash
cd fuel-frontend-v2
npm install
npm run build
npm run preview:host
```

### API Base URL
- يُفضّل في الإنتاج جعل `VITE_API_BASE_URL` فارغًا لاستخدام `/api` same-origin.
- في حال backend على دومين مختلف: اضبط `VITE_API_BASE_URL` على الرابط الكامل.

## 3) Health checks
```bash
cd backend
npm run healthcheck
```

أو مباشرة:
```bash
curl -s http://localhost:5000/api/health
```

التحقق المطلوب:
- `success: true`
- `status: ok`
- `dbConnected: true` في بيئة متصلة بقاعدة البيانات

## 4) Backup / Restore
- راجع: `docs/backup-and-restore.md`
- نفّذ النسخ الاحتياطي الدوري قبل أي ترقية أو migration.

## 5) Handoff checklist
- تأكيد ضبط `.env` بدون أسرار داخل المستودع.
- تأكيد تشغيل backend + frontend بنجاح.
- اختبار تسجيل الدخول والصلاحيات الأساسية.
- اختبار صفحة التقارير واللوحة الرئيسية.
- تأكيد `GET /api/health` يعمل بعد الإقلاع.
