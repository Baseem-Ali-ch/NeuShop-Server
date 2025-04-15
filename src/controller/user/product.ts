import { Response } from "express";
import { HttpStatusCode } from "../../constants/httpStatusCodes";
import { StatusMessage } from "../../constants/responseMessages";
import { ProductModel } from "../../models/Product";

export const getProducts = async (req: any, res: Response): Promise<void> => {
  try {
    const user_id = req.user;
    if (!user_id) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
    }

    const products = await ProductModel.find();
    if (!products) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        message: StatusMessage.NOT_FOUND,
      });
    }
    res.status(HttpStatusCode.OK).json({
      message: StatusMessage.SUCCESS,
      products,
    });
  } catch (error) {
    console.error("Error in getProducts:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getProductDetails = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    console.log('id', id);
    const product = await ProductModel.findById(id);
    if (!product) {
      res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: StatusMessage.NOT_FOUND });
      return;
    }
    res.status(HttpStatusCode.OK).json({
      message: StatusMessage.SUCCESS,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
