# AGENTS.md

## Project
هذا مشروع إدارة محطات وقود متعدد المحطات.

### Tech stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose

## Core business model
- المحطة هي الكيان الأعلى
- اليوم التشغيلي هو الحاوية الرئيسية لكل العمليات اليومية
- داخل اليوم التشغيلي توجد استلامات فرعية للمضخات
- لكل مضخة عامل مسؤول واحد ويمكن وجود عمال مساعدين
- أرقام البداية تثبت ولا تعدل مباشرة
- عند تغير السعر داخل نفس اليوم التشغيلي تؤخذ قراءة وسيطة وتغلق فترة السعر القديمة وتبدأ فترة جديدة
- سيارة التوزيع تعمل كوحدة بيع مستقلة لكنها ترتبط باليوم التشغيلي والمحطة
- الحذف منطقي فقط
- أي تعديل حساس بعد الأرشفة يمر عبر Approval Requests
- كل كيان تشغيلي يجب أن يحمل stationId

## Priority
1. استقرار قاعدة البيانات والموديلات
2. صحة المنطق المحاسبي
3. صحة الـ API
4. استقرار الواجهة
5. تحسين الشكل لاحقًا

## Hard rules
- لا تحذف سجلات حساسة حذفًا فعليًا
- لا تكسر أسماء الحقول دون تحديث كل الأماكن المرتبطة
- لا تضع منطقًا محاسبيًا معقدًا داخل routes مباشرة
- ضع المنطق في services
- أي تعديل على opening readings أو worker closings المؤرشفة يجب أن يكون عبر طلب موافقة
- اليوم التشغيلي هو المرجع الرئيسي لكل العمليات اليومية
- التقارير تبنى من البيانات المصدرية أو ledger موثوق
- لا تنشئ أكثر من operational day نشط لنفس المحطة في نفس التاريخ

## Main entities
- Station
- User
- StorageTank
- TankDelivery
- Pump
- OperationalDay
- PumpAssignment
- MeterReading
- FuelPricePeriod
- WorkerClosing
- ShiftExpense
- DistributionVehicle
- DistributionVehicleSession
- SalesLedger
- ReconciliationBatch
- ApprovalRequest
- AuditLog
- Notification
- Report

## Expected folder organization
- backend/models
- backend/routes
- backend/controllers
- backend/services
- backend/middlewares
- backend/validators
- frontend/src/pages
- frontend/src/components
- frontend/src/api
- docs

## Commands
### Backend
- npm install
- npm run dev
- npm start

### Frontend
- npm install
- npm run dev
- npm run build

## Before finishing any task
- شغل build أو التحقق المتاح
- راجع أسماء الحقول بين frontend و backend
- حدث التوثيق المتأثر
- اذكر الملفات المعدلة بوضوح