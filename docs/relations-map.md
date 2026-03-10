# Relations Map

- Station 1---N Users
- Station 1---N StorageTanks
- Station 1---N TankDeliveries
- Station 1---N Pumps
- Station 1---N DistributionVehicles
- Station 1---N OperationalDays

- OperationalDay 1---N PumpAssignments
- OperationalDay 1---N DistributionVehicleSessions
- OperationalDay 1---N SalesLedger
- OperationalDay 1---1 ReconciliationBatch
- OperationalDay 1---N Reports

- PumpAssignment 1---N MeterReadings
- PumpAssignment 1---N FuelPricePeriods
- PumpAssignment 1---1 WorkerClosing

- WorkerClosing 1---N ShiftExpenses

- Any Entity 1---N ApprovalRequests
- Any Entity 1---N AuditLogs