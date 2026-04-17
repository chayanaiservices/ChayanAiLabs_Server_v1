import mongoose from "mongoose";
import crypto from "crypto";

//schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is Required"]
  },
  email: {
    type: String,
    required: [true, "Email is Required"],
    unique: true
  },
  password: {
    type: String,
    required: [true, "Password is Required"]
  },
  phone: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "../Asset/default.jpg",
  },
  teamId: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "Member",
    enum: ["Member", "Admin", "Owner"]
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },
  integrations: {
    googleDrive: {
      connected: { type: Boolean, default: false },
      email: String,
    },
    apiKey: {
      type: String,
      default: () => crypto.randomBytes(24).toString("hex"),
    },
  },
}, { timestamps: true }
);


//export

export default mongoose.model('User', userSchema)

