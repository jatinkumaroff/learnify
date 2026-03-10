import express from "express";
import upload from "../utils/multer.js";
import { uploadMedia } from "../utils/cloudinary.js";

const router = express.Router();

router.route("/upload-video").post(upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        
        const b64 = req.file.buffer.toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        const result = await uploadMedia(dataURI);
        if (!result) {
            return res.status(500).json({
                success: false,
                message: "Cloudinary upload failed. Check CLOUDINARY_* env vars on Vercel.",
            });
        }
        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            data: result,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ success: false, message: "Error uploading file" });
    }
});

export default router;