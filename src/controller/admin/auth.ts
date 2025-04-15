import { Request, Response } from "express";
import { HttpStatusCode } from "../../constants/httpStatusCodes";
import { StatusMessage } from "../../constants/responseMessages";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AdminModel } from "../../models/Admin";

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    console.log("body", req.body);
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

    // access token
    const accessToken = jwt.sign(
      { id: admin?._id, email: admin?.email },
      process.env.JWT_SECRET || "",
      { expiresIn: "1d" }
    );

    res.status(HttpStatusCode.OK).json({
      message: "Login successful.",
      data: admin,
      accessToken,
    });
  } catch (error) {
    console.log("Error in login:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
    });
  }
};
