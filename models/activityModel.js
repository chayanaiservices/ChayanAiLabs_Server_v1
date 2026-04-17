import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    action: String,
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teams",
    },

    meta: Object,

  },
  { timestamps: true }
);

export default mongoose.model("activities", activitySchema);