# Test Scenarios

## 1. فتح يوم تشغيلي
- Input: محطة فعالة + تاريخ جديد
- Expected: إنشاء OperationalDay واحد فقط

## 2. استلام مضخة
- Input: عامل + مضخة + opening reading
- Expected: إنشاء PumpAssignment وتثبيت opening reading

## 3. تغير سعر
- Input: تغيير سعر أثناء اليوم
- Expected:
  - إنشاء reading وسيط
  - إغلاق فترة سعر قديمة
  - فتح فترة جديدة

## 4. إنهاء حساب عامل
- Input: closing reading + expenses + actual cash
- Expected:
  - حساب sold liters
  - حساب gross sales
  - حساب expected cash
  - حساب variance
  - status submitted

## 5. مراجعة المحاسب
- Input: worker closings submitted
- Expected:
  - reconciliation batch
  - approved أو suspended

## 6. تسجيل صهريج
- Input: delivery linked to tank
- Expected:
  - tank delivery saved
  - tank quantity updated after approval

## 7. سيارة التوزيع
- Input: opening + closing
- Expected:
  - total sold liters
  - total amount
  - dashboard summary updated

## 8. طلب تعديل بعد الأرشفة
- Input: approval request
- Expected:
  - pending decisions
  - audit log entry
  - no direct modification before approval