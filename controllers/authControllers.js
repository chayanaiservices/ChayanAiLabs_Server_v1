import userModels from "../models/userModels.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import {sendOtp} from "../utils/sendOtp.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const otpStore = new Map();

const googleRegisterController = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();

    const existingUser = await userModels.findOne({ email });

    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "User already exists. Please login.",
      });
    }

    const existingOtp = otpStore.get(email);

    if (existingOtp && existingOtp.expires > Date.now()) {
      return res.send({
        success: true,
        message: "OTP already sent. Please check your email.",
        email,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, {
      otp,
      type: "register",
      data: {
        username: name,
        email,
        password: Math.random().toString(36),
        phone: "",
        avatar: picture,
      },
      expires: Date.now() + 5 * 60 * 1000,
    });

    await sendOtp(email, otp);

    return res.send({
      success: true,
      message: "OTP sent",
      email,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Google register failed",
    });
  }
};

const registerController = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    const existingUser = await userModels.findOne({ email });

    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "User already exists. Please login.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, {
      otp,
      type: "register",
      data: { username, email, password, phone },
      expires: Date.now() + 5 * 60 * 1000,
    });

    await sendOtp(email, otp);

    res.send({
      success: true,
      message: "OTP sent",
      email,
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error sending OTP",
    });
  }
};


const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("VERIFY REQUEST:", email, otp);

    const stored = otpStore.get(email);

    console.log("OTP STORE:", stored);

    if (!stored) {
      return res.status(400).send({
        success: false,
        message: "OTP not found. Please register again.",
      });
    }

    if (stored.expires < Date.now()) {
      otpStore.delete(email);
      return res.status(400).send({
        success: false,
        message: "OTP expired",
      });
    }

    if (stored.otp !== otp) {
      return res.status(400).send({
        success: false,
        message: "Invalid OTP",
      });
    }

    const existingUser = await userModels.findOne({ email });

    if (existingUser) {
      otpStore.delete(email);

      return res.send({
        success: true,
        message: "Account already verified. Please login.",
      });
    }

    const { username, password, phone, avatar } = stored.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModels.create({
      username,
      email,
      password: hashedPassword,
      phone,
      profile: avatar,
    });

    otpStore.delete(email);

    return res.send({
      success: true,
      message: "Account created successfully",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "OTP verification failed",
    });
  }
};

const resendOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    const stored = otpStore.get(email);

    if (!stored) {
      return res.status(400).send({
        success: false,
        message: "Session expired. Please register again.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, {
      ...stored,
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    });

    await sendOtp(email, otp);

    res.send({
      success: true,
      message: "OTP resent successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModels.findOne({ email });

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.send({
      success: true,
      accessToken,
      refreshToken,
      user,
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Login failed",
    });
  }
};

const googleLoginController = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email } = ticket.getPayload();

    const user = await userModels.findOne({ email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not registered. Please sign up first.",
      });
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.send({
      success: true,
      user,
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.log("GOOGLE LOGIN ERROR:", error);

    res.status(500).send({
      success: false,
      message: "Google login failed",
    });
  }
};


export const refreshTokenController = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).send({ success: false });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.send({
      success: true,
      accessToken: newAccessToken,
    });

  } catch {
    res.status(401).send({ success: false });
  }
};

export {
  loginController,
  googleLoginController,
  googleRegisterController,
  verifyOtpController,
  registerController,
  resendOtpController,
};