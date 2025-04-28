import { Response } from "express";
import { HttpStatusCode } from "../../constants/httpStatusCodes";
import { StatusMessage } from "../../constants/responseMessages";
import { UserModel } from "../../models/User";
import { IUser } from "../../interfaces/IUser";
import bcrypt from "bcrypt";
import { AddressModel } from "../../models/Address";
import { PaymentModel } from "../../models/Payment";
import { OrderModel } from "../../models/Order";
import { WalletModel } from "../../models/Wallet";

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

// Fetch all payment methods for a user
export const getPaymentMethods = async (
  req: any,
  res: Response
): Promise<any> => {
  try {
    const user_id = req.user.id;
    if (!user_id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
    }
    const paymentMethods = await PaymentModel.find({ userId: user_id });
    res.status(HttpStatusCode.OK).json(paymentMethods);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to fetch payment methods." });
  }
};

// Add a new payment method
export const addPaymentMethod = async (
  req: any,
  res: Response
): Promise<any> => {
  try {
    const { ...paymentData } = req.body;

    const user_id = req.user.id;
    if (!user_id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
    }

    // Create a new payment method
    const newPaymentMethod = await PaymentModel.create({
      userId: user_id,
      ...paymentData,
    });

    // If the new payment method is set as default, update other methods
    if (paymentData.isDefault) {
      await PaymentModel.updateMany(
        { userId: user_id, _id: { $ne: newPaymentMethod._id } },
        { isDefault: false }
      );
    }

    res.status(HttpStatusCode.CREATED).json(newPaymentMethod);
  } catch (error) {
    console.error("Error adding payment method:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to add payment method." });
  }
};

// Update a payment method
export const updatePaymentMethod = async (
  req: any,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { ...paymentData } = req.body;
    const user_id = req.user.id;
    if (!user_id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
    }
    const updatedPaymentMethod = await PaymentModel.findByIdAndUpdate(
      id,
      { userId: user_id, ...paymentData },
      { new: true }
    );

    if (!updatedPaymentMethod) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: "Payment method not found." });
    }

    // If the updated payment method is set as default, update other methods
    if (paymentData.isDefault) {
      await PaymentModel.updateMany(
        { userId: user_id, _id: { $ne: updatedPaymentMethod._id } },
        { isDefault: false }
      );
    }

    res.status(HttpStatusCode.OK).json(updatedPaymentMethod);
  } catch (error) {
    console.error("Error updating payment method:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to update payment method." });
  }
};

// Delete a payment method
export const deletePaymentMethod = async (
  req: any,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: StatusMessage.BAD_REQUEST,
      });
    }
    const deletedPaymentMethod = await PaymentModel.findByIdAndDelete(id);

    if (!deletedPaymentMethod) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: "Payment method not found." });
    }

    res
      .status(HttpStatusCode.OK)
      .json({ message: "Payment method deleted successfully." });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to delete payment method." });
  }
};

// Set a payment method as default
export const setDefaultPaymentMethod = async (
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
    // Set the selected payment method as default
    await PaymentModel.findByIdAndUpdate(id, { isDefault: true });

    // Update other payment methods to not be default
    await PaymentModel.updateMany(
      { userId: user_id, _id: { $ne: id } },
      { isDefault: false }
    );

    res
      .status(HttpStatusCode.OK)
      .json({ message: "Default payment method updated." });
  } catch (error) {
    console.error("Error setting default payment method:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to set default payment method." });
  }
};

export const getOrders = async (req: any, res: Response): Promise<any> => {
  try {
    const user_id = req.user.id;
    if (!user_id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
    }
    const orders = await OrderModel.find({ userId: user_id });
    res.status(HttpStatusCode.OK).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to fetch orders." });
  }
};

export const getWallet = async (req: any, res: Response): Promise<any> => {
  try {
    const user_id = req.user.id;
    if (!user_id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
    }
    const wallet = await WalletModel.find({ userId: user_id });
    console.log("Wallet:", wallet);
    res.status(HttpStatusCode.OK).json(wallet);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to fetch wallet." });
  }
};
