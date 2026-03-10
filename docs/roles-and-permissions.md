# Roles and Permissions

## Admin / Manager
- view_all_stations
- manage_users
- manage_permissions
- manage_stations
- view_reports
- view_dashboard
- co_approve_sensitive_edits
- co_approve_deletes
- view_audit_logs
- manage_tanks
- manage_deliveries
- manage_distribution_vehicles

## Accountant
- view_allowed_stations
- review_worker_closings
- archive_or_suspend_reconciliation
- review_variances
- approve_post_archive_edits_where_allowed
- view_reports
- view_dashboard
- view_audit_logs
- review_deliveries_if_required

## Worker
- view_assigned_station
- open_pump_assignment
- record_opening_reading
- record_intermediate_reading
- record_closing_reading
- submit_own_closing
- register_delivery
- add_notes
- create_distribution_vehicle_session_if_allowed

## Sensitive actions
### يحتاج موافقة غالبًا
- unlock_opening_reading
- edit_archived_worker_closing
- delete_sensitive_record
- reopen_archived_record

### قواعد
- الحذف منطقي فقط
- التعديل بعد الأرشفة لا يتم مباشرة
- موافقة المدير والمحاسب مطلوبة في الحالات الحساسة