import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  role: {
    type: String,
    enum: ["admin", "member"],
    default: "member",
  },
});

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    teamId: {
      type: String,
      unique: true,
    },

    members: [memberSchema],
  },
  { timestamps: true }
);

export default mongoose.model("teams", teamSchema);