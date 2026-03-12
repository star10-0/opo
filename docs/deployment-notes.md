# Deployment Notes (Phase 7)

## Backend
- Required envs: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV`.
- Health check: `GET /api/health`.
- All other `/api/*` routes require `Authorization: Bearer <token>`.

## Frontend
- Required env: `VITE_API_BASE_URL`.
- Build command: `npm run build`.

## Pending TODOs (Non-blocking)
- إضافة endpoint رسمي لتسجيل الدخول (`/api/auth/login`) بدل الاعتماد على وضع demo المحلي.
- ربط نظام logging بمزوّد خارجي (Winston/Pino + log aggregation) في الإنتاج.
- إضافة rate limiting على endpoints الحساسة بعد تثبيت متطلبات الأداء الفعلية.
