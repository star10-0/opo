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
