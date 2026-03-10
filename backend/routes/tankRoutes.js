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
   const tanks = await Tank.find().sort({createdAt:-1});
   res.json(tanks);
 }catch(err){
   res.status(500).json(err.message);
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
   await Tank.findByIdAndDelete(req.params.id);
   res.json({message:"Tank deleted"});
 }catch(err){
   res.status(500).json(err.message);
 }
});

export default router;