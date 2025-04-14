import dotenv from "dotenv";
dotenv.config();
import express from "express";
import userRoutes from "./routes/user";
import cors from "cors";
import connectDB from "./config/database";

const app = express();
const PORT = process.env.PORT || 3000;

connectDB()

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_API,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/", userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
