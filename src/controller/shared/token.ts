import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import redisClient from "../../config/redis";
import { HttpStatusCode } from "../../constants/httpStatusCodes";

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<any> => {
  const refreshToken = req.cookies.userRefreshToken;

  if (!refreshToken) {
    return res.status(HttpStatusCode.UNAUTHORIZED).json({
      message: "Refresh token is missing",
      reason: "no-refresh-token",
    });
  }

  try {
    const decoded: any = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || ""
    );
    const { id, email } = decoded;

    const isBlacklisted = await redisClient.get(`blacklist:${refreshToken}`);
    if (isBlacklisted) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: "Refresh token is blacklisted",
        reason: "blacklisted",
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id, email },
      process.env.JWT_ACCESS_SECRET || "",
      { expiresIn: "1h" }
    );

    // Set new access token in cookie
    res.cookie("userAccessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ message: "Token refreshed successfully" });
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: "Refresh token expired",
        reason: "refresh-expired",
      });
    }
    return res.status(HttpStatusCode.UNAUTHORIZED).json({
      message: "Invalid refresh token",
      reason: "invalid-refresh",
    });
  }
};
