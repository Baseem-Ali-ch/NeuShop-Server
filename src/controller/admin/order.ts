import { Response } from "express";
import { OrderModel } from "../../models/Order";
import { HttpStatusCode } from "../../constants/httpStatusCodes";
import { StatusMessage } from "../../constants/responseMessages";
import { UserModel } from "../../models/User";

export const getAllOrders = async (req: any, res: Response): Promise<any> => {
  try {
    const admin_id = req.user;
    if (!admin_id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
    }
    // Fetch orders for the user
    const orders = await OrderModel.find();
    if (!orders || orders.length === 0) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        message: StatusMessage.NOT_FOUND,
      });
    }
    console.log("orders", orders);
    res.status(HttpStatusCode.OK).json({
      message: StatusMessage.SUCCESS,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAllCustomers = async (
  req: any,
  res: Response
): Promise<any> => {
  try {
    const admin_id = req.user;
    if (!admin_id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
    }
    // Fetch orders for the user
    const customers = await UserModel.find();
    if (!customers || customers.length === 0) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        message: StatusMessage.NOT_FOUND,
      });
    }
    console.log("customers", customers);
    res.status(HttpStatusCode.OK).json({
      message: StatusMessage.SUCCESS,
      customers,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
