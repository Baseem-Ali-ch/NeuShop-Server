import express from "express";
import * as authController from "../controller/user/auth";
import * as accountController from "../controller/user/account";
import * as productController from "../controller/user/product";
import * as checkoutController from "../controller/user/checkOut";
import { verifyToken } from "../middlewares/auth";
const userRoutes = express.Router();

// Define routes for user authentication
userRoutes.post("/auth/register", authController.register);
userRoutes.post("/auth/two-factor-verify", authController.verifyOTP);
userRoutes.post("/auth/login", authController.login);

// Define routes for user account management
userRoutes.get("/user/data", verifyToken, accountController.getUser);
userRoutes.put('/user/data', verifyToken, accountController.updateUser);
userRoutes.put('/user/data/password', verifyToken, accountController.updateUserPassword);

// Define routes for product management
userRoutes.get("/products", verifyToken, productController.getProducts);
userRoutes.get("/products/:id", productController.getProductDetails);

// Define routes for checkout management
userRoutes.post("/place-order", verifyToken, checkoutController.checkout);
userRoutes.get("/orders", verifyToken, checkoutController.getOrders);

export default userRoutes;
