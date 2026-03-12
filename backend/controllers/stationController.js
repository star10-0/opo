import Station from "../models/Station.js";

export async function listStations(req, res, next) {
  try {
    const stations = await Station.find({ isDeleted: false }).sort({ name: 1, createdAt: -1 });
    res.json({ success: true, data: stations });
  } catch (error) {
    next(error);
  }
}

export async function createStation(req, res, next) {
  try {
    const created = await Station.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
}
