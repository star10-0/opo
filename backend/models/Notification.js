import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  targetRole: { type:String, enum:["worker","accountant","admin"], required:true },
  message: { type:String, required:true },
  seen: { type:Boolean, default:false },
  date: { type:Date, default:Date.now }
});

export default mongoose.model("Notification", NotificationSchema);