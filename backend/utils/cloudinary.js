import {v2 as cloudinary} from "cloudinary";

// NOTE: cloudinary.config() is called lazily inside each function because with
// ES modules all imports are hoisted and execute before dotenv.config() runs in
// index.js. Reading process.env at function call time (not module load time)
// guarantees the env vars are already populated.
const configure = () => {
    cloudinary.config({
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    });
};

const isCloudinaryConfigured = () => {
    return Boolean(
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET &&
        process.env.CLOUDINARY_CLOUD_NAME
    );
};

export const uploadMedia = async (file) => {
    try {
        if (!isCloudinaryConfigured()) {
            throw new Error("Cloudinary env vars missing. Set CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME in .env");
        }
        configure();
        const uploadResponse = await cloudinary.uploader.upload(file, {
            resource_type: "auto"
        });
        return uploadResponse;
    } catch (error) {
        console.log("cloudinary upload error: ", error);
        return null;
    }
};

export const deleteMediaFromCloudinary = async (publicId) => {
    try {
        if (!isCloudinaryConfigured()) return;
        configure();
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.log(error);
    }
};

export const deleteVideoFromCloudinary = async (publicId) => {
    try {
        if (!isCloudinaryConfigured()) return;
        configure();
        await cloudinary.uploader.destroy(publicId, {resource_type: "video"});
    } catch (error) {
        console.log(error);
    }
};