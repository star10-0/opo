import express from "express";
import WorkerClosing from "../models/WorkerClosing.js";
import DistributionVehicleSession from "../models/DistributionVehicleSession.js";

const router = express.Router();

function sumTotals(rows = []) {
  return rows.reduce(
    (acc, row) => {
      acc.totalAmount += Number(row.grossSalesAmount || row.totalAmount || 0);
      acc.totalVariance += Number(row.variance || 0);
      return acc;
    },
    { totalAmount: 0, totalVariance: 0 }
  );
}

router.get("/daily", async (req, res) => {
  try {
    const { stationId } = req.query;
    const rows = await WorkerClosing.find({ stationId, isDeleted: false }).sort({ createdAt: -1 });
    res.json({ success: true, data: { totals: sumTotals(rows), items: rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/weekly", async (req, res) => {
  try {
    const { stationId } = req.query;
    const rows = await WorkerClosing.find({ stationId, isDeleted: false }).sort({ createdAt: -1 });
    res.json({ success: true, data: { totals: sumTotals(rows), comparisons: {} } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/monthly", async (req, res) => {
  try {
    const { stationId } = req.query;
    const rows = await WorkerClosing.find({ stationId, isDeleted: false }).sort({ createdAt: -1 });
    res.json({ success: true, data: { totals: sumTotals(rows), comparisons: {} } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/variances", async (req, res) => {
  try {
    const { stationId } = req.query;
    const rows = await WorkerClosing.find({ stationId, isDeleted: false }).sort({ createdAt: -1 });
    res.json({ success: true, data: { totals: sumTotals(rows), items: rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/distribution-vehicle", async (req, res) => {
  try {
    const { stationId } = req.query;
    const rows = await DistributionVehicleSession.find({ stationId, isDeleted: false }).sort({ createdAt: -1 });
    const totals = rows.reduce((acc, row) => {
      acc.totalAmount += Number(row.totalAmount || 0);
      return acc;
    }, { totalAmount: 0 });
    res.json({ success: true, data: { totals, items: rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
