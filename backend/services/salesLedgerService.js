import SalesLedger from "../models/SalesLedger.js";

function validateSegments(segments = []) {
  if (!Array.isArray(segments) || segments.length === 0) {
    throw new Error("Sales ledger must be generated from reading and price segments");
  }

  for (const segment of segments) {
    if (segment.endReading < segment.startReading) {
      throw new Error("Invalid reading segment");
    }
  }
}

export const salesLedgerService = {
  async generateFromReadings(payload) {
    validateSegments(payload.priceSegments);

    const docs = payload.priceSegments.map((segment) => {
      const soldLiters = Number(segment.endReading) - Number(segment.startReading);
      const unitPrice = Number(segment.unitPrice);
      return {
        stationId: payload.stationId,
        operationalDayId: payload.operationalDayId,
        sourceType: payload.sourceType,
        sourceId: payload.sourceId,
        workerClosingId: payload.workerClosingId,
        fuelType: payload.fuelType,
        soldLiters,
        unitPrice,
        totalAmount: soldLiters * unitPrice,
        pricePeriodId: segment.pricePeriodId,
      };
    });

    return SalesLedger.insertMany(docs);
  },

  async listByOperationalDay(operationalDayId) {
    return SalesLedger.find({ operationalDayId }).sort({ createdAt: 1 });
  },
};
