import "dotenv/config";
import mongoose from "mongoose";
import { MONGO_URL, PORT } from "./config/config.js";
import app from "./app.js";

mongoose.connect(MONGO_URL).then(() => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Laundry Service Booking Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error("Error connecting to MongoDB:", error);
});