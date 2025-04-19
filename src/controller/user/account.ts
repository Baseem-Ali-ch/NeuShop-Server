import { Response } from "express";
import { HttpStatusCode } from "../../constants/httpStatusCodes";
import { StatusMessage } from "../../constants/responseMessages";
import { UserModel } from "../../models/User";
import { IUser } from "../../interfaces/IUser";
import bcrypt from "bcrypt";
import { AddressModel } from "../../models/Address";

// Get user details
export const getUserDetails = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const user_id = req.user.id;
    if (!user_id) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
      return;
    }

    // Find the user in the database
    const user: IUser | null = await UserModel.findById(user_id);
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
    const user_id = req.user.id;
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
export const updateUserPassword = async (
  req: any,
  res: Response
): Promise<any> => {
  try {
    const user_id = req.user.id;
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
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
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

// Add a new address
export const addAddress = async (req: any, res: Response): Promise<any> => {
  try {
    const { ...addressData } = req.body;
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
    }
    if (!addressData) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: StatusMessage.BAD_REQUEST,
      });
    }

    // Create a new address
    const newAddress = await AddressModel.create({
      userId: user_id,
      ...addressData,
    });

    // If the new address is set as default, update other addresses
    if (addressData.isDefault) {
      await AddressModel.updateMany(
        { user_id, _id: { $ne: newAddress._id } },
        { isDefault: false }
      );
    }

    res.status(HttpStatusCode.CREATED).json(newAddress);
  } catch (error) {
    console.error("Error adding address:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to add address." });
  }
};

// Get all addresses for a user
export const getAddresses = async (req: any, res: Response): Promise<any> => {
  try {
    const user_id = req.user.id;
    if (!user_id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
    }
    const addresses = await AddressModel.find({ userId: user_id });
    res.status(HttpStatusCode.OK).json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to fetch addresses." });
  }
};

// Update an address
export const updateAddress = async (req: any, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { ...addressData } = req.body;
    const user_id = req.user.id;
    if (!user_id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
    }
    if (!addressData) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: StatusMessage.BAD_REQUEST,
      });
    }
    // Update the address
    const updatedAddress = await AddressModel.findByIdAndUpdate(
      id,
      { userId: user_id, ...addressData },
      { new: true }
    );

    if (!updatedAddress) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: StatusMessage.NOT_FOUND });
    }

    // If the updated address is set as default, update other addresses
    if (addressData.isDefault) {
      await AddressModel.updateMany(
        { userId: user_id, _id: { $ne: updatedAddress._id } },
        { isDefault: false }
      );
    }

    res.status(HttpStatusCode.OK).json(updatedAddress);
  } catch (error) {
    console.error("Error updating address:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to update address." });
  }
};

// Delete an address
export const deleteAddress = async (req: any, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: StatusMessage.BAD_REQUEST,
      });
    }
    // Delete the address
    const deletedAddress = await AddressModel.findByIdAndDelete(id);

    if (!deletedAddress) {
      return res.status(404).json({ message: "Address not found." });
    }

    res.status(200).json({ message: "Address deleted successfully." });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Failed to delete address." });
  }
};

// Set an address as default
export const setDefaultAddress = async (
  req: any,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    if (!user_id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
    }
    if (!id) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: StatusMessage.BAD_REQUEST,
      });
    }

    // Set the address as default
    const updatedAddress = await AddressModel.findByIdAndUpdate(
      id,
      { userId: user_id, isDefault: true },
      { new: true }
    );

    if (!updatedAddress) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: StatusMessage.NOT_FOUND });
    }

    // Update other addresses to not be default
    await AddressModel.updateMany(
      { userId: user_id, _id: { $ne: updatedAddress._id } },
      { isDefault: false }
    );

    res.status(HttpStatusCode.OK).json(updatedAddress);
  } catch (error) {
    console.error("Error setting default address:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to set default address." });
  }
};
