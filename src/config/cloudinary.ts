import cloudinary from "cloudinary";
import { unlinkSync } from "fs";
import fs from 'fs'

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath: string) => {
    try {
      console.log('Uploading file to Cloudinary:', filePath);
      
      if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        throw new Error(`File not found: ${filePath}`);
      }
      
      const result = await cloudinary.v2.uploader.upload(filePath, {
        folder: "NewShop/products",
      });
      
      console.log('Upload successful:', result.secure_url);
      
      try {
        unlinkSync(filePath);
        console.log('Local file deleted:', filePath);
      } catch (unlinkError) {
        console.error('Error deleting local file:', unlinkError);
      }
      
      return result.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      
      try {
        if (filePath && fs.existsSync(filePath)) {
          unlinkSync(filePath);
          console.log('Local file deleted after upload error:', filePath);
        }
      } catch (unlinkError) {
        console.error('Error deleting local file after upload error:', unlinkError);
      }
      
      throw error;
    }
  };