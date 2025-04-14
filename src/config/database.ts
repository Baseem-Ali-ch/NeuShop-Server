import mongoose from "mongoose";

const MONGO_URI: string | undefined = process.env.MONGODB_URI;

const connectDB = async () =>
  mongoose
    .connect(MONGO_URI as string)
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((error) => {
      console.log(error);
    });

export default connectDB;
