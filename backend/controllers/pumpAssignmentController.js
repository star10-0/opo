import {
  createPumpAssignment,
  lockPumpAssignmentOpening,
  closePumpAssignment,
  listPumpAssignments,
  getPumpAssignmentById,
  updatePumpAssignment,
  softDeletePumpAssignment,
} from "../services/pumpAssignmentService.js";

const handleError = (res, error) => {
  res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
};

export const createPumpAssignmentHandler = async (req, res) => {
  try {
    const assignment = await createPumpAssignment(req.body);
    res.status(201).json(assignment);
  } catch (error) {
    handleError(res, error);
  }
};

export const lockPumpAssignmentOpeningHandler = async (req, res) => {
  try {
    const assignment = await lockPumpAssignmentOpening(req.params.id);
    res.json(assignment);
  } catch (error) {
    handleError(res, error);
  }
};

export const closePumpAssignmentHandler = async (req, res) => {
  try {
    const assignment = await closePumpAssignment(req.params.id, req.body);
    res.json(assignment);
  } catch (error) {
    handleError(res, error);
  }
};

export const listPumpAssignmentsHandler = async (req, res) => {
  try {
    const assignments = await listPumpAssignments(req.query);
    res.json(assignments);
  } catch (error) {
    handleError(res, error);
  }
};

export const getPumpAssignmentByIdHandler = async (req, res) => {
  try {
    const assignment = await getPumpAssignmentById(req.params.id);
    res.json(assignment);
  } catch (error) {
    handleError(res, error);
  }
};

export const updatePumpAssignmentHandler = async (req, res) => {
  try {
    const assignment = await updatePumpAssignment(req.params.id, req.body);
    res.json(assignment);
  } catch (error) {
    handleError(res, error);
  }
};

export const deletePumpAssignmentHandler = async (req, res) => {
  try {
    const assignment = await softDeletePumpAssignment(req.params.id);
    res.json(assignment);
  } catch (error) {
    handleError(res, error);
  }
};
