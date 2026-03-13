# Station System Reference

هذا المشروع هو نظام إدارة محطات وقود متعدد المحطات.

## الهدف
بناء نظام مستقر لإدارة:
- المحطات
- الأيام التشغيلية
- استلامات المضخات
- قراءات العدادات
- تغير الأسعار
- حسابات العاملين
- سيارة التوزيع
- الخزانات والصهاريج
- المحاسبة والموافقات
- التقارير وسجل النشاط

## البنية العامة
- كل محطة مستقلة منطقيًا
- لكل محطة خزانات ومضخات وسيارات توزيع وتقارير وسجلات
- اليوم التشغيلي هو الوعاء الرئيسي لكل عمليات اليوم
- داخل اليوم التشغيلي توجد استلامات فرعية للمضخات
- لكل استلام حساب عامل مستقل
- المحاسب يراجع ويثبت أو يعلق
- المدير يطّلع على النتائج بعد التثبيت

## أهم الملفات المرجعية
- AGENTS.md
- docs/business-rules.md
- docs/database-schema.md
- docs/api-contract.md
- docs/workflows.md
- docs/roles-and-permissions.md

## إعداد البيئة
انسخ `.env.example` إلى `.env` ثم حدّث القيم المناسبة.

> في الإنتاج يجب ضبط:
> - `NODE_ENV=production`
> - `ENFORCE_AUTH=true`
> - `JWT_SECRET` قوي
> - `FRONTEND_URL` على رابط الواجهة الفعلي

## تشغيل المشروع (تطوير)
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

## جاهزية الإنتاج (بدون نشر فعلي)
### Backend
```bash
cd backend
npm run start:prod
```

### Frontend
```bash
cd fuel-frontend-v2
npm run build
npm run preview:host
```

## فحوصات سريعة
### Backend health
```bash
cd backend
npm run healthcheck
```

## ملاحظات مهمة
- لا تعتمد على الموديلات القديمة كما هي
- Shift القديم يجب أن يتحول إلى OperationalDay + PumpAssignment + WorkerClosing
- Tank القديم يجب أن ينقسم إلى StorageTank + TankDelivery
- Sale القديم يجب أن يتحول إلى SalesLedger ناتج من القراءات وفترات الأسعار


## ترتيب التشغيل الموصى به
1. شغّل backend أولًا وتأكد من نجاح `/api/health`.
2. بعد ذلك شغّل frontend.
3. افتح الواجهة وسجّل الدخول ثم اختر المحطة.

## متغيرات البيئة المطلوبة
راجع `.env.example`، وأهم المتغيرات:
- Backend: `PORT`, `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `ENFORCE_AUTH`
- Frontend: `VITE_API_BASE_URL`, `VITE_API_TIMEOUT_MS`

## تشغيل الإنتاج (مرجعي)
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

## التحقق بعد النشر
1. فحص صحة الخادم:
```bash
cd backend
npm run healthcheck
```
2. اختبار تسجيل الدخول وصلاحيات الأدوار الأساسية.
3. التحقق من تحميل لوحة التحكم والتقارير بدون أخطاء صامتة.

## أدلة التسليم للمستخدم النهائي (Phase 11)
- دليل المستخدم النهائي: `docs/user-guide.md`
- دليل التشغيل الداخلي: `docs/operational-guide.md`
- دليل استكشاف المشاكل: `docs/troubleshooting-guide.md`
- ملاحظات التسليم النهائي: `docs/final-handoff-notes-phase-11.md`

## النسخ الاحتياطي
تمت إضافة دليل النسخ الاحتياطي والاستعادة هنا:
- `docs/backup-and-restore.md`

## التسليم والتشغيل الإنتاجي
- راجع `docs/deployment-handoff.md` لخطوات النشر والفحص النهائي.
