import { Request, Response } from "express";
import { HttpStatusCode } from "../../constants/httpStatusCodes";
import { StatusMessage } from "../../constants/responseMessages";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AdminModel } from "../../models/Admin";

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: StatusMessage.BAD_REQUEST,
      });
    }

    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        message: "Admin not found.",
      });
    } else {
      if (!admin.isAdmin) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({
          message: "Unauthorized access.",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({
          message: "Invalid password.",
        });
      }
    }

    const accessToken = jwt.sign(
      { id: admin?._id, email: admin?.email },
      process.env.JWT_ACCESS_SECRET || "",
      { expiresIn: "1d" }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: admin?._id, email: admin?.email },
      process.env.JWT_REFRESH_SECRET || "",
      { expiresIn: "7d" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(HttpStatusCode.OK).json({
      message: "Login successful.",
      data: admin,
    });
  } catch (error) {
    console.log("Error in login:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
    });
  }
};
