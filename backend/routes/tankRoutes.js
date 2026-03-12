import express from "express";
import Tank from "../models/Tank.js";

const router = express.Router();

router.post("/", async (req,res)=>{
 try{
   const tank = new Tank(req.body);
   tank.currentLevel = tank.liters;
   await tank.save();
   res.json(tank);
 }catch(err){
   res.status(500).json(err.message);
 }
});

router.get("/", async(req,res)=>{
 try{
   const tanks = await Tank.find({ isDeleted: false }).sort({createdAt:-1});
   res.json(tanks);
 }catch(err){
   res.status(500).json({ message: err.message });
 }
});

router.put("/:id", async(req,res)=>{
 try{
   const tank = await Tank.findByIdAndUpdate(req.params.id,req.body,{new:true});
   res.json(tank);
 }catch(err){
   res.status(500).json(err.message);
 }
});

router.delete("/:id", async(req,res)=>{
 try{
   const tank = await Tank.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
   );
   if (!tank) {
    return res.status(404).json({ message: "Tank not found" });
   }
   res.json({message:"Tank deleted"});
 }catch(err){
   res.status(500).json({ message: err.message });
 }
});

export default router;
