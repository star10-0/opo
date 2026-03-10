import mongoose from "mongoose";

const TankSchema = new mongoose.Schema({
  driver: { type:String, required:true },
  tankNumber: { type:String, required:true },
  date: { type:String, required:true },
  fuelType: { type:String, enum:["diesel","gasoline","kerosene"], required:true },
  liters: { type:Number, required:true },
  arrivalTime: { type:Date },
  unloadTime: { type:Date },
  worker: { type:String },
  currentLevel: { type:Number, default:0 }
},{timestamps:true});

export default mongoose.model("Tank", TankSchema);
