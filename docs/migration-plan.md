# Migration Plan

## الهدف
الانتقال من الهيكل القديم إلى الهيكل الجديد دون كسر المشروع بالكامل دفعة واحدة.

## التحويلات الأساسية
- Shift -> OperationalDay + PumpAssignment + WorkerClosing
- Tank -> StorageTank + TankDelivery
- Sale -> SalesLedger
- DailyReport -> Report + ReconciliationBatch
- Notification يبقى مع توسعة

## ترتيب التنفيذ
1. إضافة Station model
2. توسيع User model
3. إنشاء StorageTank و TankDelivery
4. إنشاء Pump
5. إنشاء OperationalDay
6. إنشاء PumpAssignment
7. إنشاء MeterReading
8. إنشاء FuelPricePeriod
9. إنشاء WorkerClosing
10. إنشاء ShiftExpense
11. إنشاء DistributionVehicle
12. إنشاء DistributionVehicleSession
13. إنشاء SalesLedger
14. إنشاء ReconciliationBatch
15. إنشاء ApprovalRequest
16. إنشاء AuditLog
17. تحديث routes
18. تحديث frontend تدريجيًا

## سياسة التنفيذ
- لا تحذف القديم مباشرة
- أضف الجديد أولًا
- فعّل endpoints جديدة
- ثم انقل الواجهة إليها
- ثم أوقف القديم بعد التأكد