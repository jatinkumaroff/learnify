import mongoose from "mongoose";

// Cache the connection across serverless invocations so we don't open a new
// connection on every request (Vercel cold-starts each function fresh).
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log("MongoDB connected.");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
};

export default connectDB;