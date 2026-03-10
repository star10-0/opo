# Frontend AGENTS.md

## Scope
هذا الملف خاص بالواجهة فقط.

## Frontend priorities
1. صحة الربط مع الـ API
2. وضوح الشاشات
3. منع التلاعب بالبيانات الحساسة
4. تحديث الواجهة بعد الحفظ
5. عرض الرسائل بشكل واضح

## Rules
- لا تعتمد على أسماء حقول غير موثقة
- استخدم طبقة API واضحة داخل src/api
- افصل الصفحات عن المكونات الصغيرة
- اجعل صفحات اليوم التشغيلي والمضخات واضحة
- after save:
  - حدث البيانات
  - اعرض إشعار نجاح أو فشل واضح
- fields التي تكون locked يجب أن تكون read-only بصريًا ووظيفيًا
- اجعل الصلاحيات تطبق على مستوى إظهار العناصر والأزرار

## Required pages
- Dashboard
- Operational Day
- Pump Assignments
- Worker Closing
- Deliveries
- Storage Tanks
- Distribution Vehicle
- Reports
- Permissions
- Audit Log