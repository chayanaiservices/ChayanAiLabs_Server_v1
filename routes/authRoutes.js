import express from "express";
const router = express.Router();

import {
  loginController,
  registerController,
  googleLoginController,
  googleRegisterController,
  verifyOtpController,
  resendOtpController,
} from "../controllers/authControllers.js"

router.post("/register", registerController

);
router.post("/login", loginController);

router.post("/google-login", googleLoginController);
router.post("/google-register", googleRegisterController);
router.post("/resend-otp", resendOtpController);
router.post("/verify-otp", verifyOtpController);


export default router;