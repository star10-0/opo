import { bootstrapStation, createStationForUser, getStationCustomization, listStationsForUser, updateStationCustomization } from "../services/stationService.js";

export async function listStations(req, res, next) {
  try {
    const data = await listStationsForUser(req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function listAllowedStations(req, res, next) {
  try {
    const data = await listStationsForUser(req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createStation(req, res, next) {
  try {
    const created = await createStationForUser(req.body, req.user);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
}

export async function bootstrapStationHandler(req, res, next) {
  try {
    const result = await bootstrapStation(req.body, req.user);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}


export async function getStationCustomizationHandler(req, res, next) {
  try {
    const data = await getStationCustomization(req.params.stationId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateStationCustomizationHandler(req, res, next) {
  try {
    const data = await updateStationCustomization(req.params.stationId, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
