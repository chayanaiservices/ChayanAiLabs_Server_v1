import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("MONGO URL:", process.env.MONGO_URL);

    await mongoose.connect(process.env.MONGO_URL);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.log("❌ DB Error", error);
    process.exit(1);
  }
  
};

export default connectDB;