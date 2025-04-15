import { Request, Response } from "express";
import { ProductModel } from "../../models/Product";
import multer from "multer";
import { HttpStatusCode } from "../../constants/httpStatusCodes";
import { StatusMessage } from "../../constants/responseMessages";

export const createProduct = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { name, description, brandId, categoryId, price, salePrice, stock } =
      req.body;

    console.log("Request body:", req.body);
    console.log("Received files:", req.files);

    // Validate required fields
    if (
      !name ||
      !price ||
      !description ||
      !brandId ||
      !categoryId ||
      stock === undefined
    ) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: StatusMessage.BAD_REQUEST });
    }

    // Get image paths
    const imagePaths = req.files
      ? (req.files as Express.Multer.File[]).map(
          (file) => `/uploads/${file.filename}`
        )
      : [];

    // Create the product
    const newProduct = await ProductModel.create({
      name,
      description,
      brandId,
      categoryId,
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : null,
      stock: parseInt(stock, 10),
      images: imagePaths,
    });

    res.status(HttpStatusCode.CREATED).json({
      message: StatusMessage.CREATED,
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    if (error instanceof multer.MulterError) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: error.message });
    }
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await ProductModel.find().lean();
    res.status(HttpStatusCode.OK).json({
      message: StatusMessage.SUCCESS,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
