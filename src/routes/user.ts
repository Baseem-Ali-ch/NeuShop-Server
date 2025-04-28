import express from "express";
import * as authController from "../controller/user/auth";
import * as accountController from "../controller/user/account";
import * as productController from "../controller/user/product";
import * as checkoutController from "../controller/user/checkout";
import { verifyToken } from "../middlewares/auth";
const userRoutes = express.Router();

// Define routes for user authentication
userRoutes.post("/auth/register", authController.register);
userRoutes.post("/auth/two-factor-verify", authController.verifyOTP);
userRoutes.post("/auth/login", authController.login);
userRoutes.post("/auth/logout", verifyToken, authController.logout);

// Define routes for user account management
userRoutes.get("/user/details", verifyToken, accountController.getUserDetails);
userRoutes.put("/user/details", verifyToken, accountController.updateUser);
userRoutes.put(
  "/user/details/password",
  verifyToken,
  accountController.updateUserPassword
);

// Define routes for user account management
userRoutes.post("/addresses", verifyToken, accountController.addAddress);
userRoutes.get("/addresses", verifyToken, accountController.getAddresses);
userRoutes.put("/addresses/:id", verifyToken, accountController.updateAddress);
userRoutes.delete(
  "/addresses/:id",
  verifyToken,
  accountController.deleteAddress
);
userRoutes.patch(
  "/addresses/:id",
  verifyToken,
  accountController.setDefaultAddress
);

userRoutes.get(
  "/payment-methods",
  verifyToken,
  accountController.getPaymentMethods
);
userRoutes.post(
  "/payment-methods",
  verifyToken,
  accountController.addPaymentMethod
);
userRoutes.put(
  "/payment-methods/:id",
  verifyToken,
  accountController.updatePaymentMethod
);
userRoutes.delete(
  "/payment-methods/:id",
  verifyToken,
  accountController.deletePaymentMethod
);
userRoutes.patch(
  "/payment-methods/:id",
  verifyToken,
  accountController.setDefaultPaymentMethod
);
userRoutes.get('/orders', verifyToken, accountController.getOrders);
userRoutes.get('/wallet', verifyToken, accountController.getWallet);

// Define routes for product management
userRoutes.get("/products", productController.getProducts);
userRoutes.get("/products/:id", productController.getProductDetails);

// Define routes for checkout management
userRoutes.get("/cart", verifyToken, checkoutController.getCart);
userRoutes.post("/cart", verifyToken, checkoutController.addToCart);
userRoutes.put("/cart", verifyToken, checkoutController.updateCartItem);
userRoutes.delete("/cart", verifyToken, checkoutController.removeFromCart);
userRoutes.delete("/cart/clear", verifyToken, checkoutController.clearCart);
// userRoutes.get("/addresses", verifyToken, checkoutController.addresses);
// userRoutes.get("/payment-methods", verifyToken, checkoutController.paymentMethods);
userRoutes.post("/place-orders", verifyToken, checkoutController.placeOrder);
userRoutes.get("/orders", verifyToken, checkoutController.getOrders);
userRoutes.get("/orders/:id", verifyToken, checkoutController.getOrderById);
userRoutes.post('/orders/:id/cancel', verifyToken, checkoutController.cancelOrder);
userRoutes.post('/orders/:id/return', verifyToken, checkoutController.returnOrder);

export default userRoutes;
