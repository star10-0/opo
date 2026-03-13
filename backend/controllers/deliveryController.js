import TankDelivery from "../models/TankDelivery.js";

function buildFilters(query = {}) {
  const filters = { isDeleted: false };

  if (query.stationId) filters.stationId = query.stationId;
  if (query.monthKey) filters.monthKey = query.monthKey;
  if (query.fuelType) filters.fuelType = query.fuelType;
  if (query.from || query.to) {
    filters.deliveryDate = {};
    if (query.from) filters.deliveryDate.$gte = query.from;
    if (query.to) filters.deliveryDate.$lte = query.to;
  }
  if (query.search) {
    filters.$or = [
      { driverName: { $regex: query.search, $options: "i" } },
      { truckNumber: { $regex: query.search, $options: "i" } },
      { fuelType: { $regex: query.search, $options: "i" } },
    ];
  }

  return filters;
}

export async function listDeliveries(req, res, next) {
  try {
    const filters = buildFilters(req.query);
    const limit = Number(req.query.limit || 0);

    let query = TankDelivery.find(filters).sort({ deliveryDate: -1, createdAt: -1 });
    if (limit > 0) query = query.limit(limit);

    const rows = await query;
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

export async function createDelivery(req, res, next) {
  try {
    const payload = { ...req.body };
    const now = new Date();

    if (!payload.deliveryDate) payload.deliveryDate = now.toISOString();
    if (!payload.monthKey) payload.monthKey = payload.deliveryDate.slice(0, 7);
    if (!payload.driverName) payload.driverName = "غير محدد";
    if (!payload.truckNumber) payload.truckNumber = "غير محدد";
    if (!payload.targetTankId) payload.targetTankId = req.body.targetTankId || null;
    if (!payload.createdBy) payload.createdBy = req.body.createdBy || "000000000000000000000000";

    const created = await TankDelivery.create(payload);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
}

export async function updateDelivery(req, res, next) {
  try {
    const updated = await TankDelivery.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Delivery not found" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteDelivery(req, res, next) {
  try {
    const deleted = await TankDelivery.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user?._id || null },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Delivery not found" });
    }

    res.json({ success: true, data: deleted });
  } catch (error) {
    next(error);
  }
}
