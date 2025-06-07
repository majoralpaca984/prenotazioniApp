import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  speciality: { type: String, required: true },
  image: String,
  availability: [String], // Array di stringhe per le disponibilità, es. ["2023-10-01", "2023-10-02"]
});

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
