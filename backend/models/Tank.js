import mongoose from "mongoose";

const TankSchema = new mongoose.Schema({
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station" },
  driver: { type:String, required:true },
  tankNumber: { type:String, required:true },
  date: { type:String, required:true },
  fuelType: { type:String, enum:["diesel","gasoline","kerosene"], required:true },
  liters: { type:Number, required:true },
  arrivalTime: { type:Date },
  unloadTime: { type:Date },
  worker: { type:String },
  currentLevel: { type:Number, default:0 },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
},{timestamps:true});

export default mongoose.model("Tank", TankSchema);
