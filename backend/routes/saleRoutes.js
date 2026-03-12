import express from "express";
import Sale from "../models/Sale.js";
import Tank from "../models/Tank.js";

const router = express.Router();

router.post("/", async(req,res)=>{
 try{

  const sale = new Sale(req.body);
  sale.total = sale.liters * sale.pricePerLiter;

  await sale.save();

  const tank = await Tank.findById(sale.tank);
  if (!tank || tank.isDeleted) {
    return res.status(404).json({ message: "Tank not found" });
  }
  tank.currentLevel -= sale.liters;

  if(tank.currentLevel < 0){
    tank.currentLevel = 0;
  }

  await tank.save();

  res.json(sale);

 }catch(err){
  res.status(500).json({ message: err.message });
 }
});

router.get("/", async(req,res)=>{
 try{
   const sales = await Sale.find().populate("tank worker shift");
   res.json(sales);
 }catch(err){
   res.status(500).json({ message: err.message });
 }
});

export default router;
