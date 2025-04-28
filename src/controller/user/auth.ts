import { Request, Response } from "express";
import { HttpStatusCode } from "../../constants/httpStatusCodes";
import { StatusMessage } from "../../constants/responseMessages";
import { IUser } from "../../interfaces/IUser";
import bcrypt from "bcrypt";
import { transporter } from "../../config/nodemailer";
import jwt from "jsonwebtoken";
import { UserModel } from "../../models/User";
import redisClient from "../../config/redis";

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

    const user = await UserModel.find({ email });
    if (user) {
      return res.status(HttpStatusCode.FORBIDDEN).json({
        message: "This email is already taken.",
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

      const accessToken = jwt.sign(
        { email },
        process.env.JWT_ACCESS_SECRET || "",
        { expiresIn: "1d" }
      );

      const refreshToken = jwt.sign(
        { email },
        process.env.JWT_REFRESH_SECRET || "",
        { expiresIn: "7d" }
      );

      // Store tokens in cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(HttpStatusCode.OK).json({
        message: "OTP verified successfully. Welcome to your account!",
        data: userData.userData,
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
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: StatusMessage.BAD_REQUEST,
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        message: "User not found.",
      });
    }

    if (user.isActive === false) {
      return res.status(HttpStatusCode.FORBIDDEN).json({
        message: "This user has been blocked.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: "Invalid password.",
      });
    }

    // Generate access token
    const accessToken = jwt.sign(
      { id: user?._id, email: user?.email },
      process.env.JWT_ACCESS_SECRET || "",
      { expiresIn: "1d" }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user?._id, email: user?.email },
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
      data: user,
    });
  } catch (error) {
    console.log("Error in login:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.accessToken;

  if (token) {
    const decoded: any = jwt.decode(token);
    const expiresIn = decoded?.exp ? decoded.exp * 1000 - Date.now() : 0;

    await redisClient.set(`blacklist:${token}`, "true", "PX", expiresIn);
  }

  res.clearCookie("userAccessToken");
  res.clearCookie("userRefreshToken");

  res.status(HttpStatusCode.OK).json({
    message: "Logout successful.",
  });
};
