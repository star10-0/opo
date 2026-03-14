import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

OrganizationSchema.index({ code: 1 }, { unique: true });

export default mongoose.model("Organization", OrganizationSchema);
