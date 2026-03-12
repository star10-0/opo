import mongoose from "mongoose";

const DailyReportSchema = new mongoose.Schema({
  stationId: { type: mongoose.Schema.Types.ObjectId, ref:"Station" },
  worker: { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  shift: { type: mongoose.Schema.Types.ObjectId, ref:"Shift" },
  date: { type:String, required:true },
  totalLiters: { type:Number },
  totalSales: { type:Number },
  totalExpenses: { type:Number, default:0 },
  bankPayments: { type:Number, default:0 },
  netAmount: { type:Number },
  status: { type:String, enum:["pending","approved","archived"], default:"pending" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref:"User" },
  approvedAt: { type:Date }
},{timestamps:true});

export default mongoose.model("DailyReport", DailyReportSchema);
