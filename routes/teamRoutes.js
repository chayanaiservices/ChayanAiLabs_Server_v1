import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  createTeamController,
  joinTeamController,
  getMyTeamController,
  inviteMemberController,
  removeMemberController,
  changeRoleController,
  leaveTeamController,
} from "../controllers/teamController.js";

const router = express.Router();

router.post("/create", authMiddleware, createTeamController);
router.post("/join", authMiddleware, joinTeamController);
router.get("/my-team", authMiddleware, getMyTeamController);
router.post("/invite", authMiddleware, inviteMemberController);
router.post("/remove-member", authMiddleware, removeMemberController);
router.post("/change-role", authMiddleware, changeRoleController);
router.post("/leave", authMiddleware, leaveTeamController);

export default router;