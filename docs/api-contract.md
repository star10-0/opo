# API Contract

## Response format
### Success
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}

### Error
{
  "success": false,
  "message": "Operation failed",
  "error": "Error details"
}

## Stations
### GET /api/stations
- الهدف: جلب المحطات المسموح بها للمستخدم

### POST /api/stations
- الهدف: إنشاء محطة
- الصلاحية: المدير

### GET /api/stations/allowed
- الهدف: جلب المحطات المسموح بها للمستخدم الحالي مع meta (عدد المحطات الكليّة)

### POST /api/stations/bootstrap
- الهدف: تهيئة أول محطة (onboarding) مع إمكانية إنشاء خزانات/مضخات ابتدائية اختياريًا
- الصلاحية: المدير


## Users
### GET /api/users
- الهدف: جلب المستخدمين
- الصلاحية: المدير

### POST /api/users
- الهدف: إنشاء مستخدم
- الصلاحية: المدير

## Storage Tanks
### GET /api/tanks
- الهدف: جلب الخزانات حسب المحطة

### POST /api/tanks
- الهدف: إنشاء خزان
- الصلاحية: المدير

## Tank Deliveries
### GET /api/deliveries
- الهدف: جلب عمليات الصهاريج

### POST /api/deliveries
- الهدف: تسجيل صهريج وارد
- الصلاحية: عامل أو مدير حسب السياسة

### PUT /api/deliveries/:id
- الهدف: تعديل صهريج
- الصلاحية: حسب حالة السجل والموافقة

## Operational Day
### GET /api/operational-days/current?stationId=
- الهدف: جلب اليوم التشغيلي الحالي

### POST /api/operational-days/open
- الهدف: فتح يوم تشغيلي
- الصلاحية: system أو المدير

### POST /api/operational-days/:id/close
- الهدف: إغلاق اليوم التشغيلي

## Pump Assignments
### POST /api/pump-assignments
- الهدف: فتح استلام مضخة

### POST /api/pump-assignments/:id/lock-opening
- الهدف: تثبيت رقم البداية

### POST /api/pump-assignments/:id/close
- الهدف: إغلاق استلام المضخة

## Meter Readings
### POST /api/meter-readings
- الهدف: تسجيل قراءة
- readingType:
  - opening
  - price_change_marker
  - closing
  - correction

## Fuel Price Periods
### POST /api/price-periods
- الهدف: بدء فترة سعر جديدة

### POST /api/price-periods/:id/close
- الهدف: إغلاق فترة سعر

## Worker Closings
### POST /api/worker-closings
- الهدف: إنشاء أو تحديث حساب عامل

### POST /api/worker-closings/:id/submit
- الهدف: إرسال الحساب للمحاسب

## Expenses
### POST /api/expenses
- الهدف: تسجيل مصروف على حساب عامل

## Distribution Vehicles
### GET /api/distribution-vehicles
- الهدف: جلب سيارات التوزيع

### POST /api/distribution-vehicles
- الهدف: إنشاء سيارة توزيع

## Distribution Vehicle Sessions
### POST /api/distribution-vehicle-sessions
- الهدف: بدء جلسة سيارة توزيع

### POST /api/distribution-vehicle-sessions/:id/close
- الهدف: إغلاق جلسة سيارة توزيع

## Reconciliation
### POST /api/reconciliation/:operationalDayId/review
- الهدف: مراجعة المحاسب واعتماد أو تعليق

## Approvals
### POST /api/approval-requests
- الهدف: إنشاء طلب موافقة

### POST /api/approval-requests/:id/accountant-decision
- الهدف: قرار المحاسب

### POST /api/approval-requests/:id/manager-decision
- الهدف: قرار المدير

## Reports
### GET /api/reports/daily?stationId=&date=
### GET /api/reports/weekly?stationId=&from=&to=
### GET /api/reports/monthly?stationId=&monthKey=

## Sales Ledger
### GET /api/sales-ledger?operationalDayId=
- الهدف: جلب قيود دفتر المبيعات المحسوبة

### POST /api/sales-ledger/generate
- الهدف: توليد قيود دفتر المبيعات من القراءات وفترات الأسعار فقط

## Audit Logs
### GET /api/audit-logs?stationId=
- الهدف: جلب سجلات العمليات الحساسة


## Enterprise Reports
### GET /api/reports/enterprise/oversight?stationId=&stationIds=&daysBack=
- الهدف: عرض ملخص مركزي متعدد المحطات مع درجة مخاطر تشغيلية لكل محطة

## Automation
### GET /api/automation/preview?stationId=&stationIds=&daysBack=
- الهدف: معاينة التنبيهات التلقائية المقترحة دون تنفيذ

### POST /api/automation/run-manual
- الهدف: تشغيل يدوي آمن (dry-run افتراضيًا) لتجهيز إرسال التنبيهات عبر قنوات مدعومة

### GET /api/automation/pending-review-reminders?stationId=
- الهدف: تذكير بالمراجعات المعلقة (موافقات + إغلاقات مرسلة)

### GET /api/automation/integration-catalog
- الهدف: عرض جاهزية قنوات التكامل (email/sms/gps/accounting/spreadsheet)
