import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import teamMiddleware from "../middlewares/teamMiddleware.js";

import {
  createProjectController,
  getProjectsController,
  getSingleProjectController,
  updateProjectController,
  deleteProjectController,
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/create", authMiddleware, teamMiddleware, createProjectController);

router.get("/all", authMiddleware, teamMiddleware, getProjectsController);

router.get("/:id", authMiddleware, teamMiddleware, getSingleProjectController);

router.put("/:id", authMiddleware, teamMiddleware, updateProjectController);

router.delete("/:id", authMiddleware, teamMiddleware, deleteProjectController);

export default router;