import billingModels from "../models/billingModels.js";

export const getUserPlan = async (userId) => {
  const sub = await billingModels.findOne({ user: userId });

  if (!sub || sub.status !== "active") {
    return "starter";
  }

  return sub.plan;
};