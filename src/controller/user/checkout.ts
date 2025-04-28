import { Request, Response } from "express";
import { HttpStatusCode } from "../../constants/httpStatusCodes";
import { CartModel } from "../../models/Cart";
import { ProductModel } from "../../models/Product";
import { AddressModel } from "../../models/Address";
import { PaymentModel } from "../../models/Payment";
import { OrderModel } from "../../models/Order";
import mongoose from "mongoose";
import { WalletModel } from "../../models/Wallet";

export const getCart = async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.user.id;

    const cart = await CartModel.findOne({ userId }).populate({
      path: "items.productId",
      select: "name description price images",
    });
    if (!cart) {
      return res.status(HttpStatusCode.OK).json({ items: [] });
    }

    res.status(HttpStatusCode.OK).json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch cart.",
    });
  }
};

export const addToCart = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    // Map `id` to `productId`
    const { id: productId, quantity, color, size } = req.body;

    console.log("req.body", req.body);

    let cart = await CartModel.findOne({ userId });

    if (!cart) {
      cart = new CartModel({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.productId.equals(productId) &&
        item.color === color &&
        item.size === size
    );

    console.log("existingItem", existingItem);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, color, size });
    }

    await cart.save();

    res.status(HttpStatusCode.OK).json({
      message: "Product added to cart successfully.",
      cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: "Failed to add product to cart.",
    });
  }
};

export const updateCartItem = async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.user.id;
    const { productId, quantity, variant } = req.body;

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        message: "Cart not found.",
      });
    }

    const item = cart.items.find(
      (item) =>
        item.productId.toString() === productId && item.color === variant
    );

    if (!item) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        message: "Product not found in cart.",
      });
    }

    item.quantity = quantity;

    await cart.save();

    res.status(HttpStatusCode.OK).json({
      message: "Cart item updated successfully.",
      cart,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: "Failed to update cart item.",
    });
  }
};

export const removeFromCart = async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.user.id;
    const { productId, variant } = req.body;

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        message: "Cart not found.",
      });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(item.productId.toString() === productId && item.color === variant)
    );

    await cart.save();

    res.status(HttpStatusCode.OK).json({
      message: "Product removed from cart successfully.",
      cart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: "Failed to remove product from cart.",
    });
  }
};

export const clearCart = async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.user.id;

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        message: "Cart not found.",
      });
    }

    cart.items = [];
    await cart.save();

    res.status(HttpStatusCode.OK).json({
      message: "Cart cleared successfully.",
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: "Failed to clear cart.",
    });
  }
};

// export const addresses = async (req: any, res: Response): Promise<any> => {
//   try {
//     const userId = req.user.id;
//     const addresses = await AddressModel.find({ userId });
//     res.status(HttpStatusCode.OK).json({ addresses });
//   } catch (error) {
//     console.error("Error fetching addresses:", error);
//     res
//       .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
//       .json({ message: "Failed to fetch addresses" });
//   }
// };

// export const paymentMethods = async (req: any, res: Response): Promise<any> => {
//   try {
//     const userId = req.user.id;
//     const paymentMethods = await PaymentModel.find({ userId });
//     res.status(HttpStatusCode.OK).json({ paymentMethods });
//   } catch (error) {
//     console.error("Error fetching payment methods:", error);
//     res
//       .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
//       .json({ message: "Failed to fetch payment methods" });
//   }
// };

export const placeOrder = async (req: any, res: Response): Promise<any> => {
  try {
    const { paymentInfo, shippingInfo, items, subtotal, total, tax } = req.body;

    // Validate required fields
    if (
      !paymentInfo ||
      !shippingInfo ||
      !items ||
      !subtotal ||
      !total ||
      !tax
    ) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "All fields are required" });
    }

    // Fetch product details for each item
    const populatedItems = await Promise.all(
      items.map(async (item: any) => {
        const product = await ProductModel.findById(item.productId).select(
          "name price description images"
        );
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        return {
          productId: item.productId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        };
      })
    );

    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    // Create a new order
    const order = new OrderModel({
      userId: req.user.id,
      paymentInfo,
      shippingInfo,
      items: populatedItems, // Use populated items
      subtotal,
      total,
      tax,
      orderId,
    });

    // Save the order to the database
    const savedOrder = await order.save();

    if (savedOrder) {
      await CartModel.findOneAndUpdate({ userId: req.user.id }, { items: [] });
    }

    res.status(HttpStatusCode.CREATED).json({
      message: "Order placed successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to place order" });
  }
};

export const getOrders = async (req: any, res: Response): Promise<any> => {
  try {
    const orders = await OrderModel.find({ userId: req.user.id })
      .populate({
        path: "items.productId",
        select: "name price description images",
      })
      .sort({ createdAt: -1 });

    res.status(HttpStatusCode.OK).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to fetch orders" });
  }
};

export const getOrderById = async (req: any, res: Response): Promise<any> => {
  try {
    const order = await OrderModel.findById(req.params.id).populate({
      path: "items.productId",
      select: "name price description images",
    });

    if (!order || order.userId.toString() !== req.user.id) {
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

export const cancelOrder = async (req: any, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    // Validate reason
    if (!reason) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Cancellation reason is required",
      });
    }

    // Find the order first to check status
    const order = await OrderModel.findOne({ _id: id, userId });

    if (!order) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: "Order not found" });
    }

    // Check if order can be cancelled
    if (!order.status) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Order cannot be cancelled as it is ${order.status}`,
      });
    }

    // Update order with cancellation details
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      {
        status: "cancelled",
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
      {
        new: true,
      }
    );

    return res.json({
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to cancel order" });
  }
};

export const returnOrder = async (req: any, res: Response): Promise<any> => {
  try {
    console.log("Return order request:", req.body);
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    if (!reason || reason.trim().length === 0) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Return reason is required",
      });
    }

    const order = await OrderModel.findOne({ _id: id, userId });

    if (!order) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: "Order not found" });
    }

    // if (order.status!.includes("Delivered")) {
    //   return res.status(HttpStatusCode.BAD_REQUEST).json({
    //     message: `Order cannot be returned as it is ${order.status}. Only delivered orders can be returned.`,
    //   });
    // }

    try {
      // Update order status
      const updatedOrder = await OrderModel.findByIdAndUpdate(
        id,
        {
          status: "returned",
          returnReason: reason,
          returnedAt: new Date(),
        },
        {
          new: true,
        }
      );

      if (order.paymentStatus?.includes("Paid")) {
        // Find or create wallet
        let wallet = await WalletModel.findOne({ userId });
        if (!wallet) {
          wallet = new WalletModel({ userId, balance: 0, transactions: [] });
        }

        const refundAmount = order.total;
        wallet.balance += refundAmount;
        wallet.transactions.push({
          amount: refundAmount,
          type: "credit",
          description: `Refund for returned order ${order.orderId}`,
          orderId: order.orderId,
          createdAt: new Date(),
        });

        await wallet.save();
        return res.status(HttpStatusCode.OK).json({
          message: "Order returned and refund processed successfully",
          order: updatedOrder,
          wallet: {
            balance: wallet.balance,
            lastTransaction: wallet.transactions[wallet.transactions.length - 1],
          },
        });
      }

      return res.status(HttpStatusCode.OK).json({
        message: "Order returned successfully",
        order: updatedOrder,
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error processing return request:", error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: "Failed to process return request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};;
