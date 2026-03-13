const rolePermissions = {
  admin: [
    "view_all_stations",
    "manage_users",
    "manage_permissions",
    "manage_stations",
    "view_reports",
    "view_dashboard",
    "co_approve_sensitive_edits",
    "co_approve_deletes",
    "view_audit_logs",
    "manage_tanks",
    "manage_deliveries",
    "manage_distribution_vehicles"
  ],
  accountant: [
    "view_allowed_stations",
    "review_worker_closings",
    "archive_or_suspend_reconciliation",
    "review_variances",
    "approve_post_archive_edits_where_allowed",
    "view_reports",
    "view_dashboard",
    "view_audit_logs",
    "review_deliveries_if_required"
  ],
  worker: [
    "view_assigned_station",
    "open_pump_assignment",
    "record_opening_reading",
    "record_intermediate_reading",
    "record_closing_reading",
    "submit_own_closing",
    "register_delivery",
    "add_notes",
    "create_distribution_vehicle_session_if_allowed"
  ]
};

export function getUserPermissions() {
  const role = localStorage.getItem("role") || "worker";
  const dynamic = JSON.parse(localStorage.getItem("permissions") || "[]");
  return new Set([...(rolePermissions[role] || []), ...dynamic]);
}

export function can(permission) {
  return getUserPermissions().has(permission);
}

export function canAny(permissions = []) {
  return permissions.some((permission) => can(permission));
}
