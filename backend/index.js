// index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";

import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressoRoute from "./routes/courseProgress.route.js";

connectDB();

const app = express();
const PORT = process.env.PORT || 8000;
const CLIENT_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Normal JSON parsing for all non-webhook routes
app.use(express.json());

// Cookies & CORS (after body-parser)
app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// Mount routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressoRoute);

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});