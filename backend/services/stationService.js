import Station from "../models/Station.js";
import User from "../models/User.js";
import StorageTank from "../models/StorageTank.js";
import Pump from "../models/Pump.js";

const canViewAllStations = (user) => {
  if (!user) return true;
  return ["admin", "manager"].includes(user.role) || Array.isArray(user.permissions) && user.permissions.includes("view_all_stations");
};

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

export const listStationsForUser = async (user) => {
  const totalStations = await Station.countDocuments({ isDeleted: false });

  if (canViewAllStations(user)) {
    const items = await Station.find({ isDeleted: false }).sort({ name: 1, createdAt: -1 });
    return { items, meta: { totalStations, hasAccess: items.length > 0 } };
  }

  const allowedIds = normalizeArray(user?.stationAccess)
    .map((id) => String(id))
    .filter(Boolean);

  if (!allowedIds.length) {
    return { items: [], meta: { totalStations, hasAccess: false } };
  }

  const items = await Station.find({ _id: { $in: allowedIds }, isDeleted: false }).sort({ name: 1, createdAt: -1 });
  return { items, meta: { totalStations, hasAccess: items.length > 0 } };
};

const normalizeStationPayload = (payload = {}) => ({
  name: payload.name,
  code: payload.code,
  address: payload.address,
  phone: payload.phone,
  status: payload.status,
  defaultDayOpenTime: payload.defaultDayOpenTime,
  timezone: payload.timezone,
});

export const createStationForUser = async (payload = {}, user) => {
  const station = await Station.create(normalizeStationPayload(payload));

  if (user?._id) {
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { stationAccess: station._id }
    });
  }

  return station;
};

const normalizeFuelType = (value) => (["diesel", "gasoline", "kerosene"].includes(value) ? value : "diesel");

export const bootstrapStation = async (payload = {}, user) => {
  const station = await createStationForUser(payload, user);

  const initialTanks = normalizeArray(payload.initialTanks).slice(0, 10);
  const initialPumps = normalizeArray(payload.initialPumps).slice(0, 20);

  const tanksToCreate = initialTanks
    .filter((tank) => tank?.tankName && tank?.tankCode)
    .map((tank) => ({
      stationId: station._id,
      tankName: tank.tankName,
      tankCode: tank.tankCode,
      fuelType: normalizeFuelType(tank.fuelType),
      capacityLiters: Number(tank.capacityLiters || 0),
      currentQuantityLiters: Number(tank.currentQuantityLiters || 0),
      lowLevelThreshold: Number(tank.lowLevelThreshold || 0),
      status: tank.status || "active",
    }));

  const createdTanks = tanksToCreate.length ? await StorageTank.insertMany(tanksToCreate, { ordered: false }) : [];

  const pumpsToCreate = initialPumps
    .filter((pump) => pump?.pumpName && pump?.pumpCode)
    .map((pump) => ({
      stationId: station._id,
      pumpName: pump.pumpName,
      pumpCode: pump.pumpCode,
      fuelType: normalizeFuelType(pump.fuelType),
      linkedTankIds: normalizeArray(pump.linkedTankIds),
      meterUnit: pump.meterUnit || "liter",
      isActive: pump.isActive ?? true,
      openingLockEnabled: pump.openingLockEnabled ?? true,
    }));

  const createdPumps = pumpsToCreate.length ? await Pump.insertMany(pumpsToCreate, { ordered: false }) : [];

  return {
    station,
    bootstrap: {
      tanksCreated: createdTanks.length,
      pumpsCreated: createdPumps.length,
    }
  };
};
