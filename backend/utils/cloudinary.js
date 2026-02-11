import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
    api_key: "",
    api_secret: "",
    cloud_name:""
});

const isCloudinaryConfigured = () => {
    const { api_key, api_secret, cloud_name } = cloudinary.config();
    return Boolean(api_key && api_secret && cloud_name);
}

export const uploadMedia = async (file)=>{
    try {
        if (!isCloudinaryConfigured()) {
            throw new Error("Cloudinary is not configured. Update backend/utils/cloudinary.js with your keys.");
        }
        const uploadResponse = await cloudinary.uploader.upload(file,{
            resource_type:"auto"
        })
        return uploadResponse;
    } catch (error) {
        console.log("cloudinary upload error: ", error);
        return null;
    }
}
export const deleteMediaFromCloudinary = async (publicId)=>{
    try {
        if (!isCloudinaryConfigured()) return;
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.log(error);
    }
}
export const deleteVideoFromCloudinary = async (publicId)=>{
    try {
        if (!isCloudinaryConfigured()) return;
        await cloudinary.uploader.destroy(publicId,{resource_type:"video"});
    } catch (error) {
        console.log(error);
    }
}
