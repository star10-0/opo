import WorkerClosing from "../models/WorkerClosing.js";
import DistributionVehicleSession from "../models/DistributionVehicleSession.js";

function buildDateFilter({ date, from, to, monthKey }) {
  if (monthKey) {
    const start = new Date(`${monthKey}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    return { $gte: start, $lt: end };
  }

  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { $gte: start, $lt: end };
  }

  if (from || to) {
    const range = {};
    if (from) range.$gte = new Date(from);
    if (to) range.$lte = new Date(to);
    return range;
  }

  return null;
}

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

function validateStationId(stationId) {
  if (!stationId) {
    const error = new Error("stationId مطلوب");
    error.statusCode = 400;
    throw error;
  }
}

export const reportService = {
  async workerClosingSummary(query = {}, { includeItems = false, includeComparisons = false } = {}) {
    validateStationId(query.stationId);

    const filter = { stationId: query.stationId, isDeleted: false };
    const dateFilter = buildDateFilter(query);
    if (dateFilter) filter.createdAt = dateFilter;

    const rows = await WorkerClosing.find(filter).sort({ createdAt: -1 });
    const response = { totals: sumTotals(rows) };

    if (includeItems) response.items = rows;
    if (includeComparisons) response.comparisons = {};

    return response;
  },

  async distributionVehicleSummary(query = {}) {
    validateStationId(query.stationId);

    const filter = { stationId: query.stationId, isDeleted: false };
    const dateFilter = buildDateFilter(query);
    if (dateFilter) filter.createdAt = dateFilter;

    const rows = await DistributionVehicleSession.find(filter).sort({ createdAt: -1 });
    const totals = rows.reduce(
      (acc, row) => {
        acc.totalAmount += Number(row.totalAmount || 0);
        return acc;
      },
      { totalAmount: 0 }
    );

    return { totals, items: rows };
  },
};

