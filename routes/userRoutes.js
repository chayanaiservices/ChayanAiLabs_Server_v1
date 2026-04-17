import express from "express";
import multer from "multer";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

import {
  getUserController,
  updateUserController,
  resetPasswordController,
  forgotPasswordController,
  verifyResetOtpController,
  uploadAvatarController,
  changePasswordController,
  getApiKeyController,
  regenerateApiKeyController,
  exportUserDataController,
  deleteAccountController,

} from "../controllers/userController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/getUser", authMiddleware, getUserController);

router.put("/updateUser", authMiddleware, updateUserController);
router.post("/upload-avatar", authMiddleware, upload.single("avatar"), uploadAvatarController);
router.post("/forgot-password", forgotPasswordController);
router.post("/verify-reset-otp", verifyResetOtpController); 
router.post("/reset-password", resetPasswordController);
router.post("/change-password", authMiddleware, changePasswordController);

router.get("/api-key", authMiddleware, getApiKeyController);
router.post("/regenerate-api-key", authMiddleware, regenerateApiKeyController);

router.post("/export", authMiddleware, exportUserDataController);
router.delete("/delete", authMiddleware, deleteAccountController);


export default router;