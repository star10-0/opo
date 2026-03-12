import express from "express";
import { requireAuthIfEnabled } from "../middleware/accessControl.js";
import StorageTank from "../models/StorageTank.js";

const router = express.Router();

router.use(requireAuthIfEnabled);

router.post("/", async (req, res) => {
  try {
    const tank = new StorageTank(req.body);
    await tank.save();
    res.status(201).json(tank);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.get("/", async (req, res) => {
  try {
    const filter = { isDeleted: false };

    if (req.query.stationId) {
      filter.stationId = req.query.stationId;
    }

    const tanks = await StorageTank.find(filter).sort({ createdAt: -1 });
    res.json(tanks);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const tank = await StorageTank.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );

    if (!tank) {
      return res.status(404).json("Tank not found");
    }

    res.json(tank);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const tank = await StorageTank.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user?._id
      },
      { new: true }
    );

    if (!tank) {
      return res.status(404).json("Tank not found");
    }

    res.json({ message: "Tank deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

export default router;
