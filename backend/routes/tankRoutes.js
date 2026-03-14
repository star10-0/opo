import express from "express";
import StorageTank from "../models/StorageTank.js";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";

const router = express.Router();

router.post("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), async (req, res) => {
  try {
    if (!req.body?.stationId) {
      return res.status(400).json({ success: false, message: "stationId is required" });
    }

    const tank = new StorageTank(req.body);
    await tank.save();
    res.status(201).json({ success: true, data: tank });
  } catch (err) {
    res.status(500).json({ success: false, message: "حدث خطأ داخلي غير متوقع" });
  }
});

router.get("/", requireAuthIfEnabled, async (req, res) => {
  try {
    const filter = { isDeleted: false };

    if (req.query.stationId) {
      filter.stationId = req.query.stationId;
    }

    const tanks = await StorageTank.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: tanks });
  } catch (err) {
    res.status(500).json({ success: false, message: "حدث خطأ داخلي غير متوقع" });
  }
});

router.put("/:id", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant"]), async (req, res) => {
  try {
    const tank = await StorageTank.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );

    if (!tank) {
      return res.status(404).json({ success: false, message: "Tank not found" });
    }

    res.json({ success: true, data: tank });
  } catch (err) {
    res.status(500).json({ success: false, message: "حدث خطأ داخلي غير متوقع" });
  }
});

router.delete("/:id", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), async (req, res) => {
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
      return res.status(404).json({ success: false, message: "Tank not found" });
    }

    res.json({ success: true, message: "Tank deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "حدث خطأ داخلي غير متوقع" });
  }
});

export default router;
