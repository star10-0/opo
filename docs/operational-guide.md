# دليل التشغيل الداخلي (Phase 11)

هذا الدليل موجّه للمشغل/مسؤول التسليم لتجهيز النظام وتشغيله ومتابعته.

## 1) المتطلبات الأساسية
- Node.js و npm.
- MongoDB متاح عبر `MONGO_URI`.
- وجود ملفات البيئة المطلوبة.

## 2) أماكن ملفات البيئة
- Backend: `backend/.env` (من `backend/.env.example` إن وجد).
- Frontend: `fuel-frontend-v2/.env` (من `fuel-frontend-v2/.env.example` إن وجد).
- لا ترفع ملفات `.env` إلى Git.

## 3) التشغيل المحلي (Development)

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd fuel-frontend-v2
npm install
npm run dev
```

## 4) التشغيل شبه الإنتاجي (Production-like)

### Backend
```bash
cd backend
npm install
NODE_ENV=production ENFORCE_AUTH=true npm run start:prod
```

### Frontend
```bash
cd fuel-frontend-v2
npm install
npm run build
npm run preview:host
```

## 5) كيف أتحقق أن النظام يعمل؟
1. تحقق من صحة backend:
   ```bash
   cd backend
   npm run healthcheck
   ```
2. أو عبر endpoint مباشر:
   ```bash
   curl -s http://localhost:5000/api/health
   ```
3. افتح الواجهة وسجّل دخول بحساب صالح.
4. تأكد أن اختيار المحطة يعمل.
5. تأكد أن صفحة لوحة التحكم تُحمّل بدون أخطاء واضحة.

## 6) تحديث الإعدادات الأساسية
- Backend:
  - `MONGO_URI`: اتصال قاعدة البيانات.
  - `JWT_SECRET`: سر الجلسات.
  - `FRONTEND_URL`: النطاقات المسموحة للواجهة.
  - `ENFORCE_AUTH`: فرض المصادقة.
- Frontend:
  - `VITE_API_BASE_URL`: رابط الـ API.
  - `VITE_API_TIMEOUT_MS`: مهلة طلبات API.

> بعد أي تعديل في `.env`: أعد تشغيل الخدمة المتأثرة.

## 7) البداية الأولى للنظام
1. شغّل backend ثم frontend.
2. سجّل الدخول بحساب مدير.
3. إذا لا توجد محطة، استخدم نموذج **إنشاء أول محطة** من لوحة التحكم.
4. أنشئ بيانات مبدئية (خزانات/مضخات) لتسريع الانطلاق.
5. اربط المستخدمين بالمحطات المناسبة وصلاحياتهم.
6. افتح اليوم التشغيلي وابدأ تدفق العمل اليومي.

## 8) فحوصات تشغيل يومية سريعة
- هل `/api/health` يعمل؟
- هل لوحة التحكم تعرض مؤشرات؟
- هل يمكن تسجيل قراءة عامل وإرسال إغلاق؟
- هل المحاسب قادر على مراجعة الإغلاقات؟
- هل التقارير تُحمّل للمحطة المحددة؟

## 9) مسؤوليات التسليم
- تسليم العميل ملفات الدليل التالية:
  - `docs/user-guide.md`
  - `docs/troubleshooting-guide.md`
  - `docs/deployment-handoff.md`
- شرح مسار العمل الأساسي لكل دور (مدير/محاسب/عامل).
