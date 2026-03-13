# Final Handoff (Phase 8)

## What is now ready
- Health endpoint واضح ويعرض حالة قاعدة البيانات والإعدادات الأساسية.
- التحقق من البيئة قبل التشغيل عبر `npm run check:env`.
- تحسين إرشادات التشغيل للتطوير والإنتاج.
- توثيق جاهزية النشر وتحقق ما بعد النشر.
- توثيق النسخ الاحتياطي والاستعادة موجود ومربوط.

## Remaining operational tasks (outside code)
- إعداد خادم الإنتاج الفعلي (process manager + reverse proxy).
- تفعيل TLS/HTTPS وشهادات الدومين.
- إعداد جدولة نسخ احتياطي تلقائي.
- إعداد مراقبة وتنبيه (logs/uptime/alerts).

## Quick start (dev)
- Backend:
  - `cd backend && npm install && npm run dev`
- Frontend:
  - `cd fuel-frontend-v2 && npm install && npm run dev`

## Quick start (prod-like)
- Backend:
  - `cd backend && npm install && npm run check:env && NODE_ENV=production ENFORCE_AUTH=true npm run start:prod`
- Frontend:
  - `cd fuel-frontend-v2 && npm install && npm run build && npm run preview:host`

## Ownership notes
- أي تعديل على قواعد الأدوار أو الحقول الحساسة يجب أن يمر بمراجعة Backend + QA.
- أي تغيير في API يجب أن ينعكس مباشرة في `docs/api-contract.md` وطبقة `src/api` في الواجهة.
