import { reconciliationService } from "../services/reconciliationService.js";

export async function reviewReconciliation(req, res, next) {
  try {
    const batch = await reconciliationService.reviewOperationalDay(
      {
        stationId: req.body.stationId,
        operationalDayId: req.params.operationalDayId,
        reviewedBy: req.body.reviewedBy,
        status: req.body.status,
        notes: req.body.notes,
      },
      {
        userId: req.body.reviewedBy,
        ipAddress: req.ip,
      }
    );

    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
}
