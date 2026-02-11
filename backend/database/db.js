import mongoose from "mongoose";
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/learnify");
        console.log("MONGODB connected!!");
    } catch (error) {
        console.log("Failed to connect to local MongoDB at mongodb://127.0.0.1:27017/learnify");
        console.log(error);
    }
}
export default connectDB;
