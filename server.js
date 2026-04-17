import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";


import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import integrationRoutes from "./routes/integrationRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";


connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use(
  helmet({
    crossOriginResourcePolicy: false,

    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        connectSrc: [
          "'self'",
          "http://localhost:8080",
          "ws://localhost:8080",
        ],

        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "http://localhost:8080",
        ],

        "script-src": ["'self'", "'unsafe-inline'", "https://translate.google.com"],
        "frame-src": ["https://translate.google.com"],
      },
    },
  })
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/uploads", express.static("uploads"));
app.use("/api/v1/billing", billingRoutes);
app.use("/api/v1/team", teamRoutes);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1/integrations", integrationRoutes);
app.use("/api/v1/activity", activityRoutes);
app.use("/api/v1/support", supportRoutes);

app.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "ChayanAI Server is Running",
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});