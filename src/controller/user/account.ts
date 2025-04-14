import { Response } from "express";
import { HttpStatusCode } from "../../constants/httpStatusCodes";
import { StatusMessage } from "../../constants/responseMessages";
import { UserModel } from "../../models/User";
import { IUser } from "../../interfaces/IUser";
import bcrypt from "bcrypt";

// Get user details
export const getUser = async (req: any, res: Response): Promise<void> => {
  try {
    const user_id = req.user;

    if (!user_id) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
      return;
    }

    // Find the user in the database
    const user: IUser | null = await UserModel.findById(user_id);
    console.log("user", user);
    if (!user) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        message: "User not found.",
      });
      return;
    }
    res.status(HttpStatusCode.OK).json({
      message: StatusMessage.SUCCESS,
      user,
    });
  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

// Update user details
export const updateUser = async (req: any, res: Response): Promise<void> => {
  try {
    const user_id = req.user;
    const { firstName, lastName, phone } = req.body;

    if (!user_id) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
      return;
    }

    // Find the user in the database
    const user = await UserModel.findById(user_id);
    if (!user) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        message: "User not found.",
      });
      return;
    }

    // Update user details
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;

    await user.save();

    res.status(HttpStatusCode.OK).json({
      message: StatusMessage.SUCCESS,
      user,
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

// update user password
export const updateUserPassword = async (req: any, res: Response): Promise<any> => {
  try {
    const user_id = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!user_id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
    }

    // Find the user in the database
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        message: "User not found.",
      });
    }

    
    // Check if the old password is correct
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: "Invalid password.",
      });
    }

    // Update the password
    const securePassword = await bcrypt.hash(newPassword, 10);
    user.password = securePassword;
    await user.save();

    res.status(HttpStatusCode.OK).json({
      message: StatusMessage.SUCCESS,
    });
  } catch (error) {
    console.error("Error in updatePassword:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
    });
  }
};
