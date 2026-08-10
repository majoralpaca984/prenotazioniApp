import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500, default: "" },
  date: { type: Date, required: true },
  time: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled",
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

AppointmentSchema.index({ user: 1, date: 1 });

export default mongoose.model("Appointment", AppointmentSchema);
