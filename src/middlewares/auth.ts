import jwt from "jsonwebtoken";
import redisClient from "../config/redis";
import { HttpStatusCode } from "../constants/httpStatusCodes";
import mongoose from "mongoose";

export const verifyToken = async (req: any, res: any, next: Function) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(HttpStatusCode.UNAUTHORIZED).json({
      message: "Access token is missing.",
    });
  }

  try {
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: "Token is blacklisted.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "");
    req.user = decoded;
    if (req.user.id) {
      req.user.id = new mongoose.Types.ObjectId(req.user.id);
    }
    next();
  } catch (error: any) {
    console.log('error', error)
    if (error.name === "TokenExpiredError") {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: "Access token expired",
        reason: "expired",
      });
    }
    return res.status(HttpStatusCode.UNAUTHORIZED).json({
      message: "Invalid or expired token.",
      reason: "invalid",
    });
  }
};
