# Backend Structure

## Recommended folders
- backend/models
- backend/routes
- backend/controllers
- backend/services
- backend/middlewares
- backend/validators
- backend/utils

## Rules
- models: تعريف Mongoose schemas فقط
- routes: تعريف المسارات فقط
- controllers: استقبال الطلب وتمريره للخدمة
- services: منطق العمل الحقيقي والحسابات
- middlewares: auth / roles / validation / error handling
- validators: التحقق من المدخلات
- utils: وظائف مساعدة مشتركة

## Important design rules
- لا تضع منطق التسعير وفترات الأسعار داخل route
- لا تضع منطق تحديث الخزانات داخل controller إن أمكن
- أنشئ services واضحة مثل:
  - operationalDayService
  - pumpAssignmentService
  - pricingService
  - workerClosingService
  - reconciliationService
  - deliveryService
  - reportingService
  - approvalService
  - auditLogService