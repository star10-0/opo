const rolePermissions = {
  admin: [
    "view_dashboard",
    "view_reports",
    "manage_deliveries",
    "manage_tanks",
    "manage_distribution_vehicles",
    "record_intermediate_reading",
    "archive_or_suspend_reconciliation"
  ],
  accountant: [
    "view_dashboard",
    "view_reports",
    "review_worker_closings",
    "archive_or_suspend_reconciliation"
  ],
  worker: [
    "view_assigned_station",
    "open_pump_assignment",
    "record_opening_reading",
    "record_intermediate_reading",
    "record_closing_reading",
    "submit_own_closing",
    "register_delivery"
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
