import { approvalService } from "../services/approvalService.js";

export async function createApprovalRequest(req, res, next) {
  try {
    const request = await approvalService.create(req.body, {
      userId: req.body.requestedBy,
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
}

export async function accountantDecision(req, res, next) {
  try {
    const request = await approvalService.accountantDecision(req.params.id, req.body, {
      userId: req.body.by,
      ipAddress: req.ip,
    });
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
}

export async function managerDecision(req, res, next) {
  try {
    const request = await approvalService.managerDecision(req.params.id, req.body, {
      userId: req.body.by,
      ipAddress: req.ip,
    });
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
}
