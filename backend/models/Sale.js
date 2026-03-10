import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema({
  tank: { type:mongoose.Schema.Types.ObjectId, ref:"Tank", required:true },
  worker: { type:mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  shift: { type:mongoose.Schema.Types.ObjectId, ref:"Shift" },
  date: { type:String, required:true },
  fuelType: { type:String },
  liters: { type:Number, required:true },
  pricePerLiter: { type:Number },
  total: { type:Number }
},{timestamps:true});

export default mongoose.model("Sale", SaleSchema);
