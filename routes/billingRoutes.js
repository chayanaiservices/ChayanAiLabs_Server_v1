import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  getBillingStatusController,
  createOrderController,
  verifyPaymentController,
} from "../controllers/billingControllers.js";

const router = express.Router();

router.get("/status", authMiddleware, getBillingStatusController);

router.post("/create-order", authMiddleware, createOrderController);
router.post("/verify-payment", authMiddleware, verifyPaymentController);

export default router;