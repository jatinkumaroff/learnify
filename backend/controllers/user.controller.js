import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
export const register  = async(req,res)=>{
    try {
        const{name,email,password, role = "student"} = req.body;
        if(!name || !password || !email){
            return res.status(400).json({
                success: false,
                message:"All fields are required",
            })
        }
        if (!["student", "instructor"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role selected",
            });
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({
                success:false,
                message:"User already exists",
            })
        }
        const hashedPassword = await bcrypt.hash(password,10);
        await User.create({
            name,
            email,
            password:hashedPassword,
            role,
        });
        return res.status(201).json({
            success:true,
            message:"Account created successfully",
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:"failed to register",
        })
    }
}
export const login  = async(req,res)=>{
    try {
        const{email,password} = req.body;
        if(!password || !email){
            return res.status(400).json({
                success: false,
                message:"All fields are required",
            })
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password",
            })
        }
        const isPasswordMatch = await bcrypt.compare(password,user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password",
            })
        }
        return await generateToken(res,user,`welcome Back ${user?.name}`)
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:"failed to login",
        })
    }
}
export const logout = async(req,res) =>{
    try {
        return res.status(200).cookie("token","",{maxAge:0}).json({
            success:true,
            message:"Successfully Logged Out",
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"failed to logout"
        })
    }
}
export const getUserProfile = async(req,res)=>{
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password").populate("enrolledCourses");
        if(!user){
            return res.status(401).json({
                message:"User not found",
                success:false,
            })
        }
        return res.status(200).json({
            success:true,
            user,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"failed to get user profile"
        })
    }
}
export const updateProfile = async (req,res)=>{
    try {
        const userId = req.id;
        const {name} = req.body;
        const profilePhoto = req.file;

        const user = await User.findById(userId);
        if(!user){
            return res.status(401).json({
                message:"User not found",
                success:false,
            })
        }

        const updatedData = {};
        if (name) updatedData.name = name;

        // Only process photo if one was actually uploaded
        if (profilePhoto) {
            // Remove old photo from cloudinary
            if(user?.photoUrl){
                const publicId = user.photoUrl.split("/").pop().split(".")[0];
                deleteMediaFromCloudinary(publicId);
            }
            const cloudResponse = await uploadMedia(profilePhoto.path);
            if (!cloudResponse?.secure_url) {
                return res.status(500).json({
                    message:"Cloudinary is not configured. Update backend/utils/cloudinary.js",
                    success:false,
                });
            }
            updatedData.photoUrl = cloudResponse.secure_url;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {new:true}).select("-password");

        return res.status(200).json({
            success:true,
            message:"Profile updated successfully",
            user:updatedUser
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to update profile",
            success:false,
        })
        
    }
}