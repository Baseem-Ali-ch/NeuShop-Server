import dotenv from "dotenv";
import path from "path";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user";
import cors from "cors";
import connectDB from "./config/database";
import adminRoutes from "./routes/admin";
import sharedRouter from "./routes/shared";

const app = express();
const PORT = process.env.PORT || 3000;

connectDB()

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use(
  cors({
    origin: process.env.FRONTEND_API,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/", userRoutes);
app.use('/shared', sharedRouter)
app.use("/admin", adminRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
