import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    plan: {
      type: String,
      enum: ["starter", "growth", "scale"],
      default: "starter",
    },

    stripeCustomerId: String,
    stripeSubscriptionId: String,

    status: {
      type: String,
      enum: ["active", "inactive", "cancelled"],
      default: "inactive",
    },

    currentPeriodEnd: Date,
  },
  { timestamps: true }
);

export default mongoose.model("subscriptions", subscriptionSchema);