import { Response } from "express";
import { OrderModel } from "../../models/Order";
import { HttpStatusCode } from "../../constants/httpStatusCodes";
import { StatusMessage } from "../../constants/responseMessages";

export const getAllOrders = async (req: any, res: Response): Promise<any> => {
  try {
    const admin_id = req.user;
    if (!admin_id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
    }
    // Fetch orders for the user
    const orders = await OrderModel.find()
      .populate({
        path: "items.productId",
        select: "name price description images",
      })
      .sort({ createdAt: -1 });
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

export const getOrderById = async (req: any, res: Response): Promise<any> => {
  try {
    const orderId = req.params.id;
    const order = await OrderModel.findById(orderId).populate({
      path: "items.productId",
      select: "name price description images",
    });

    if (!order) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: "Order not found" });
    }

    res.status(HttpStatusCode.OK).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to fetch order" });
  }
};

export const updateOrderStatus = async (
  req: any,
  res: Response
): Promise<any> => {
  try {
    console.log("req.body", req.body);
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message:
          "Invalid status. Must be one of: pending, processing, shipped, delivered, cancelled",
      });
    }

    // Find and update order
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
      }
    );

    if (!updatedOrder) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: "Order not found" });
    }

    return res.json({
      message: "Order status updated successfully",
      order: {
        _id: updatedOrder._id,
        orderId: updatedOrder.orderId,
        status: updatedOrder.status,
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to update order status" });
  }
};
