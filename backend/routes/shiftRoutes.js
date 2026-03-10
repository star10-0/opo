import express from "express";
import Shift from "../models/Shift.js";

const router = express.Router();

router.post("/start", async(req,res)=>{
 try{

  const shift = new Shift({
   worker:req.body.worker,
   date:req.body.date,
   startTime:new Date(),
   status:"open"
  });

  await shift.save();

  res.json(shift);

 }catch(err){
  res.status(500).json(err.message);
 }
});

router.post("/close/:id", async(req,res)=>{
 try{

  const shift = await Shift.findByIdAndUpdate(
    req.params.id,
    {
      endTime:new Date(),
      status:"closed"
    },
    {new:true}
  );

  res.json(shift);

 }catch(err){
  res.status(500).json(err.message);
 }
});

router.get("/", async(req,res)=>{
 try{
  const shifts = await Shift.find().populate("worker");
  res.json(shifts);
 }catch(err){
  res.status(500).json(err.message);
 }
});

export default router;