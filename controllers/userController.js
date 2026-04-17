import userModels from "../models/userModels.js";
import bcrypt from "bcrypt";
import {sendOtp} from "../utils/sendOtp.js";
import crypto from "crypto";
import teamModel from "../models/teamModels.js";
import billingModels from "../models/billingModels.js";

const otpStore = new Map();

export const getUserController = async (req, res) => {
  try {
    const user = await userModels.findById(req.user.id).select("-password");

    res.status(200).send({
      success: true,
      user,
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching user",
    });
  }
};

export const updateUserController = async (req, res) => {
  try {
    const user = await userModels.findById(req.user.id);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const { name, username, email, address, phone } = req.body;

    if (name) user.name = name;
    if (username) user.username = username;

    if (address) user.address = address;
    if (phone) user.phone = phone;

    if (email && email !== user.email) {
      user.email = email;
      user.isVerified = false;
    }

    await user.save();

    res.status(200).send({
      success: true,
      message: "User Updated Successfully",
      user,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Update User API",
    });
  }
};

export const uploadAvatarController = async (req, res) => {
  try {
    const user = await userModels.findById(req.user.id);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).send({
        success: false,
        message: "No file uploaded",
      });
    }

    user.avatar = `/uploads/${req.file.filename}`;

    await user.save();

    res.status(200).send({
      success: true,
      message: "Avatar uploaded successfully",
      avatar: user.avatar,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error uploading avatar",
    });
  }
};

export const changePasswordController = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await userModels.findById(req.user.id);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).send({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;

    await user.save();

    res.send({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error updating password",
    });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userModels.findOne({ email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Account not registered",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
      type: "reset",
    });

    await sendOtp(email, otp);

    console.log("RESET OTP:", email, otp);

    res.send({
      success: true,
      message: "OTP sent successfully",
      email,
    });

  } catch (error) {
    console.log("FORGOT PASSWORD ERROR:", error);

    res.status(500).send({
      success: false,
      message: "Error in forgot password",
    });
  }
};

export const verifyResetOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);

    if (!stored) {
      return res.status(400).send({ success: false, message: "OTP not found" });
    }
    if (stored.type !== "reset") {
      return res.status(400).send({ success: false, message: "Invalid OTP type" });
    }
    if (stored.expires < Date.now()) {
      otpStore.delete(email);
      return res.status(400).send({ success: false, message: "OTP expired" });
    }
    if (stored.otp !== otp) {
      return res.status(400).send({ success: false, message: "Invalid OTP" });
    }

    res.send({
      success: true,
      message: "OTP verified",
    });
  } catch (error) {
    res.status(500).send({ success: false });
  }
};

export const deleteUserController = async (req, res) => {
  try {
    await userModels.findByIdAndDelete(req.params.id);
    return res.status(200).send({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Delete User API",
      error: error.message,
    });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!password) {
      return res.status(400).send({
        success: false,
        message: "Password is required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModels.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    otpStore.delete(email);

    res.send({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).send({ success: false });
  }
};

export const getApiKeyController = async (req, res) => {
  try {
    const user = await userModels.findById(req.user.id);

    res.send({
      success: true,
      apiKey: user.apiKey,
    });

  } catch (error) {
    res.status(500).send({ success: false });
  }
};

export const regenerateApiKeyController = async (req, res) => {
  try {
    const newKey = crypto.randomBytes(24).toString("hex");

    const user = await userModels.findByIdAndUpdate(
      req.user.id,
      { apiKey: newKey },
      { new: true }
    );

    res.send({
      success: true,
      apiKey: user.apiKey,
    });

  } catch (error) {
    res.status(500).send({ success: false });
  }
};

export const exportUserDataController = async (req, res) => {
  try {
    console.log("EXPORT HIT:", req.user.id);

    const user = await userModels.findById(req.user.id).select("-password");

    const team = await teamModel.findOne({ "members.user": req.user.id });
    const billing = await billingModels.findOne({ user: req.user.id });

    res.send({
      success: true,
      data: {
        user,
        team,
        billing,
      },
    });

  } catch (error) {
    console.log("❌ EXPORT ERROR FULL:", error);
    res.status(500).send({
      success: false,
      message: "Export failed",
    });
  }
};

export const deleteAccountController = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModels.findById(userId);

    const team = await teamModel.findOne({ "members.user": userId });

    if (team) {
      if (team.owner.toString() === userId) {
        await teamModel.findByIdAndDelete(team._id);
      } else {
        team.members = team.members.filter(
          (m) => m.user.toString() !== userId
        );
        await team.save();
      }
    }

    await billingModels.deleteOne({ user: userId });

    await userModels.findByIdAndDelete(userId);

    res.send({
      success: true,
      message: "Account deleted",
    });

  } catch (error) {
    console.log("DELETE ERROR:", error);
    res.status(500).send({ success: false });
  }
};

