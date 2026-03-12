import {
  createMeterReading,
  listMeterReadings,
  getMeterReadingById,
  updateMeterReading,
  softDeleteMeterReading,
} from "../services/meterReadingService.js";

const handleError = (res, error) => {
  res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
};

export const createMeterReadingHandler = async (req, res) => {
  try {
    const reading = await createMeterReading(req.body);
    res.status(201).json(reading);
  } catch (error) {
    handleError(res, error);
  }
};

export const listMeterReadingsHandler = async (req, res) => {
  try {
    const readings = await listMeterReadings(req.query);
    res.json(readings);
  } catch (error) {
    handleError(res, error);
  }
};

export const getMeterReadingByIdHandler = async (req, res) => {
  try {
    const reading = await getMeterReadingById(req.params.id);
    res.json(reading);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateMeterReadingHandler = async (req, res) => {
  try {
    const reading = await updateMeterReading(req.params.id, req.body);
    res.json(reading);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteMeterReadingHandler = async (req, res) => {
  try {
    const reading = await softDeleteMeterReading(req.params.id);
    res.json(reading);
  } catch (error) {
    handleError(res, error);
  }
};
