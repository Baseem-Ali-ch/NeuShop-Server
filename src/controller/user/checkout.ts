import { Request, Response } from "express";
import { OrderModel } from "../../models/Order";
import { HttpStatusCode } from "../../constants/httpStatusCodes";
import { StatusMessage } from "../../constants/responseMessages";

export const checkout = async (req: any, res: Response): Promise<any> => {
  try {
    const data = req.body;
    const user_id = req.user;
    console.log("user_id", user_id);
    console.log("data", data);
    // Validate required fields
    if (!data.paymentInfo || !data.shippingInfo || !data.items || !data.total) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: StatusMessage.BAD_REQUEST });
    }

    // Generate a unique order ID
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    const orderId = `ORD-${randomNumber}`;
    // Create a new order
    const order = new OrderModel({
      ...data,
      orderId: orderId,
      userId: user_id,
    });

    // Save the order to the database
    await order.save();

    res
      .status(HttpStatusCode.CREATED)
      .json({ message: StatusMessage.CREATED, order });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getOrders = async (req: any, res: Response): Promise<any> => {
  try {
    const user_id = req.user;
    if (!user_id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
    }
    // Fetch orders for the user
    const orders = await OrderModel.find({ userId: user_id });
    if (!orders || orders.length === 0) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        message: StatusMessage.NOT_FOUND,
      });
    }
    console.log('orders', orders);
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
