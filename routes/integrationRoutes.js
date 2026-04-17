import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  connectIntegrationController,
  disconnectIntegrationController,
} from "../controllers/integrationController.js";

const router = express.Router();

router.post("/connect", authMiddleware, connectIntegrationController);
router.post("/disconnect", authMiddleware, disconnectIntegrationController);

export default router;