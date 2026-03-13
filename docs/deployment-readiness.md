# Deployment Readiness Checklist (Phase 8)

## 1) Environment
- تأكد من إعداد `.env` من `.env.example`.
- في الإنتاج:
  - `NODE_ENV=production`
  - `ENFORCE_AUTH=true`
  - `JWT_SECRET` قوي
  - `MONGO_URI` صالح
  - `FRONTEND_URL` يطابق نطاق الواجهة (أو أكثر من نطاق مفصول بفاصلة).

## 2) Backend startup
1. `cd backend`
2. `npm install`
3. `npm run check:env`
4. `npm run start:prod`
5. تحقق من `GET /api/health`

## 3) Frontend startup
1. `cd fuel-frontend-v2`
2. `npm install`
3. `npm run build`
4. `npm run preview:host`

## 4) API / CORS sanity
- إذا كانت الواجهة على نفس الدومين، يمكن جعل `VITE_API_BASE_URL` فارغًا لاستخدام `/api`.
- إذا كانت على دومين مختلف، اضبط `VITE_API_BASE_URL` على رابط backend الكامل.
- اضبط `FRONTEND_URL` في backend ليسمح فقط بالأصول الموثوقة.

## 5) Post-deploy verification
- Health endpoint:
  - `GET /api/health`
  - يجب أن يرجع `success=true` و `dbConnected=true`.
- تحقق من تسجيل الدخول وصلاحيات الأدوار.
- تحقق من الصفحات الأساسية: Dashboard, Operational Day, Deliveries, Reports.

## 6) Rollback readiness
- وجود نسخة احتياطية حديثة قبل أي نشر.
- توثيق إصدار الكود المنشور (commit hash).
- القدرة على إعادة تشغيل الإصدار السابق بسرعة.

## 7) Backup & restore
راجع: `docs/backup-and-restore.md`.
