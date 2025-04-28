import { Request, Response } from "express";
import { ProductModel } from "../../models/Product";
import multer from "multer";
import { HttpStatusCode } from "../../constants/httpStatusCodes";
import { StatusMessage } from "../../constants/responseMessages";
import sanitizeHtml from "sanitize-html";
import { uploadToCloudinary } from "../../config/cloudinary";

export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await ProductModel.find()
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

// Add a new product
export const addProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];

    const filesByField: { [fieldname: string]: Express.Multer.File[] } = {};
    files.forEach((file) => {
      if (!filesByField[file.fieldname]) {
        filesByField[file.fieldname] = [];
      }
      filesByField[file.fieldname].push(file);
    });

    const productImageUrls: string[] = [];
    if (
      filesByField["productImages"] &&
      filesByField["productImages"].length > 0
    ) {
      console.log(
        `Processing ${filesByField["productImages"].length} product images`
      );
      for (const file of filesByField["productImages"]) {
        try {
          const imageUrl = await uploadToCloudinary(file.path);
          productImageUrls.push(imageUrl);
          console.log(`Added product image URL: ${imageUrl}`);
        } catch (uploadError) {
          console.error("Error uploading product image:", uploadError);
        }
      }
    }
    const variantImagesMap: { [key: string]: string[] } = {};

    for (const fieldName in filesByField) {
      if (fieldName.includes("variantImages_")) {
        const variantIdentifier = fieldName.split("variantImages_")[1];
        const variantId = variantIdentifier.split("-")[0];

        console.log(
          `Processing variant images for ID: ${variantId} from field: ${fieldName}`
        );

        if (!variantImagesMap[variantId]) {
          variantImagesMap[variantId] = [];
        }

        for (const file of filesByField[fieldName]) {
          try {
            const imageUrl = await uploadToCloudinary(file.path);
            variantImagesMap[variantId].push(imageUrl);
            console.log(
              `Added variant image URL for ${variantId}: ${imageUrl}`
            );
          } catch (uploadError) {
            console.error(
              `Error uploading variant image for ${variantId}:`,
              uploadError
            );
          }
        }
      }
    }

    let variants = [];
    if (req.body.variants) {
      try {
        variants = JSON.parse(req.body.variants);
        console.log("Parsed variants:", JSON.stringify(variants, null, 2));

        variants = variants.map((variant: any, variantIndex: number) => {
          if (variant.options && Array.isArray(variant.options)) {
            variant.options = variant.options.map(
              (option: any, optionIndex: number) => {
                const variantId = String(variantIndex);

                if (variantImagesMap[variantId]) {
                  option.images = variantImagesMap[variantId];
                  console.log(
                    `Attached ${variantImagesMap[variantId].length} images to variant ${variantIndex}, option "${option.value}"`
                  );
                }
                return option;
              }
            );
          }
          return variant;
        });
      } catch (error) {
        console.error("Error parsing variants:", error);
        variants = [];
      }
    } 
    console.log("Variants with images:", JSON.stringify(variants, null, 2));

    const productData = {
      ...req.body,
      images: productImageUrls,
      variants,
      price: Number(req.body.price),
      salePrice: req.body.salePrice ? Number(req.body.salePrice) : undefined,
      costPerItem: req.body.costPerItem
        ? Number(req.body.costPerItem)
        : undefined,
      stock: Number(req.body.stock),
      lowStockThreshold: req.body.lowStockThreshold
        ? Number(req.body.lowStockThreshold)
        : 5,
      tags:
        req.body.tags && req.body.tags.length > 0
          ? req.body.tags.split(",").map((tag: string) => tag.trim())
          : [],
    };

    delete productData.productImages;
    Object.keys(productData).forEach((key) => {
      if (key.includes("variantImages_")) {
        delete productData[key];
      }
    });

    console.log("Product data to save:", JSON.stringify(productData, null, 2));

    if (!productData.images || productData.images.length === 0) {
      throw new Error("Product images are required");
    }

    const newProduct = await ProductModel.create(productData);

    res.status(HttpStatusCode.CREATED).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error: any) {
    console.error("Error adding product:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: "Failed to add product",
      error: error.message,
    });
  }
};

// Update an existing product
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const productData = req.body;

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      productData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        message: "Product not found",
      });
    }

    res.status(HttpStatusCode.OK).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: "Failed to update product",
    });
  }
};
