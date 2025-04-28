import express from "express";
import { verifyToken } from "../middlewares/auth";
import * as authController from "../controller/admin/auth";
import * as productController from "../controller/admin/product";
import * as orderController from "../controller/admin/order";
import * as customerController from "../controller/admin/customers";
import { upload } from "../config/multer";

const adminRoutes = express.Router();

// Define routes for admin authentication
adminRoutes.post("/auth/login", authController.login);

// Define routes for admin product management
adminRoutes.get("/products", verifyToken, productController.getAllProducts);
adminRoutes.post(
  "/products",
  verifyToken,
  upload,
  productController.addProduct
);
adminRoutes.put("/products/:id", verifyToken, productController.updateProduct);

// Define routes for admin order management
adminRoutes.get("/orders", verifyToken, orderController.getAllOrders);
adminRoutes.get("/orders/:id", verifyToken, orderController.getOrderById);
adminRoutes.patch(
  "/orders/:id/status",
  verifyToken,
  orderController.updateOrderStatus
);
// Define routes for admin customers management
adminRoutes.get("/customers", verifyToken, customerController.getAllCustomers);
adminRoutes.patch(
  "/customers/:id/activate",
  customerController.activateCustomer
);
adminRoutes.patch(
  "/customers/:id/deactivate",
  customerController.deactivateCustomer
);
adminRoutes.delete("/customers/:id", customerController.deleteCustomer);

export default adminRoutes;
