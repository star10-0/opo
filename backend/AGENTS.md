# Backend AGENTS.md

## Scope
هذا الملف خاص بالخلفية فقط.

## Backend priorities
1. صحة الموديلات
2. صحة العلاقات
3. صحة المنطق المحاسبي
4. حماية الصلاحيات
5. استقرار الـ API

## Rules
- استخدم Mongoose models واضحة
- افصل routes عن controllers عن services
- ضع validation واضحًا
- أضف stationId لكل كيان تشغيلي
- استخدم soft delete
- سجّل العمليات الحساسة في AuditLog
- لا تسمح بتعديل opening readings المثبتة مباشرة
- استخدم ApprovalRequest للحالات الحساسة

## Suggested services
- stationService
- userService
- storageTankService
- tankDeliveryService
- pumpService
- operationalDayService
- pumpAssignmentService
- meterReadingService
- fuelPricePeriodService
- workerClosingService
- distributionVehicleService
- reconciliationService
- approvalService
- auditLogService
- reportService