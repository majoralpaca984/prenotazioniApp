// backend/routes/appointments.js
import express from "express";
import { getAppointments, createAppointment, getAppointmentById, updateAppointment, deleteAppointment} from "../controllers/appointmentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAppointments);
router.post("/", authMiddleware, createAppointment);
router.get("/:id", authMiddleware, getAppointmentById);
router.put("/:id", authMiddleware, updateAppointment);
router.delete("/:id", authMiddleware, deleteAppointment);

export default router;
