import mongoose from "mongoose";

const ShiftSchema = new mongoose.Schema({
  stationId: { type: mongoose.Schema.Types.ObjectId, ref:"Station" },
  worker: { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  date: { type:String, required:true },
  startTime: { type:String },
  endTime: { type:String },
  status: { type:String, enum:["open","closed"], default:"open" },
  notifications: [{ type:String }]
},{timestamps:true});

export default mongoose.model("Shift", ShiftSchema);
