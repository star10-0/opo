import express from "express";
import DailyReport from "../models/DailyReport.js";

const router = express.Router();

router.post("/generate", async(req,res)=>{
 try{

  const report = new DailyReport(req.body);

  report.netAmount =
   report.totalSales -
   report.totalExpenses -
   report.bankPayments;

  await report.save();

  res.json(report);

 }catch(err){
  res.status(500).json({ message: err.message });
 }
});

router.get("/pending", async(req,res)=>{
 try{
   const reports = await DailyReport.find({status:"pending"})
   .populate("worker shift");
   res.json(reports);
 }catch(err){
   res.status(500).json({ message: err.message });
 }
});

router.put("/approve/:id", async(req,res)=>{
 try{

   const report = await DailyReport.findByIdAndUpdate(
     req.params.id,
     {
       status:"approved",
       approvedBy:req.body.accountant,
       approvedAt:new Date()
     },
     {new:true}
   );

   if (!report) {
     return res.status(404).json({ message: "Report not found" });
   }

   res.json(report);

 }catch(err){
   res.status(500).json({ message: err.message });
 }
});

export default router;
