import {
  createFuelPricePeriod,
  closeFuelPricePeriod,
  listFuelPricePeriods,
  getFuelPricePeriodById,
  updateFuelPricePeriod,
  softDeleteFuelPricePeriod,
} from "../services/fuelPricePeriodService.js";

const handleError = (res, error) => {
  res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal server error" });
};

export const createFuelPricePeriodHandler = async (req, res) => {
  try {
    const period = await createFuelPricePeriod(req.body);
    res.status(201).json(period);
  } catch (error) {
    handleError(res, error);
  }
};

export const closeFuelPricePeriodHandler = async (req, res) => {
  try {
    const period = await closeFuelPricePeriod(req.params.id, req.body);
    res.json(period);
  } catch (error) {
    handleError(res, error);
  }
};

export const listFuelPricePeriodsHandler = async (req, res) => {
  try {
    const periods = await listFuelPricePeriods(req.query);
    res.json(periods);
  } catch (error) {
    handleError(res, error);
  }
};

export const getFuelPricePeriodByIdHandler = async (req, res) => {
  try {
    const period = await getFuelPricePeriodById(req.params.id);
    res.json(period);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateFuelPricePeriodHandler = async (req, res) => {
  try {
    const period = await updateFuelPricePeriod(req.params.id, req.body);
    res.json(period);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteFuelPricePeriodHandler = async (req, res) => {
  try {
    const period = await softDeleteFuelPricePeriod(req.params.id);
    res.json(period);
  } catch (error) {
    handleError(res, error);
  }
};
