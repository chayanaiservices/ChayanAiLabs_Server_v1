import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getActivityController } from "../controllers/activityController.js";

const router = express.Router();

router.get("/", authMiddleware, getActivityController);

export default router;