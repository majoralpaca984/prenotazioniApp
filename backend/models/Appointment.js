import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,   
  time: String,
  status: { type: String, default: "scheduled" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

export default mongoose.model("Appointment", AppointmentSchema);
