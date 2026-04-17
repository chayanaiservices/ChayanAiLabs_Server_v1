import crypto from "crypto";
import billingmodels from "../models/billingModels.js";
import Razorpay from "razorpay";

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export const createOrderController = async (req, res) => {
  try {
    const { plan } = req.body;
    const razorpay = getRazorpayInstance();

    const priceMap = {
      starter: 149900,
      growth: 399900,
      scale: 899900,
    };

    const options = {
      amount: priceMap[plan],
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.send({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
    await logActivity({
      action: "Upgraded plan",
      userId: req.user.id,
      teamId: req.user.team,
      meta: { plan },
    });

  } catch (error) {
    console.log("ORDER ERROR:", error);
    res.status(500).send({ success: false });
  }

};

export const verifyPaymentController = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).send({
        success: false,
        message: "Invalid signature",
      });
    }

    await billingmodels.findOneAndUpdate(
      { user: req.user.id },
      {
        plan,
        status: "active",
      },
      { upsert: true, new: true }
    );

    res.send({
      success: true,
      message: "Payment verified",
    });

  } catch (error) {
    console.log("VERIFY ERROR:", error);
    res.status(500).send({ success: false });
  }
};

import userModel from "../models/userModels.js";

export const getBillingStatusController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id || req.user._id);

    if (user.role === "Owner") {
      return res.send({
        success: true,
        plan: "scale",
        status: "active",
      });
    }

    const sub = await billingmodels.findOne({
      user: user._id,
    });

    if (!sub) {
      return res.send({
        success: true,
        plan: "free",
        status: "inactive",
      });
    }

    res.send({
      success: true,
      plan: sub.plan,
      status: sub.status,
    });

  } catch (error) {
    res.status(500).send({ success: false });
  }
};