import {
  openOperationalDay,
  closeOperationalDay,
  listOperationalDays,
  getOperationalDayById,
  updateOperationalDay,
  softDeleteOperationalDay,
} from "../services/operationalDayService.js";

const handleError = (res, error) => {
  res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal server error" });
};

export const openOperationalDayHandler = async (req, res) => {
  try {
    const day = await openOperationalDay(req.body);
    res.status(201).json(day);
  } catch (error) {
    handleError(res, error);
  }
};

export const closeOperationalDayHandler = async (req, res) => {
  try {
    const day = await closeOperationalDay(req.params.id);
    res.json(day);
  } catch (error) {
    handleError(res, error);
  }
};

export const listOperationalDaysHandler = async (req, res) => {
  try {
    const days = await listOperationalDays(req.query);

    if (req.path === "/current") {
      const current = Array.isArray(days) ? days.find((d) => d.status === "open") || null : null;
      return res.json(current);
    }

    res.json(days);
  } catch (error) {
    handleError(res, error);
  }
};

export const getOperationalDayByIdHandler = async (req, res) => {
  try {
    const day = await getOperationalDayById(req.params.id);
    res.json(day);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateOperationalDayHandler = async (req, res) => {
  try {
    const day = await updateOperationalDay(req.params.id, req.body);
    res.json(day);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteOperationalDayHandler = async (req, res) => {
  try {
    const day = await softDeleteOperationalDay(req.params.id);
    res.json(day);
  } catch (error) {
    handleError(res, error);
  }
};
