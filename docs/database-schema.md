# Database Schema

## 1. Station
- name
- code
- address
- phone
- status
- defaultDayOpenTime
- timezone

## 2. User
- name
- email
- passwordHash
- role
- stationAccess
- permissions
- isActive
- lastLoginAt

## 3. StorageTank
- stationId
- tankName
- tankCode
- fuelType
- capacityLiters
- currentQuantityLiters
- lowLevelThreshold
- status
- notes

## 4. TankDelivery
- stationId
- deliveryDate
- monthKey
- driverName
- truckNumber
- fuelType
- targetTankId
- quantityLiters
- arrivalTime
- unloadStartTime
- unloadEndTime
- unloadedBy
- notes
- createdBy
- approvalStatus
- isDeleted
- deletedAt
- deletedBy

## 5. Pump
- stationId
- pumpName
- pumpCode
- fuelType
- linkedTankIds
- meterUnit
- isActive
- openingLockEnabled

## 6. OperationalDay
- stationId
- operationalDate
- autoOpenTime
- openedAt
- closedAt
- status
- openedAutomatically
- notes
- archivedBy
- archivedAt

## 7. PumpAssignment
- stationId
- operationalDayId
- pumpId
- primaryWorkerId
- helperWorkerIds
- assignmentStartAt
- assignmentEndAt
- openingReading
- openingReadingLocked
- openingReadingRecordedAt
- openingReadingRecordedBy
- closingReading
- closingReadingRecordedAt
- closingReadingRecordedBy
- status
- notes

## 8. MeterReading
- stationId
- operationalDayId
- pumpAssignmentId
- readingMode
- readingType
- pumpId
- fuelType
- value
- recordedAt
- recordedBy
- locked
- notes

## 9. FuelPricePeriod
- stationId
- operationalDayId
- pumpAssignmentId
- fuelType
- pricePerLiter
- startReadingValue
- endReadingValue
- startedAt
- endedAt
- startedBy
- reason
- status

## 10. WorkerClosing
- stationId
- operationalDayId
- pumpAssignmentId
- primaryWorkerId
- helperWorkerIds
- totalSoldLiters
- grossSalesAmount
- expenseAmount
- bankDepositAmount
- otherDeductionsAmount
- expectedCash
- actualCash
- variance
- status
- submittedAt
- accountantReviewedBy
- accountantReviewedAt
- managerVisible
- notes

## 11. ShiftExpense
- stationId
- operationalDayId
- workerClosingId
- expenseType
- amount
- description
- recordedBy
- recordedAt

## 12. DistributionVehicle
- stationId
- vehicleName
- vehicleCode
- defaultFuelType
- isActive
- notes

## 13. DistributionVehicleSession
- stationId
- operationalDayId
- vehicleId
- driverId
- driverName
- helperWorkerIds
- fuelType
- openingReading
- openingReadingLocked
- closingReading
- totalSoldLiters
- totalAmount
- status
- notes

## 14. SalesLedger
- stationId
- operationalDayId
- sourceType
- sourceId
- workerClosingId
- fuelType
- soldLiters
- unitPrice
- totalAmount
- pricePeriodId
- recordedAt

## 15. ReconciliationBatch
- stationId
- operationalDayId
- workerClosingIds
- totalGrossSales
- totalExpenses
- totalExpectedCash
- totalActualCash
- totalVariance
- status
- reviewedBy
- reviewedAt
- managerNotified
- notes

## 16. ApprovalRequest
- stationId
- entityType
- entityId
- requestType
- requestedBy
- reason
- beforeSnapshot
- proposedChanges
- accountantDecision
- accountantBy
- accountantAt
- managerDecision
- managerBy
- managerAt
- finalStatus
- appliedAt

## 17. AuditLog
- stationId
- userId
- actionType
- entityType
- entityId
- referenceId
- beforeData
- afterData
- metadata
- ipAddress
- createdAt

## 18. Notification
- stationId
- targetUserIds
- targetRoles
- type
- title
- message
- severity
- isRead
- relatedEntityType
- relatedEntityId
- createdAt

## 19. Report
- stationId
- reportType
- operationalDate
- periodStart
- periodEnd
- totals
- comparisons
- topWorkers
- topPumps
- tankSummary
- distributionVehicleSummary
- generatedAutomatically
- generatedAt
- generatedBy

## Important indexes
- Station.code unique
- User.email unique
- OperationalDay: stationId + operationalDate unique
- Pump: stationId + pumpCode unique
- DistributionVehicle: stationId + vehicleCode unique