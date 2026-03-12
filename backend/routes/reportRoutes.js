import express from "express";
import WorkerClosing from "../models/WorkerClosing.js";
import DistributionVehicleSession from "../models/DistributionVehicleSession.js";
import TankDelivery from "../models/TankDelivery.js";
import StorageTank from "../models/StorageTank.js";

const router = express.Router();

function getDayRange(dateValue) {
  const date = dateValue ? new Date(dateValue) : new Date();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getDateRange(query = {}) {
  if (query.from && query.to) {
    return { start: new Date(query.from), end: new Date(query.to) };
  }

  if (query.monthKey) {
    const [year, month] = String(query.monthKey).split("-").map(Number);
    const start = new Date(year, (month || 1) - 1, 1);
    const end = new Date(year, month || 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  return getDayRange(query.date);
}

function buildCommonFilters(query = {}) {
  const { stationId, fuelType, workerId, status } = query;
  const filters = { isDeleted: false };
  if (stationId) filters.stationId = stationId;
  if (fuelType) filters.fuelType = fuelType;
  if (workerId) filters.primaryWorkerId = workerId;
  if (status) filters.status = status;
  return filters;
}

function sumClosings(rows = []) {
  return rows.reduce(
    (acc, row) => {
      acc.totalAmount += Number(row.grossSalesAmount || 0);
      acc.totalVariance += Number(row.variance || 0);
      acc.totalLiters += Number(row.totalSoldLiters || 0);
      acc.totalExpectedCash += Number(row.expectedCash || 0);
      acc.totalActualCash += Number(row.actualCash || 0);
      return acc;
    },
    { totalAmount: 0, totalVariance: 0, totalLiters: 0, totalExpectedCash: 0, totalActualCash: 0 }
  );
}

function comparePeriods(currentRows = [], prevRows = []) {
  const current = sumClosings(currentRows);
  const previous = sumClosings(prevRows);
  const salesDelta = current.totalAmount - previous.totalAmount;
  const litersDelta = current.totalLiters - previous.totalLiters;
  return { current, previous, salesDelta, litersDelta };
}

function rowsToCsv(rows = []) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const header = keys.map(escape).join(",");
  const body = rows.map((row) => keys.map((key) => escape(row[key])).join(",")).join("\n");
  return `${header}\n${body}`;
}

router.get("/daily", async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const filters = buildCommonFilters(req.query);
    const rows = await WorkerClosing.find({ ...filters, createdAt: { $gte: start, $lte: end } }).sort({ createdAt: -1 });
    res.json({ success: true, data: { period: { start, end }, totals: sumClosings(rows), items: rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/weekly", async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const filters = buildCommonFilters(req.query);
    const currentRows = await WorkerClosing.find({ ...filters, createdAt: { $gte: start, $lte: end } }).sort({ createdAt: -1 });
    const duration = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - duration - 1);
    const prevEnd = new Date(start.getTime() - 1);
    const previousRows = await WorkerClosing.find({ ...filters, createdAt: { $gte: prevStart, $lte: prevEnd } });
    res.json({ success: true, data: { period: { start, end }, totals: sumClosings(currentRows), comparisons: comparePeriods(currentRows, previousRows), items: currentRows } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/monthly", async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const filters = buildCommonFilters(req.query);
    const currentRows = await WorkerClosing.find({ ...filters, createdAt: { $gte: start, $lte: end } }).sort({ createdAt: -1 });
    const prevStart = new Date(start);
    prevStart.setMonth(prevStart.getMonth() - 1);
    const prevEnd = new Date(start.getTime() - 1);
    const previousRows = await WorkerClosing.find({ ...filters, createdAt: { $gte: prevStart, $lte: prevEnd } });
    res.json({ success: true, data: { period: { start, end }, totals: sumClosings(currentRows), comparisons: comparePeriods(currentRows, previousRows), items: currentRows } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/variances", async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const filters = buildCommonFilters(req.query);
    const rows = await WorkerClosing.find({ ...filters, createdAt: { $gte: start, $lte: end }, variance: { $ne: 0 } }).sort({ createdAt: -1 });
    res.json({ success: true, data: { period: { start, end }, totals: sumClosings(rows), items: rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/distribution-vehicle", async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const filters = { isDeleted: false };
    if (req.query.stationId) filters.stationId = req.query.stationId;
    if (req.query.fuelType) filters.fuelType = req.query.fuelType;

    const rows = await DistributionVehicleSession.find({ ...filters, createdAt: { $gte: start, $lte: end } }).sort({ createdAt: -1 });
    const totals = rows.reduce((acc, row) => {
      acc.totalAmount += Number(row.totalAmount || 0);
      acc.totalLiters += Number(row.totalSoldLiters || 0);
      return acc;
    }, { totalAmount: 0, totalLiters: 0 });
    res.json({ success: true, data: { period: { start, end }, totals, items: rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/deliveries-tanks", async (req, res) => {
  try {
    const { stationId, monthKey, fuelType } = req.query;
    const deliveryFilters = { isDeleted: false };
    const tankFilters = {};

    if (stationId) {
      deliveryFilters.stationId = stationId;
      tankFilters.stationId = stationId;
    }
    if (monthKey) deliveryFilters.monthKey = monthKey;
    if (fuelType) {
      deliveryFilters.fuelType = fuelType;
      tankFilters.fuelType = fuelType;
    }

    const [deliveries, tanks] = await Promise.all([
      TankDelivery.find(deliveryFilters).sort({ deliveryDate: -1, createdAt: -1 }),
      StorageTank.find(tankFilters).sort({ tankName: 1 }),
    ]);

    const totalDelivered = deliveries.reduce((acc, row) => acc + Number(row.quantityLiters || 0), 0);
    const byFuelType = deliveries.reduce((acc, row) => {
      const key = row.fuelType || "unknown";
      acc[key] = Number(acc[key] || 0) + Number(row.quantityLiters || 0);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totals: {
          deliveriesCount: deliveries.length,
          totalDelivered,
          tanksCount: tanks.length,
          tankCurrentQuantity: tanks.reduce((acc, row) => acc + Number(row.currentQuantityLiters || 0), 0),
          byFuelType,
        },
        deliveries,
        tanks,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/export/csv", async (req, res) => {
  try {
    const reportType = req.query.reportType || "daily";
    const endpointMap = {
      daily: "/daily",
      weekly: "/weekly",
      monthly: "/monthly",
      variances: "/variances",
      distributionVehicle: "/distribution-vehicle",
      deliveriesTanks: "/deliveries-tanks",
    };

    if (!endpointMap[reportType]) {
      return res.status(400).json({ success: false, message: "نوع التقرير غير مدعوم للتصدير" });
    }

    let rows = [];
    if (reportType === "deliveriesTanks") {
      const deliveryFilters = { isDeleted: false };
      if (req.query.stationId) deliveryFilters.stationId = req.query.stationId;
      if (req.query.monthKey) deliveryFilters.monthKey = req.query.monthKey;
      if (req.query.fuelType) deliveryFilters.fuelType = req.query.fuelType;
      const deliveries = await TankDelivery.find(deliveryFilters).sort({ deliveryDate: -1 });
      rows = deliveries.map((row) => ({
        deliveryDate: row.deliveryDate,
        monthKey: row.monthKey,
        fuelType: row.fuelType,
        quantityLiters: row.quantityLiters,
        driverName: row.driverName,
        truckNumber: row.truckNumber,
        approvalStatus: row.approvalStatus,
      }));
    } else if (reportType === "distributionVehicle") {
      const { start, end } = getDateRange(req.query);
      const filters = { isDeleted: false };
      if (req.query.stationId) filters.stationId = req.query.stationId;
      const items = await DistributionVehicleSession.find({ ...filters, createdAt: { $gte: start, $lte: end } });
      rows = items.map((row) => ({
        createdAt: row.createdAt,
        fuelType: row.fuelType,
        totalSoldLiters: row.totalSoldLiters,
        totalAmount: row.totalAmount,
        status: row.status,
      }));
    } else {
      const { start, end } = getDateRange(req.query);
      const filters = buildCommonFilters(req.query);
      const items = await WorkerClosing.find({ ...filters, createdAt: { $gte: start, $lte: end } });
      rows = items.map((row) => ({
        createdAt: row.createdAt,
        status: row.status,
        totalSoldLiters: row.totalSoldLiters,
        grossSalesAmount: row.grossSalesAmount,
        expenseAmount: row.expenseAmount,
        expectedCash: row.expectedCash,
        actualCash: row.actualCash,
        variance: row.variance,
      }));
    }

    const csv = rowsToCsv(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=${reportType}-report.csv`);
    res.send(`\uFEFF${csv}`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/export/pdf", async (req, res) => {
  res.status(501).json({ success: false, message: "TODO: تصدير PDF الكامل قيد التنفيذ، استخدم CSV حاليًا." });
});

export default router;
