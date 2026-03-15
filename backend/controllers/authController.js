import { getCurrentUser, loginUser, registerUser, selectCurrentStation } from "../services/authService.js";

export async function registerHandler(req, res, next) {
  try {
    const data = await registerUser(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(req, res, next) {
  try {
    const data = await loginUser(req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function meHandler(req, res, next) {
  try {
    const data = await getCurrentUser(req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function selectStationHandler(req, res, next) {
  try {
    const data = await selectCurrentStation(req.user._id, req.body.stationId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
