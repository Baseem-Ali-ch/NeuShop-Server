import express from "express";
import * as authController from "../controller/user/auth";
import * as accountController from "../controller/user/account";
import * as productController from "../controller/user/product";
// import * as checkoutController from "../controller/user/checkOut";
import { verifyToken } from "../middlewares/auth";
const userRoutes = express.Router();

// Define routes for user authentication
userRoutes.post("/auth/register", authController.register);
userRoutes.post("/auth/two-factor-verify", authController.verifyOTP);
userRoutes.post("/auth/login", authController.login);
userRoutes.post('/auth/logout', verifyToken, authController.logout);

// Define routes for user account management
userRoutes.get("/user/details", verifyToken, accountController.getUserDetails);
userRoutes.put('/user/details', verifyToken, accountController.updateUser);
userRoutes.put('/user/details/password', verifyToken, accountController.updateUserPassword);
userRoutes.post('/addresses', verifyToken, accountController.addAddress);
userRoutes.get('/addresses', verifyToken, accountController.getAddresses);
userRoutes.put('/addresses/:id', verifyToken, accountController.updateAddress);
userRoutes.delete('/addresses/:id', verifyToken, accountController.deleteAddress);
userRoutes.patch('/addresses/:id', verifyToken, accountController.setDefaultAddress);

// Define routes for product management
userRoutes.get("/products", verifyToken, productController.getProducts);
userRoutes.get("/products/:id", productController.getProductDetails);

// Define routes for checkout management
// userRoutes.post("/place-order", verifyToken, checkoutController.checkout);
// userRoutes.get("/orders", verifyToken, checkoutController.getOrders);

export default userRoutes;
