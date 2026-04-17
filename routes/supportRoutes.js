import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { createTicketController, getAllTicketsController } from "../controllers/supportController.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.post("/ticket", authMiddleware, createTicketController);
router.get("/all", authMiddleware, adminMiddleware, getAllTicketsController);

export default router;