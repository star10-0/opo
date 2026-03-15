import { getCurrentUser, loginUser, registerUser, selectCurrentStation } from "../services/authService.js";

const isDev = process.env.NODE_ENV !== "production";

const logControllerFailure = (scope, error, safeBody = {}) => {
  if (!isDev) return;
  console.error(`[auth-controller:${scope}]`, {
    message: error?.message,
    statusCode: error?.statusCode || error?.status || 500,
    details: error?.details || null,
    body: safeBody,
  });
};

export async function registerHandler(req, res, next) {
  try {
    const data = await registerUser(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    logControllerFailure("register", error, {
      email: req.body?.email,
      accountType: req.body?.accountType,
    });
    next(error);
  }
}

export async function loginHandler(req, res, next) {
  try {
    const data = await loginUser(req.body);
    res.json({ success: true, data });
  } catch (error) {
    logControllerFailure("login", error, {
      email: req.body?.email,
      accountType: req.body?.accountType,
    });
    next(error);
  }
}

export async function meHandler(req, res, next) {
  try {
    const data = await getCurrentUser(req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    logControllerFailure("me", error, { userId: req.user?._id });
    next(error);
  }
}

export async function selectStationHandler(req, res, next) {
  try {
    const data = await selectCurrentStation(req.user._id, req.body.stationId);
    res.json({ success: true, data });
  } catch (error) {
    logControllerFailure("select-station", error, {
      userId: req.user?._id,
      stationId: req.body?.stationId,
    });
    next(error);
  }
}
