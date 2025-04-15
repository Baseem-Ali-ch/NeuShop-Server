import express from "express";
import { verifyToken } from "../middlewares/auth";
import * as authController from "../controller/admin/auth";
import * as productController from "../controller/admin/product";
import { upload } from "../config/multer";
const adminRoutes = express.Router();

// Define routes for admin authentication
adminRoutes.post("/auth/login", authController.login);

// Define routes for admin product management
adminRoutes.post("/product", verifyToken, upload, productController.createProduct);
adminRoutes.get("/products", verifyToken, productController.getAllProducts);

export default adminRoutes;
