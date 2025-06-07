// backend/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Doctor from "./models/Doctor.js";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

const seedDoctors = [
  {
    name: "Dr. Maria Rossi",
    speciality: "Ecografia",
    image: "/assets/dott.sa.jpg",
    availability: ["10 Giugno", "12 Giugno", "14 Giugno"]
  },
  {
    name: "Dr. Marco Bianchi",
    speciality: "Radiologia",
    image: "https://via.placeholder.com/300x200?text=Dr+Bianchi",
    availability: ["11 Giugno", "13 Giugno", "15 Giugno"]
  },
  {
    name: "Dr. Lucia Verdi",
    speciality: "Cardiologia",
    image: "https://via.placeholder.com/300x200?text=Dr+Verdi",
    availability: ["10 Giugno", "17 Giugno"]
  },
  {
  name: "Dr. Giulia Neri",
  speciality: "Ginecologia",
  image: "https://via.placeholder.com/300x200?text=Dr+Neri",
  availability: ["17 Giugno", "18 Giugno"]
},
{
  name: "Dr. Paolo Ricci",
  speciality: "Cardiologia",
  image: "https://via.placeholder.com/300x200?text=Dr+Ricci",
  availability: ["19 Giugno", "21 Giugno"]
}

];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    await Doctor.deleteMany(); 
    await Doctor.insertMany(seedDoctors);
    console.log("✅ Medici inseriti con successo!");
    process.exit();
  } catch (error) {
    console.error("❌ Errore nel seed:", error);
    process.exit(1);
  }
};




seedDB();
