import { Request, Response } from "express";
import { HttpStatusCode } from "../../constants/httpStatusCodes";
import { StatusMessage } from "../../constants/responseMessages";
import { IUser } from "../../interfaces/IUser";
import bcrypt from "bcrypt";
import { transporter } from "../../config/nodemailer";
import jwt from "jsonwebtoken";
import { UserModel } from "../../models/User";

interface UserStore {
  [email: string]: {
    otp: number;
    userData: Partial<IUser>;
  };
}

let userStore: UserStore = {};

const sendOTPEmail = (email: string, otp: number) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP Verification",
    html: `<p>OTP Verification from Furnspace website. Please verify your OTP and enjoy your shop.</p>
           <p>Your OTP for verification is: <strong>${otp}</strong></p>`,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("Email sent: " + info.response);
        resolve(info.response);
      }
    });
  });
};

// Register user
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: StatusMessage.BAD_REQUEST,
      });
    }

    const securePassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log("Generated OTP:", otp);

    userStore[email] = {
      otp,
      userData: {
        firstName,
        lastName,
        email,
        password: securePassword,
        isActive: true,
      },
    };

    await sendOTPEmail(email, otp);

    res.status(HttpStatusCode.CREATED).json({
      message: StatusMessage.CREATED,
      data: { firstName, lastName, email },
    });
  } catch (error) {
    console.log("Error in register:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

// Verify OTP
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, verificationCode } = req.body;
    if (!email || !verificationCode) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        message: StatusMessage.BAD_REQUEST,
      });
    }

    const userData = userStore[email];

    if (!userData) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        message: "User not found or OTP expired.",
      });
    }

    if (userData.otp === parseInt(verificationCode, 10)) {
      const newUser = await UserModel.create(userData.userData);

      delete userStore[email];

      // access token
      const accessToken = jwt.sign(
        { id: newUser?._id, email: newUser?.email },
        process.env.JWT_SECRET || "",
        { expiresIn: "1d" }
      );

      console.log("accessToken:", accessToken);

      res.status(HttpStatusCode.OK).json({
        message: "OTP verified successfully. Welcome to your account!",
        data: userData.userData,
        accessToken,
      });
    } else {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: "Invalid OTP. Please try again.",
      });
    }
  } catch (error) {
    console.log("Error in verifyOTP:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        message: StatusMessage.BAD_REQUEST,
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        message: "User not found.",
      });
    } else {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({
          message: "Invalid password.",
        });
      }
    }

    // access token
    const accessToken = jwt.sign(
      { id: user?._id, email: user?.email },
      process.env.JWT_SECRET || "",
      { expiresIn: "1d" }
    );

    res.status(HttpStatusCode.OK).json({
      message: "Login successful.",
      data: user,
      accessToken,
    });
  } catch (error) {
    console.log("Error in login:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
    });
  }
};
