import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import WorkerClosing from "../models/WorkerClosing.js";
import DistributionVehicleSession from "../models/DistributionVehicleSession.js";
import TankDelivery from "../models/TankDelivery.js";
import StorageTank from "../models/StorageTank.js";

const router = express.Router();

router.use(requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant"]));

function parseStationIds(stationId, stationIds) {
  const joined = [stationId, stationIds].filter(Boolean).join(",");
  return joined.split(",").map((id) => id.trim()).filter(Boolean);
}

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
  const { fuelType, workerId, status, stationId, stationIds } = query;
  const filters = { isDeleted: false };
  const parsedStationIds = parseStationIds(stationId, stationIds);

  if (parsedStationIds.length === 1) filters.stationId = parsedStationIds[0];
  if (parsedStationIds.length > 1) filters.stationId = { $in: parsedStationIds };
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

function topStationBreakdown(rows = []) {
  const grouped = rows.reduce((acc, row) => {
    const key = String(row.stationId || "unknown");
    if (!acc[key]) {
      acc[key] = { stationId: key, closingsCount: 0, totalAmount: 0, totalVariance: 0, totalLiters: 0 };
    }
    acc[key].closingsCount += 1;
    acc[key].totalAmount += Number(row.grossSalesAmount || 0);
    acc[key].totalVariance += Number(row.variance || 0);
    acc[key].totalLiters += Number(row.totalSoldLiters || 0);
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10);
}

function kpisFromClosings(rows = []) {
  const totals = sumClosings(rows);
  const count = rows.length;
  const varianceRows = rows.filter((row) => Number(row.variance || 0) !== 0).length;
  return {
    closingsCount: count,
    avgTicketAmount: count ? totals.totalAmount / count : 0,
    varianceRate: count ? varianceRows / count : 0,
    highVarianceCount: rows.filter((row) => Math.abs(Number(row.variance || 0)) >= 1000).length,
    balancedClosingsCount: rows.filter((row) => Number(row.variance || 0) === 0).length,
  };
}

router.get("/daily", async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const filters = buildCommonFilters(req.query);
    const rows = await WorkerClosing.find({ ...filters, createdAt: { $gte: start, $lte: end } }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: {
        period: { start, end },
        totals: sumClosings(rows),
        kpis: kpisFromClosings(rows),
        stationBreakdown: topStationBreakdown(rows),
        items: rows,
      }
    });
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
    res.json({
      success: true,
      data: {
        period: { start, end },
        totals: sumClosings(currentRows),
        comparisons: comparePeriods(currentRows, previousRows),
        kpis: kpisFromClosings(currentRows),
        stationBreakdown: topStationBreakdown(currentRows),
        items: currentRows,
      }
    });
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
    res.json({
      success: true,
      data: {
        period: { start, end },
        totals: sumClosings(currentRows),
        comparisons: comparePeriods(currentRows, previousRows),
        kpis: kpisFromClosings(currentRows),
        stationBreakdown: topStationBreakdown(currentRows),
        items: currentRows,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/variances", async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const filters = buildCommonFilters(req.query);
    const rows = await WorkerClosing.find({ ...filters, createdAt: { $gte: start, $lte: end }, variance: { $ne: 0 } }).sort({ createdAt: -1 });
    res.json({ success: true, data: { period: { start, end }, totals: sumClosings(rows), kpis: kpisFromClosings(rows), stationBreakdown: topStationBreakdown(rows), items: rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/distribution-vehicle", async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const filters = { isDeleted: false };
    const stationIds = parseStationIds(req.query.stationId, req.query.stationIds);
    if (stationIds.length === 1) filters.stationId = stationIds[0];
    if (stationIds.length > 1) filters.stationId = { $in: stationIds };
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
    const { monthKey, fuelType } = req.query;
    const stationIds = parseStationIds(req.query.stationId, req.query.stationIds);
    const deliveryFilters = { isDeleted: false };
    const tankFilters = { isDeleted: false };

    if (stationIds.length === 1) {
      deliveryFilters.stationId = stationIds[0];
      tankFilters.stationId = stationIds[0];
    }
    if (stationIds.length > 1) {
      deliveryFilters.stationId = { $in: stationIds };
      tankFilters.stationId = { $in: stationIds };
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
      const stationIds = parseStationIds(req.query.stationId, req.query.stationIds);
      if (stationIds.length === 1) deliveryFilters.stationId = stationIds[0];
      if (stationIds.length > 1) deliveryFilters.stationId = { $in: stationIds };
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
      const stationIds = parseStationIds(req.query.stationId, req.query.stationIds);
      if (stationIds.length === 1) filters.stationId = stationIds[0];
      if (stationIds.length > 1) filters.stationId = { $in: stationIds };
      const items = await DistributionVehicleSession.find({ ...filters, createdAt: { $gte: start, $lte: end } });
      rows = items.map((row) => ({
        createdAt: row.createdAt,
        stationId: row.stationId,
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
        stationId: row.stationId,
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
