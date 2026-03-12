import {
  createPump,
  listPumps,
  getPumpById,
  updatePump,
  softDeletePump,
} from "../services/pumpService.js";

const handleError = (res, error) => {
  res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal server error" });
};

export const createPumpHandler = async (req, res) => {
  try {
    const pump = await createPump(req.body);
    res.status(201).json(pump);
  } catch (error) {
    handleError(res, error);
  }
};

export const listPumpsHandler = async (req, res) => {
  try {
    const pumps = await listPumps(req.query);
    res.json(pumps);
  } catch (error) {
    handleError(res, error);
  }
};

export const getPumpByIdHandler = async (req, res) => {
  try {
    const pump = await getPumpById(req.params.id);
    res.json(pump);
  } catch (error) {
    handleError(res, error);
  }
};

export const updatePumpHandler = async (req, res) => {
  try {
    const pump = await updatePump(req.params.id, req.body);
    res.json(pump);
  } catch (error) {
    handleError(res, error);
  }
};

export const deletePumpHandler = async (req, res) => {
  try {
    const pump = await softDeletePump(req.params.id);
    res.json(pump);
  } catch (error) {
    handleError(res, error);
  }
};
