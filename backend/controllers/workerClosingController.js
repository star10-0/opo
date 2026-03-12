import { workerClosingService } from "../services/workerClosingService.js";

export async function createWorkerClosing(req, res, next) {
  try {
    const created = await workerClosingService.create(req.body, {
      userId: req.body.primaryWorkerId,
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
}

export async function submitWorkerClosing(req, res, next) {
  try {
    const updated = await workerClosingService.submit(req.params.id, {
      userId: req.body.userId,
      ipAddress: req.ip,
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function listWorkerClosings(req, res, next) {
  try {
    const data = await workerClosingService.list({
      stationId: req.query.stationId,
      operationalDayId: req.query.operationalDayId,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
