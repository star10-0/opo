# Station System Reference

هذا المشروع هو نظام إدارة محطات وقود متعدد المحطات.

## المتطلبات
- Node.js 20+
- MongoDB 6+

## هيكل المشروع
- `backend/` : Node.js + Express + MongoDB
- `fuel-frontend-v2/` : React + Vite
- `docs/` : قواعد العمل والعقود

## التشغيل المحلي
1. انسخ الملف البيئي:
   - `cp .env.example .env`
2. ثبّت الاعتمادات:
   - `npm install --prefix backend`
   - `npm install --prefix fuel-frontend-v2`
3. شغّل الخدمات:
   - `npm run dev:backend`
   - `npm run dev:frontend`

## أوامر التحقق
- فحص الباك إند: `npm run check:backend`
- بناء الواجهة: `npm run build:frontend`
- فحص الواجهة: `npm run check:frontend`

## جاهزية الإنتاج (بدون نشر فعلي)
- ضبط `NODE_ENV=production` و `AUTH_REQUIRED=true` في بيئة الإنتاج.
- ضبط `JWT_SECRET` قوي وطويل.
- تقييد CORS عبر `CORS_ORIGINS`.
- توجيه الواجهة إلى API الصحيح عبر `VITE_API_BASE_URL`.
- تشغيل الباك إند في الإنتاج: `npm --prefix backend run start:prod`.
- تشغيل الواجهة بعد البناء عبر `vite preview` أو خلف Nginx/CDN.

## مراجع الأعمال
- `AGENTS.md`
- `docs/business-rules.md`
- `docs/database-schema.md`
- `docs/api-contract.md`
- `docs/workflows.md`
- `docs/roles-and-permissions.md`
