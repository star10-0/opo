# Workflows

## 1. فتح اليوم التشغيلي
1. النظام يفتح اليوم تلقائيًا حسب الوقت المحدد
2. يتم إنشاء OperationalDay
3. تصبح الحالة open

## 2. استلام مضخة
1. العامل يختار المضخة
2. يسجل رقم البداية
3. يضيف العمال المساعدين إن وجدوا
4. يتم تثبيت رقم البداية
5. يبدأ العمل

## 3. تغيير السعر (المرحلة الثالثة - المسارات الصحيحة)
### التسلسل الصحيح للعملية
1. المدير يقرر تغيير السعر داخل نفس اليوم التشغيلي.
2. تسجل قراءة وسيطة للمضخة (marker) عبر:
   - `POST /api/meter-readings`
   - `readingType = price_change_marker`
3. تغلق فترة السعر الحالية عبر:
   - `POST /api/price-periods/:id/close`
4. تبدأ فترة سعر جديدة بالسعر الجديد عبر:
   - `POST /api/price-periods`
5. يستمر التشغيل على نفس `operationalDayId` ونفس `pumpAssignmentId`.

### أخطاء المسارات الشائعة في المرحلة الثالثة
- خطأ: `POST /api/meter-reading`
  - الصحيح: `POST /api/meter-readings`
- خطأ: `POST /api/price-period`
  - الصحيح: `POST /api/price-periods`
- خطأ: `POST /api/price-periods/close/:id`
  - الصحيح: `POST /api/price-periods/:id/close`

### الحد الأدنى من البيانات المطلوبة
- تسجيل القراءة الوسيطة `POST /api/meter-readings`:
  - `stationId`
  - `operationalDayId`
  - `pumpAssignmentId`
  - `pumpId`
  - `fuelType`
  - `readingType` (يجب أن تكون `price_change_marker` في هذه المرحلة)
  - `value`
  - `recordedBy`
- إغلاق فترة السعر `POST /api/price-periods/:id/close`:
  - `endReadingValue`
  - `endedAt` (اختياري)
- إنشاء فترة سعر جديدة `POST /api/price-periods`:
  - `stationId`
  - `operationalDayId`
  - `pumpAssignmentId`
  - `fuelType`
  - `pricePerLiter`
  - `startReadingValue`

## 4. إنهاء حساب عامل
1. يسجل العامل رقم النهاية
2. تحسب الكمية المباعة
3. تحسب القيمة حسب فترات الأسعار
4. يسجل المصاريف
5. يسجل النقد الفعلي
6. يحسب الفرق
7. يرسل الحساب للمحاسب

## 5. مراجعة المحاسب
1. يراجع الحسابات الفرعية
2. يراجع المصاريف والفروقات
3. يعتمد أو يعلق
4. ينشئ ReconciliationBatch

## 6. تسجيل صهريج
1. يسجل العامل أو المسؤول بيانات الصهريج
2. يربط العملية بالخزان
3. عند الاعتماد تزيد كمية الخزان
4. تحفظ العملية في الأرشيف الشهري

## 7. سيارة التوزيع
1. تبدأ جلسة سيارة توزيع
2. تسجل قراءة البداية
3. عند الإنهاء تسجل قراءة النهاية
4. تحسب الكمية والقيمة
5. تظهر في لوحة التحكم والتقارير باسم السيارة

## 8. طلب موافقة
1. ينشئ المستخدم طلب تعديل أو حذف
2. يراجع المحاسب الطلب
3. يراجع المدير إذا لزم
4. يطبق الإجراء
5. يسجل كل شيء في AuditLog
