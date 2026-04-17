import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    email: String,
    subject: String,
    message: String,

    status: {
      type: String,
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.model("support", supportSchema);